import { Injectable } from '@nestjs/common';
import { constants } from 'fs';
import { access, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { DataSource, QueryRunner } from 'typeorm';
import { Workbook } from 'exceljs';
import { DailySalesPointDto } from './dto/daily-sales-point.dto';

interface DailySalesRow {
  sale_date: Date | string;
  total_items: string | number | null;
  total_amount: string | number | null;
}

interface TableColumnDefinition {
  column_name: string;
  data_type: string;
  udt_name: string;
  is_identity: 'YES' | 'NO';
  column_default: string | null;
}

interface ForeignKeyDependencyRow {
  table_name: string;
  referenced_table_name: string;
}

@Injectable()
export class ReportsService {
  constructor(private readonly dataSource: DataSource) {}

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

    const dailyWorksheet = workbook.addWorksheet('Продажи по дням');
    dailyWorksheet.columns = [
      { header: 'Дата', key: 'date', width: 18 },
      { header: 'Количество товаров', key: 'items', width: 24 },
      { header: 'Сумма продаж, ₽', key: 'amount', width: 22 },
    ];

    dailyWorksheet.getRow(1).font = { bold: true };
    dailyWorksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    let totalItems = 0;
    let totalAmount = 0;

    points.forEach((point) => {
      const saleDate = new Date(point.saleDate);
      dailyWorksheet.addRow({
        date: saleDate.toLocaleDateString('ru-RU'),
        items: point.totalItems,
        amount: point.totalAmount,
      });
      totalItems += point.totalItems;
      totalAmount += point.totalAmount;
    });

    const totalRow = dailyWorksheet.addRow({
      date: 'Итого',
      items: totalItems,
      amount: totalAmount,
    });
    totalRow.font = { bold: true };
    totalRow.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    dailyWorksheet.getColumn('items').alignment = { horizontal: 'center' };
    dailyWorksheet.getColumn('amount').numFmt = '#,##0.00';

    dailyWorksheet.addConditionalFormatting({
      ref: `C2:C${dailyWorksheet.rowCount}`,
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

    const cumulativeWorksheet = workbook.addWorksheet('Накопительный итог');
    cumulativeWorksheet.columns = [
      { header: 'Дата', key: 'date', width: 18 },
      { header: 'Накопительная сумма, ₽', key: 'cumulativeAmount', width: 28 },
      { header: 'Накопительно товаров, шт.', key: 'cumulativeItems', width: 30 },
    ];

    cumulativeWorksheet.getRow(1).font = { bold: true };
    cumulativeWorksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    let runningAmount = 0;
    let runningItems = 0;

    points.forEach((point) => {
      const saleDate = new Date(point.saleDate);
      runningAmount += point.totalAmount;
      runningItems += point.totalItems;
      cumulativeWorksheet.addRow({
        date: saleDate.toLocaleDateString('ru-RU'),
        cumulativeAmount: runningAmount,
        cumulativeItems: runningItems,
      });
    });

    cumulativeWorksheet.getColumn('cumulativeAmount').numFmt = '#,##0.00';
    cumulativeWorksheet.getColumn('cumulativeItems').alignment = {
      horizontal: 'center',
    };

    const weekdayWorksheet = workbook.addWorksheet('Продажи по дням недели');
    weekdayWorksheet.columns = [
      { header: 'День недели', key: 'weekday', width: 20 },
      { header: 'Выручка, ₽', key: 'amount', width: 22 },
      { header: 'Товары, шт.', key: 'items', width: 18 },
    ];

    weekdayWorksheet.getRow(1).font = { bold: true };
    weekdayWorksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    const weekdayOrder: Array<{ label: string; index: number }> = [
      { label: 'Понедельник', index: 1 },
      { label: 'Вторник', index: 2 },
      { label: 'Среда', index: 3 },
      { label: 'Четверг', index: 4 },
      { label: 'Пятница', index: 5 },
      { label: 'Суббота', index: 6 },
      { label: 'Воскресенье', index: 0 },
    ];

    const totalsByWeekday = new Map<number, { amount: number; items: number }>();

    points.forEach((point) => {
      const date = new Date(point.saleDate);
      const weekdayIndex = date.getDay();
      const currentTotals = totalsByWeekday.get(weekdayIndex) ?? {
        amount: 0,
        items: 0,
      };

      totalsByWeekday.set(weekdayIndex, {
        amount: currentTotals.amount + point.totalAmount,
        items: currentTotals.items + point.totalItems,
      });
    });

    weekdayOrder.forEach(({ label, index }) => {
      const totals = totalsByWeekday.get(index) ?? { amount: 0, items: 0 };
      weekdayWorksheet.addRow({
        weekday: label,
        amount: totals.amount,
        items: totals.items,
      });
    });

    weekdayWorksheet.getColumn('amount').numFmt = '#,##0.00';
    weekdayWorksheet.getColumn('items').alignment = { horizontal: 'center' };

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
    const script = await this.generateDatabaseBackupScript();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database-backup-${timestamp}.sql`;
    const scriptsDirectory = join(process.cwd(), 'database');
    const backupPath = join(scriptsDirectory, 'backup.sql');

    await this.persistBackupScript(backupPath, script);

    return { buffer: Buffer.from(script, 'utf-8'), filename };
  }

  async restoreDatabaseFromScript(): Promise<'backup' | 'schema'> {
    const scriptsDirectory = join(process.cwd(), 'database');
    const backupPath = join(scriptsDirectory, 'backup.sql');
    const schemaPath = join(scriptsDirectory, 'schema.sql');

    const backupScript = await this.readSqlFileIfAvailable(backupPath, true);
    const scriptToExecute =
      backupScript ?? (await this.readSqlFileIfAvailable(schemaPath));

    if (!scriptToExecute) {
      throw new Error(
        'Не удалось найти подходящий SQL-скрипт. Убедитесь, что schema.sql существует и содержит инструкции для восстановления.',
      );
    }

    const source: 'backup' | 'schema' = backupScript ? 'backup' : 'schema';

    await this.executeSqlScript(scriptToExecute);

    return source;
  }

  private async generateDatabaseBackupScript(): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const tables = await this.topologicallySortTables(queryRunner);
      const lines: string[] = [];

      lines.push(
        '-- Slipknot Shop database backup generated without external pg_dump',
      );
      lines.push(`-- Generated at ${new Date().toISOString()}`);
      lines.push("SET client_encoding = 'UTF8';");
      lines.push('SET standard_conforming_strings = ON;');
      lines.push('SET check_function_bodies = FALSE;');
      lines.push('SET search_path = public;');
      lines.push('BEGIN;');
      lines.push('SET CONSTRAINTS ALL DEFERRED;');

      for (const table of tables) {
        lines.push('');
        lines.push(`-- Table: ${table}`);
        lines.push(
          `TRUNCATE TABLE ${this.quoteIdentifier(table)} RESTART IDENTITY CASCADE;`,
        );

        const columns = await this.fetchTableColumns(queryRunner, table);
        const orderBy = columns
          .map((column) => this.quoteIdentifier(column.column_name))
          .join(', ');
        const rows = (await queryRunner.query(
          `SELECT * FROM ${this.quoteIdentifier(table)}${orderBy ? ` ORDER BY ${orderBy}` : ''}`,
        )) as Record<string, unknown>[];

        if (rows.length > 0) {
          const columnList = columns
            .map((column) => this.quoteIdentifier(column.column_name))
            .join(', ');
          for (const row of rows) {
            const values = columns
              .map((column) =>
                this.formatValue(row[column.column_name], column),
              )
              .join(', ');
            lines.push(
              `INSERT INTO ${this.quoteIdentifier(table)} (${columnList}) VALUES (${values});`,
            );
          }
        }

        const sequences = Array.from(
          new Set(
            columns
              .map((column) => this.extractSequenceName(column))
              .filter((value): value is string => Boolean(value)),
          ),
        );

        for (const sequence of sequences) {
          const identityColumn = columns.find(
            (column) => this.extractSequenceName(column) === sequence,
          );
          if (!identityColumn) {
            continue;
          }

          lines.push(
            `SELECT setval('${this.escapeLiteral(sequence)}', COALESCE((SELECT MAX(${this.quoteIdentifier(
              identityColumn.column_name,
            )}) FROM ${this.quoteIdentifier(table)}), 0) + 1, false);`,
          );
        }
      }

      lines.push('COMMIT;');

      return `${lines.join('\n')}\n`;
    } finally {
      await queryRunner.release();
    }
  }

  private async topologicallySortTables(
    queryRunner: QueryRunner,
  ): Promise<string[]> {
    const tables = await this.fetchTableNames(queryRunner);
    const dependenciesRows =
      await this.fetchForeignKeyDependencies(queryRunner);
    const dependencyMap = new Map<string, Set<string>>();
    const adjacency = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    tables.forEach((table) => {
      dependencyMap.set(table, new Set<string>());
      adjacency.set(table, new Set<string>());
      inDegree.set(table, 0);
    });

    for (const row of dependenciesRows) {
      if (
        row.table_name === row.referenced_table_name ||
        !dependencyMap.has(row.table_name) ||
        !dependencyMap.has(row.referenced_table_name)
      ) {
        continue;
      }

      dependencyMap.get(row.table_name)?.add(row.referenced_table_name);
    }

    for (const table of tables) {
      const deps = dependencyMap.get(table) ?? new Set<string>();
      for (const dep of deps) {
        adjacency.get(dep)?.add(table);
        inDegree.set(table, (inDegree.get(table) ?? 0) + 1);
      }
    }

    const queue: string[] = tables.filter(
      (table) => (inDegree.get(table) ?? 0) === 0,
    );
    const ordered: string[] = [];

    while (queue.length > 0) {
      const table = queue.shift();
      if (!table) {
        break;
      }
      ordered.push(table);

      for (const neighbour of adjacency.get(table) ?? []) {
        const updated = (inDegree.get(neighbour) ?? 0) - 1;
        inDegree.set(neighbour, updated);
        if (updated === 0) {
          queue.push(neighbour);
        }
      }
    }

    if (ordered.length !== tables.length) {
      return tables;
    }

    return ordered;
  }

  private async fetchTableNames(queryRunner: QueryRunner): Promise<string[]> {
    const rows = (await queryRunner.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
    )) as { tablename: string }[];

    return rows.map((row) => row.tablename);
  }

  private async fetchTableColumns(
    queryRunner: QueryRunner,
    table: string,
  ): Promise<TableColumnDefinition[]> {
    const rows = (await queryRunner.query(
      `SELECT column_name, data_type, udt_name, is_identity, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [table],
    )) as TableColumnDefinition[];

    return rows;
  }

  private async fetchForeignKeyDependencies(
    queryRunner: QueryRunner,
  ): Promise<ForeignKeyDependencyRow[]> {
    const rows = (await queryRunner.query(
      `SELECT tc.table_name, ccu.table_name AS referenced_table_name
       FROM information_schema.table_constraints AS tc
       JOIN information_schema.key_column_usage AS kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       JOIN information_schema.constraint_column_usage AS ccu
         ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
       WHERE tc.constraint_type = 'FOREIGN KEY'
         AND tc.table_schema = 'public'`,
    )) as ForeignKeyDependencyRow[];

    return rows;
  }

  private formatValue(value: unknown, column: TableColumnDefinition): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    if (
      Array.isArray(value) &&
      (column.data_type === 'ARRAY' || column.udt_name.startsWith('_'))
    ) {
      return this.formatArrayLiteral(value, column);
    }

    if (column.udt_name === 'bytea') {
      if (value instanceof Buffer) {
        return `'\\x${value.toString('hex')}'::bytea`;
      }
      if (value instanceof Uint8Array) {
        return `'\\x${Buffer.from(value).toString('hex')}'::bytea`;
      }
      if (typeof value === 'string') {
        return `'${this.escapeLiteral(value)}'::bytea`;
      }
    }

    switch (column.data_type) {
      case 'boolean':
        return value ? 'TRUE' : 'FALSE';
      case 'integer':
      case 'smallint':
      case 'bigint':
      case 'numeric':
      case 'decimal':
      case 'double precision':
      case 'real':
        return String(value);
      case 'date':
        return `'${this.escapeLiteral(String(value))}'::date`;
      case 'timestamp without time zone':
        return `'${this.escapeLiteral(this.normalizeDateValue(value))}'::timestamp`;
      case 'timestamp with time zone':
        return `'${this.escapeLiteral(this.normalizeDateValue(value))}'::timestamptz`;
      case 'time without time zone':
        return `'${this.escapeLiteral(String(value))}'::time`;
      case 'time with time zone':
        return `'${this.escapeLiteral(String(value))}'::timetz`;
      case 'json':
        return `'${this.escapeLiteral(
          typeof value === 'string' ? value : JSON.stringify(value),
        )}'::json`;
      case 'jsonb':
        return `'${this.escapeLiteral(
          typeof value === 'string' ? value : JSON.stringify(value),
        )}'::jsonb`;
      default:
        break;
    }

    if (column.udt_name === 'uuid') {
      return `'${this.escapeLiteral(String(value))}'::uuid`;
    }

    if (typeof value === 'object') {
      return `'${this.escapeLiteral(JSON.stringify(value))}'`;
    }

    return `'${this.escapeLiteral(String(value))}'`;
  }

  private formatArrayLiteral(
    values: unknown[],
    column: TableColumnDefinition,
  ): string {
    const formatted = values.map((item) => {
      if (item === null || item === undefined) {
        return 'NULL';
      }
      if (typeof item === 'number' || typeof item === 'bigint') {
        return String(item);
      }
      if (typeof item === 'boolean') {
        return item ? 'TRUE' : 'FALSE';
      }
      return `'${this.escapeLiteral(String(item))}'`;
    });

    const literal = `ARRAY[${formatted.join(', ')}]`;
    const elementType = this.resolveArrayElementType(column.udt_name);

    return elementType ? `${literal}::${elementType}[]` : literal;
  }

  private escapeLiteral(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "''");
  }

  private normalizeDateValue(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    const stringValue = String(value);
    if (stringValue.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(stringValue)) {
      return stringValue;
    }

    const parsed = new Date(stringValue);
    if (Number.isNaN(parsed.getTime())) {
      return stringValue;
    }

    return parsed.toISOString();
  }

  private extractSequenceName(column: TableColumnDefinition): string | null {
    if (
      column.column_default &&
      /nextval\('([^']+)'::regclass\)/.test(column.column_default)
    ) {
      const match = column.column_default.match(
        /nextval\('([^']+)'::regclass\)/,
      );
      return match ? match[1] : null;
    }
    return null;
  }

  private resolveArrayElementType(udtName: string): string | null {
    if (!udtName.startsWith('_')) {
      return null;
    }

    const mapping: Record<string, string> = {
      _int2: 'smallint',
      _int4: 'integer',
      _int8: 'bigint',
      _text: 'text',
      _varchar: 'varchar',
      _bpchar: 'char',
      _uuid: 'uuid',
      _bool: 'boolean',
      _numeric: 'numeric',
      _float4: 'real',
      _float8: 'double precision',
      _date: 'date',
      _timestamptz: 'timestamptz',
      _timestamp: 'timestamp',
      _json: 'json',
      _jsonb: 'jsonb',
    };

    return mapping[udtName] ?? null;
  }

  private async persistBackupScript(
    path: string,
    script: string,
  ): Promise<void> {
    try {
      await writeFile(path, script, { encoding: 'utf-8' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'неизвестная ошибка записи файла';
      throw new Error(
        `Не удалось сохранить резервную копию на диске: ${message}`,
      );
    }
  }

  private async readSqlFileIfAvailable(
    path: string,
    validateBackup = false,
  ): Promise<string | null> {
    try {
      await access(path, constants.R_OK);
    } catch {
      return null;
    }

    const content = await readFile(path, 'utf-8');
    if (!content.trim()) {
      return null;
    }

    if (validateBackup && !this.isValidBackupScript(content)) {
      return null;
    }

    const statements = this.splitSqlScript(content);
    if (statements.length === 0) {
      return null;
    }

    return content;
  }

  private isValidBackupScript(content: string): boolean {
    return !/\\!\s*pg_dump/i.test(content);
  }

  private async executeSqlScript(script: string): Promise<void> {
    const statements = this.splitSqlScript(script);
    if (statements.length === 0) {
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      for (const statement of statements) {
        await queryRunner.query(statement);
      }
    } finally {
      await queryRunner.release();
    }
  }

  private splitSqlScript(script: string): string[] {
    const normalized = script.replace(/\uFEFF/g, '');
    const statements: string[] = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let dollarTag: string | null = null;

    for (let i = 0; i < normalized.length; ) {
      const char = normalized[i];
      const nextTwo = normalized.slice(i, i + 2);

      if (!inSingleQuote && !inDoubleQuote && dollarTag === null) {
        if (nextTwo === '--') {
          i += 2;
          while (i < normalized.length && normalized[i] !== '\n') {
            i += 1;
          }
          continue;
        }

        if (nextTwo === '/*') {
          const endIndex = normalized.indexOf('*/', i + 2);
          if (endIndex === -1) {
            break;
          }
          i = endIndex + 2;
          continue;
        }

        const dollarMatch = normalized.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
        if (dollarMatch) {
          dollarTag = dollarMatch[0];
          current += dollarTag;
          i += dollarTag.length;
          continue;
        }
      }

      if (dollarTag) {
        if (normalized.startsWith(dollarTag, i)) {
          current += dollarTag;
          i += dollarTag.length;
          dollarTag = null;
          continue;
        }

        current += char;
        i += 1;
        continue;
      }

      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
        current += char;
        i += 1;
        continue;
      }

      if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
        current += char;
        i += 1;
        continue;
      }

      if (char === ';' && !inSingleQuote && !inDoubleQuote) {
        const trimmed = current.trim();
        if (trimmed) {
          statements.push(trimmed);
        }
        current = '';
        i += 1;
        continue;
      }

      current += char;
      i += 1;
    }

    const trimmed = current.trim();
    if (trimmed) {
      statements.push(trimmed);
    }

    return statements;
  }

  private quoteIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }
}
