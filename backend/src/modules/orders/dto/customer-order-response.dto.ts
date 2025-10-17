import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CustomerOrderStatusDto {
  @ApiProperty({ example: 2, description: 'Идентификатор статуса заказа' })
  id: number;

  @ApiProperty({
    example: 'В обработке',
    description: 'Название статуса заказа',
  })
  name: string;
}

// dto describing order information in customer history
export class CustomerOrderResponseDto {
  @ApiProperty({ example: 42, description: 'Идентификатор заказа' })
  id: number;

  @ApiProperty({ example: 5980, description: 'Итоговая сумма заказа' })
  totalAmount: number;

  @ApiProperty({
    type: () => CustomerOrderStatusDto,
    description: 'Статус оплаты/заказа',
  })
  status: CustomerOrderStatusDto;

  @ApiPropertyOptional({
    example: 'Оплата картой онлайн',
    description: 'Способ оплаты',
    nullable: true,
  })
  paymentMethod: string | null;

  @ApiProperty({
    example: 'Готовится к отправке',
    description: 'Текущий статус отправки заказа',
  })
  shippingStatus: string;

  @ApiProperty({ description: 'Дата последнего обновления статуса отправки' })
  shippingUpdatedAt: Date;

  @ApiProperty({ description: 'Дата оформления заказа' })
  placedAt: Date;
}
