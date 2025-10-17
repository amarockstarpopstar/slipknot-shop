import { ApiProperty } from '@nestjs/swagger';

// dto describing aggregated sales data for a single day
export class DailySalesPointDto {
  @ApiProperty({ example: '2025-01-15', description: 'Дата продаж (UTC)' })
  saleDate: string;

  @ApiProperty({
    example: 7,
    description: 'Количество оформленных заказов за день',
  })
  totalOrders: number;

  @ApiProperty({
    example: 23,
    description: 'Общее количество проданных единиц товара за день',
  })
  totalItems: number;

  @ApiProperty({
    example: 15750.5,
    description: 'Общая сумма продаж за день в рублях',
  })
  totalAmount: number;
}
