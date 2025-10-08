import { ApiProperty } from '@nestjs/swagger';

// response dto returned after successful checkout
export class CheckoutResponseDto {
  @ApiProperty({ example: 120, description: 'Идентификатор созданного заказа' })
  orderId: number;

  @ApiProperty({ example: 5980, description: 'Итоговая сумма заказа' })
  totalAmount: number;
}
