import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductSizeStockResponseDto } from './product-size.dto';

export class ProductCategoryInfoDto {
  @ApiProperty({ example: 4, description: 'Идентификатор категории' })
  id: number;

  @ApiProperty({ example: 'Футболки', description: 'Название категории' })
  name: string;
}

// dto for returning product details
export class ProductResponseDto {
  @ApiProperty({ example: 25, description: 'Идентификатор товара' })
  id: number;

  @ApiProperty({
    example: 'Футболка Slipknot Iowa',
    description: 'Название товара',
  })
  title: string;

  @ApiPropertyOptional({
    example: 'Чёрная футболка с принтом альбома Iowa',
    description: 'Описание товара',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: 2990, description: 'Цена товара' })
  price: number;

  @ApiProperty({ example: 'SLP-TS-002', description: 'Артикул товара' })
  sku: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/shirt.jpg',
    description: 'Ссылка на изображение',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    type: () => ProductCategoryInfoDto,
    nullable: true,
    description: 'Категория товара',
  })
  category: ProductCategoryInfoDto | null;

  @ApiProperty({
    type: () => ProductSizeStockResponseDto,
    isArray: true,
    description: 'Доступные размеры и остатки по каждому размеру',
  })
  sizes: ProductSizeStockResponseDto[];

  @ApiProperty({ description: 'Дата создания записи' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления записи' })
  updatedAt: Date;
}
