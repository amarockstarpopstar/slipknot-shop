import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Workbook } from 'exceljs';
import { DailySalesPointDto } from './dto/daily-sales-point.dto';

interface DailySalesRawRow {
  sale_date: string;
  total_orders: string | number;
  total_items: string | number;
  total_amount: string | number;
}

interface SalesDetailRawRow {
  order_id: number;
  placed_at: Date | string;
  customer_email: string;
  product_title: string;
  size: string | null;
  quantity: string | number;
  unit_price: string | number;
}

// service providing reporting utilities (chart data + excel export)
@Injectable()
export class ReportsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getDailySales(): Promise<DailySalesPointDto[]> {
    const rows = await this.dataSource.query<DailySalesRawRow[]>(
      `SELECT sale_date, total_orders, total_items, total_amount
       FROM vw_sales_by_day
       ORDER BY sale_date ASC`,
    );

    return rows.map((row) => ({
      saleDate: row.sale_date,
      totalOrders: Number(row.total_orders ?? 0),
      totalItems: Number(row.total_items ?? 0),
      totalAmount: Number(row.total_amount ?? 0),
    }));
  }

  async generateSalesWorkbook(): Promise<Buffer> {
    const [dailySales, details] = await Promise.all([
      this.getDailySales(),
      this.loadSalesDetails(),
    ]);

    const workbook = new Workbook();
    workbook.creator = 'Slipknot Shop';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('Продажи по дням');
    summarySheet.columns = [
      { header: 'Дата', key: 'saleDate', width: 16 },
      { header: 'Заказы', key: 'totalOrders', width: 12 },
      { header: 'Товары', key: 'totalItems', width: 12 },
      { header: 'Сумма (₽)', key: 'totalAmount', width: 16 },
    ];

    summarySheet.getColumn('totalAmount').numFmt = '#,##0.00';

    dailySales.forEach((row) => {
      summarySheet.addRow({
        saleDate: row.saleDate,
        totalOrders: row.totalOrders,
        totalItems: row.totalItems,
        totalAmount: Number(row.totalAmount.toFixed(2)),
      });
    });

    if (dailySales.length) {
      const totalsRow = summarySheet.addRow({
        saleDate: 'Итого',
        totalOrders: dailySales.reduce((sum, row) => sum + row.totalOrders, 0),
        totalItems: dailySales.reduce((sum, row) => sum + row.totalItems, 0),
        totalAmount: Number(
          dailySales.reduce((sum, row) => sum + row.totalAmount, 0).toFixed(2),
        ),
      });
      totalsRow.font = { bold: true };
    }

    summarySheet.getRow(1).font = { bold: true };

    const detailsSheet = workbook.addWorksheet('Детализация заказов');
    detailsSheet.columns = [
      { header: '№ заказа', key: 'orderId', width: 12 },
      { header: 'Дата заказа', key: 'placedAt', width: 20 },
      { header: 'Email клиента', key: 'customerEmail', width: 26 },
      { header: 'Товар', key: 'productTitle', width: 32 },
      { header: 'Размер', key: 'size', width: 14 },
      { header: 'Кол-во', key: 'quantity', width: 12 },
      { header: 'Цена (₽)', key: 'unitPrice', width: 14 },
      { header: 'Сумма (₽)', key: 'total', width: 16 },
    ];

    detailsSheet.getColumn('unitPrice').numFmt = '#,##0.00';
    detailsSheet.getColumn('total').numFmt = '#,##0.00';
    detailsSheet.getColumn('placedAt').numFmt = 'yyyy-mm-dd hh:mm';

    let grandTotal = 0;
    details.forEach((row) => {
      const quantity = Number(row.quantity ?? 0);
      const unitPrice = Number(row.unit_price ?? 0);
      const total = quantity * unitPrice;
      grandTotal += total;

      const placedAt = row.placed_at ? new Date(row.placed_at) : null;

      detailsSheet.addRow({
        orderId: row.order_id,
        placedAt,
        customerEmail: row.customer_email,
        productTitle: row.product_title,
        size: row.size ?? '—',
        quantity,
        unitPrice,
        total: Number(total.toFixed(2)),
      });
    });

    if (details.length) {
      const totalsRow = detailsSheet.addRow({
        orderId: '',
        placedAt: '',
        customerEmail: 'Итого',
        productTitle: '',
        size: '',
        quantity: details.reduce((sum, row) => sum + Number(row.quantity ?? 0), 0),
        unitPrice: '',
        total: Number(grandTotal.toFixed(2)),
      });
      totalsRow.font = { bold: true };
    }

    detailsSheet.getRow(1).font = { bold: true };

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  private async loadSalesDetails(): Promise<SalesDetailRawRow[]> {
    return this.dataSource.query<SalesDetailRawRow[]>(
      `SELECT
         o.id AS order_id,
         o.placed_at,
         u.email AS customer_email,
         p.title AS product_title,
         ps.size,
         oi.quantity,
         oi.unit_price
       FROM orders o
       JOIN users u ON u.id = o.user_id
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       LEFT JOIN product_sizes ps ON ps.id = oi.product_size_id
       ORDER BY o.placed_at ASC, oi.id ASC`,
    );
  }
}
