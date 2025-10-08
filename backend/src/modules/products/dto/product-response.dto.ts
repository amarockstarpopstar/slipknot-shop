import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductCategoryInfoDto {
  @ApiProperty({ example: 4, description: 'Идентификатор категории' })
  id: number;

  @ApiProperty({ example: 'Футболки', description: 'Название категории' })
  name: string;
}

export class ProductSizeInfoDto {
  @ApiProperty({ example: 2, description: 'Идентификатор размера' })
  id: number;

  @ApiProperty({ example: 'L', description: 'Название размера' })
  name: string;
}

// dto for returning product details
export class ProductResponseDto {
  @ApiProperty({ example: 25, description: 'Идентификатор товара' })
  id: number;

  @ApiProperty({ example: 'Футболка Slipknot Iowa', description: 'Название товара' })
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

  @ApiProperty({ example: 15, description: 'Остаток на складе' })
  stockCount: number;

  @ApiPropertyOptional({ example: 'https://example.com/images/shirt.jpg', description: 'Ссылка на изображение', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ type: () => ProductCategoryInfoDto, nullable: true, description: 'Категория товара' })
  category: ProductCategoryInfoDto | null;

  @ApiProperty({ type: () => ProductSizeInfoDto, nullable: true, description: 'Размер товара' })
  size: ProductSizeInfoDto | null;

  @ApiProperty({ description: 'Дата создания записи' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления записи' })
  updatedAt: Date;
}
