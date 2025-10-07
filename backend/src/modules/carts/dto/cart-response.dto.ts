import { CartItemResponseDto } from './cart-item-response.dto';

// response dto for cart
export interface CartResponseDto {
  id: number;
  items: CartItemResponseDto[];
  totalQuantity: number;
  totalAmount: number;
}
