import { ApiProperty } from '@nestjs/swagger';

export class DailySalesPointDto {
  @ApiProperty({
    example: '2025-03-15',
    description: 'Дата продажи в формате ISO 8601 (YYYY-MM-DD)',
  })
  saleDate!: string;

  @ApiProperty({
    example: 24,
    description: 'Количество проданных товаров за день',
  })
  totalItems!: number;

  @ApiProperty({
    example: 15999.5,
    description: 'Общая сумма продаж за день в рублях',
    type: Number,
    format: 'float',
  })
  totalAmount!: number;
}
