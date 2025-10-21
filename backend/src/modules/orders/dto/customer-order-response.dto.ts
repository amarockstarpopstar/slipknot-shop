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

class CustomerOrderItemProductDto {
  @ApiProperty({ example: 7, description: 'Идентификатор товара' })
  id: number;

  @ApiProperty({ example: 'Футболка Slipknot', description: 'Название товара' })
  title: string;

  @ApiProperty({ example: 'SLP-TS-001', description: 'Артикул товара' })
  sku: string;
}

class CustomerOrderItemSizeDto {
  @ApiProperty({ example: 12, description: 'Идентификатор размера товара' })
  id: number;

  @ApiProperty({ example: 'L', description: 'Выбранный размер товара' })
  size: string;
}

class CustomerOrderItemResponseDto {
  @ApiProperty({ example: 42, description: 'Идентификатор позиции заказа' })
  id: number;

  @ApiProperty({
    type: () => CustomerOrderItemProductDto,
    description: 'Краткая информация о товаре',
  })
  product: CustomerOrderItemProductDto;

  @ApiPropertyOptional({
    type: () => CustomerOrderItemSizeDto,
    nullable: true,
    description: 'Информация о выбранном размере',
  })
  size: CustomerOrderItemSizeDto | null;

  @ApiProperty({ example: 2, description: 'Количество товара в заказе' })
  quantity: number;

  @ApiProperty({ example: 2990, description: 'Стоимость единицы товара' })
  unitPrice: number;
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

  @ApiProperty({
    description: 'Позиции, включенные в заказ',
    type: () => CustomerOrderItemResponseDto,
    isArray: true,
  })
  items: CustomerOrderItemResponseDto[];
}
