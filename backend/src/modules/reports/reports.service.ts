import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import { constants } from 'fs';
import { access, readFile } from 'fs/promises';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { Workbook } from 'exceljs';
import { DailySalesPointDto } from './dto/daily-sales-point.dto';

interface DailySalesRow {
  sale_date: Date | string;
  total_items: string | number | null;
  total_amount: string | number | null;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async getDailySales(): Promise<DailySalesPointDto[]> {
    const rows = (await this.dataSource.query(
      `SELECT sale_date, total_items, total_amount FROM vw_sales_by_day ORDER BY sale_date`,
    )) as DailySalesRow[];

    return rows.map((row) => this.mapRowToDto(row));
  }

  async generateSalesExcel(): Promise<{ buffer: Buffer; filename: string }> {
    const points = await this.getDailySales();
    const workbook = new Workbook();
    workbook.creator = 'Slipknot Shop';
    workbook.lastModifiedBy = 'Slipknot Shop';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet('Продажи по дням');
    worksheet.columns = [
      { header: 'Дата', key: 'date', width: 18 },
      { header: 'Количество товаров', key: 'items', width: 24 },
      { header: 'Сумма продаж, ₽', key: 'amount', width: 22 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    let totalItems = 0;
    let totalAmount = 0;

    points.forEach((point) => {
      const saleDate = new Date(point.saleDate);
      worksheet.addRow({
        date: saleDate.toLocaleDateString('ru-RU'),
        items: point.totalItems,
        amount: point.totalAmount,
      });
      totalItems += point.totalItems;
      totalAmount += point.totalAmount;
    });

    const totalRow = worksheet.addRow({
      date: 'Итого',
      items: totalItems,
      amount: totalAmount,
    });
    totalRow.font = { bold: true };
    totalRow.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    worksheet.getColumn('items').alignment = { horizontal: 'center' };
    worksheet.getColumn('amount').numFmt = '#,##0.00';

    worksheet.addConditionalFormatting({
      ref: `C2:C${worksheet.rowCount}`,
      rules: [
        {
          type: 'top10',
          priority: 1,
          percent: true,
          rank: 10,
          bottom: false,
          style: { font: { bold: true } },
        },
      ],
    });

    const filename = `sales-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    return { buffer, filename };
  }

  private mapRowToDto(row: DailySalesRow): DailySalesPointDto {
    const saleDate =
      row.sale_date instanceof Date
        ? row.sale_date.toISOString().slice(0, 10)
        : new Date(row.sale_date).toISOString().slice(0, 10);

    return {
      saleDate,
      totalItems: Number(row.total_items ?? 0),
      totalAmount: Number(row.total_amount ?? 0),
    };
  }

  async createDatabaseBackup(): Promise<{ buffer: Buffer; filename: string }> {
    const { host, port, username, password, database } = this.getDatabaseConnectionConfig();

    const dumpArgs = ['-h', host, '-p', String(port), '-U', username, database];
    const env = { ...process.env, PGPASSWORD: password ?? '' };
    const chunks: Buffer[] = [];
    const errorChunks: string[] = [];

    return new Promise((resolve, reject) => {
      const dumpProcess = spawn('pg_dump', dumpArgs, { env });

      dumpProcess.stdout.on('data', (data: Buffer) => {
        chunks.push(Buffer.from(data));
      });

      dumpProcess.stderr.on('data', (data: Buffer) => {
        errorChunks.push(data.toString());
      });

      dumpProcess.on('error', (error) => {
        reject(new Error(`Не удалось запустить pg_dump: ${error.message}`));
      });

      dumpProcess.on('close', (code) => {
        if (code !== 0) {
          const errorMessage = errorChunks.join('').trim() || 'Неизвестная ошибка pg_dump';
          reject(new Error(`pg_dump завершился с кодом ${code}: ${errorMessage}`));
          return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `database-backup-${timestamp}.sql`;
        resolve({ buffer: Buffer.concat(chunks), filename });
      });
    });
  }

  async restoreDatabaseFromScript(): Promise<'backup' | 'schema'> {
    const { host, port, username, password, database } = this.getDatabaseConnectionConfig();
    const scriptsDirectory = join(process.cwd(), 'database');
    const scriptPath = join(scriptsDirectory, 'restore.sql');

    try {
      await access(scriptPath, constants.R_OK);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'restore.sql недоступен для чтения';
      throw new Error(`Не удалось получить доступ к restore.sql: ${message}`);
    }

    const env = {
      ...process.env,
      PGPASSWORD: password ?? '',
      DATABASE_HOST: host,
      DATABASE_PORT: String(port),
      DATABASE_USER: username,
      DATABASE_PASSWORD: password ?? '',
      DATABASE_NAME: database,
    };

    const backupDumpPath = join(scriptsDirectory, 'backup.sql');
    let useBackupDump = false;

    try {
      await access(backupDumpPath, constants.R_OK);
      const content = await readFile(backupDumpPath, 'utf-8');
      const normalized = content.trim();
      const containsPgDumpDirective = /\\!\s*pg_dump/i.test(normalized);
      useBackupDump = normalized.length > 0 && !containsPgDumpDirective;
    } catch {
      useBackupDump = false;
    }

    const targetFile = useBackupDump
      ? backupDumpPath
      : await this.resolveSchemaPath(scriptsDirectory);

    await new Promise<void>((resolve, reject) => {
      const args = [
        '-v',
        'ON_ERROR_STOP=1',
        '-h',
        host,
        '-p',
        String(port),
        '-U',
        username,
        '-d',
        database,
        '-f',
        targetFile,
      ];

      const restoreProcess = spawn('psql', args, { env, cwd: scriptsDirectory });
      const errorChunks: string[] = [];

      restoreProcess.stderr.on('data', (data: Buffer) => {
        errorChunks.push(data.toString());
      });

      restoreProcess.on('error', (processError) => {
        reject(
          new Error(
            `Не удалось запустить psql для ${targetFile}: ${(processError as Error).message}`,
          ),
        );
      });

      restoreProcess.on('close', (code) => {
        if (code !== 0) {
          const errorMessage = errorChunks.join('').trim() || 'Неизвестная ошибка psql';
          reject(new Error(`psql завершился с кодом ${code}: ${errorMessage}`));
          return;
        }

        resolve();
      });
    });

    return useBackupDump ? 'backup' : 'schema';
  }

  private async resolveSchemaPath(directory: string): Promise<string> {
    const schemaPath = join(directory, 'schema.sql');
    try {
      await access(schemaPath, constants.R_OK);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'schema.sql недоступен';
      throw new Error(`Не удалось восстановить базу данных: ${message}`);
    }

    return schemaPath;
  }

  private getDatabaseConnectionConfig(): {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  } {
    const resolveValue = (keys: string[], fallback?: string): string | undefined => {
      for (const key of keys) {
        const value = this.configService.get<string>(key);
        if (value !== undefined && value !== null && value !== '') {
          return value;
        }
      }
      return fallback;
    };

    const portValue = resolveValue(['DATABASE_PORT', 'DB_PORT']);
    const port = portValue ? Number.parseInt(portValue, 10) : 5432;

    return {
      host: resolveValue(['DATABASE_HOST', 'DB_HOST'], 'localhost') ?? 'localhost',
      port: Number.isNaN(port) ? 5432 : port,
      username: resolveValue(['DATABASE_USER', 'DB_USER'], 'postgres') ?? 'postgres',
      password: resolveValue(['DATABASE_PASSWORD', 'DB_PASSWORD'], 'postgres') ?? 'postgres',
      database: resolveValue(['DATABASE_NAME', 'DB_NAME'], 'slipknot_shop') ?? 'slipknot_shop',
    };
  }
}
