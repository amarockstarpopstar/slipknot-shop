import { Injectable } from '@nestjs/common';
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
}
