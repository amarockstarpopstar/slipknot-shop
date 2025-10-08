import { ApiProperty } from '@nestjs/swagger';
import { CartItemResponseDto } from './cart-item-response.dto';

// response dto for cart
export class CartResponseDto {
  @ApiProperty({ example: 5, description: 'Идентификатор корзины' })
  id: number;

  @ApiProperty({ type: () => CartItemResponseDto, isArray: true, description: 'Позиции в корзине' })
  items: CartItemResponseDto[];

  @ApiProperty({ example: 3, description: 'Общее количество товаров в корзине' })
  totalQuantity: number;

  @ApiProperty({ example: 5980, description: 'Сумма заказа по корзине' })
  totalAmount: number;
}
