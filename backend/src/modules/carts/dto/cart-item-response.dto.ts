import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CartItemProductDto {
  @ApiProperty({ example: 15, description: 'Идентификатор товара' })
  id: number;

  @ApiProperty({ example: 'Футболка Slipknot Iowa', description: 'Название товара' })
  title: string;

  @ApiProperty({ example: 2990, description: 'Цена товара' })
  price: number;

  @ApiPropertyOptional({
    example: 'https://example.com/images/shirt.jpg',
    description: 'Ссылка на изображение товара',
    nullable: true,
  })
  imageUrl: string | null;
}

// response dto for single cart item
export class CartItemResponseDto {
  @ApiProperty({ example: 9, description: 'Идентификатор позиции в корзине' })
  id: number;

  @ApiProperty({ example: 2, description: 'Количество товара', minimum: 1 })
  quantity: number;

  @ApiProperty({ example: 2990, description: 'Цена за единицу товара' })
  unitPrice: number;

  @ApiProperty({ type: () => CartItemProductDto, description: 'Информация о товаре' })
  product: CartItemProductDto;
}
