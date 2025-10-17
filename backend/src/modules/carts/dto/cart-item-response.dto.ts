import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CartItemProductDto {
  @ApiProperty({ example: 15, description: 'Идентификатор товара' })
  id: number;

  @ApiProperty({
    example: 'Футболка Slipknot Iowa',
    description: 'Название товара',
  })
  title: string;

  @ApiProperty({
    example: 3190,
    description: 'Текущая цена товара с учётом выбранного размера',
  })
  price: number;

  @ApiPropertyOptional({
    example: 'https://example.com/images/shirt.jpg',
    description: 'Ссылка на изображение товара',
    nullable: true,
  })
  imageUrl: string | null;
}

class CartItemSizeDto {
  @ApiProperty({
    example: 42,
    description: 'Идентификатор размера в таблице product_sizes',
  })
  id: number;

  @ApiProperty({ example: 'L', description: 'Название выбранного размера' })
  size: string;

  @ApiProperty({
    example: 3190,
    description: 'Цена для выбранного размера',
  })
  price: number;

  @ApiProperty({
    example: 8,
    description: 'Текущее количество на складе для размера',
  })
  stock: number;
}

// response dto for single cart item
export class CartItemResponseDto {
  @ApiProperty({ example: 9, description: 'Идентификатор позиции в корзине' })
  id: number;

  @ApiProperty({ example: 2, description: 'Количество товара', minimum: 1 })
  quantity: number;

  @ApiProperty({ example: 2990, description: 'Цена за единицу товара' })
  unitPrice: number;

  @ApiProperty({
    type: () => CartItemProductDto,
    description: 'Информация о товаре',
  })
  product: CartItemProductDto;

  @ApiPropertyOptional({
    type: () => CartItemSizeDto,
    nullable: true,
    description: 'Информация о выбранном размере',
  })
  size: CartItemSizeDto | null;
}
