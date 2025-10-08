import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderItemResponseDto } from './order-item-response.dto';

class OrderCustomerDto {
  @ApiProperty({ example: 5, description: 'Идентификатор покупателя' })
  id: number;

  @ApiProperty({ example: 'Джоуи Джордисон', description: 'Имя покупателя' })
  name: string;

  @ApiProperty({ example: 'joey@slipknot.com', description: 'Email покупателя' })
  email: string;
}

class OrderStatusDto {
  @ApiProperty({ example: 2, description: 'Идентификатор статуса заказа' })
  id: number;

  @ApiProperty({ example: 'В обработке', description: 'Название статуса заказа' })
  name: string;
}

class OrderAddressDto {
  @ApiProperty({ example: 11, description: 'Идентификатор адреса' })
  id: number;

  @ApiProperty({ example: 'Москва', description: 'Город доставки' })
  city: string;

  @ApiProperty({ example: 'ул. Арбат, д. 1', description: 'Улица и дом' })
  street: string;

  @ApiProperty({ example: '119002', description: 'Почтовый индекс' })
  postalCode: string;

  @ApiPropertyOptional({ example: 'Домофон 12', description: 'Комментарий к адресу', nullable: true })
  comment: string | null;
}

// dto describing order details for manager responses
export class OrderResponseDto {
  @ApiProperty({ example: 101, description: 'Идентификатор заказа' })
  id: number;

  @ApiProperty({ type: () => OrderCustomerDto, description: 'Информация о покупателе' })
  customer: OrderCustomerDto;

  @ApiProperty({ type: () => OrderStatusDto, description: 'Текущий статус заказа' })
  status: OrderStatusDto;

  @ApiProperty({ example: 5980, description: 'Итоговая сумма заказа' })
  totalAmount: number;

  @ApiPropertyOptional({ example: 'Картой при получении', description: 'Способ оплаты', nullable: true })
  paymentMethod: string | null;

  @ApiPropertyOptional({ example: 'Позвонить за час до доставки', description: 'Комментарий менеджера', nullable: true })
  comment: string | null;

  @ApiProperty({ type: () => OrderAddressDto, nullable: true, description: 'Адрес доставки' })
  address: OrderAddressDto | null;

  @ApiProperty({ type: () => OrderItemResponseDto, isArray: true, description: 'Состав заказа' })
  items: OrderItemResponseDto[];

  @ApiProperty({ description: 'Дата оформления заказа' })
  placedAt: Date;

  @ApiProperty({ description: 'Дата создания записи' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления записи' })
  updatedAt: Date;
}
