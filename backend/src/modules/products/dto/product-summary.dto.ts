import { ApiProperty } from '@nestjs/swagger';

// dto for returning short product info
export class ProductSummaryDto {
  @ApiProperty({ example: 15, description: 'Идентификатор товара' })
  id: number;

  @ApiProperty({ example: 'Футболка Slipknot', description: 'Название товара' })
  title: string;

  @ApiProperty({ example: 2990, description: 'Цена товара' })
  price: number;

  @ApiProperty({ example: 'SLP-TS-001', description: 'Артикул товара' })
  sku: string;
}
