import { ApiProperty } from '@nestjs/swagger';

class OrderItemProductDto {
  @ApiProperty({ example: 7, description: 'Идентификатор товара' })
  id: number;

  @ApiProperty({ example: 'Футболка Slipknot', description: 'Название товара' })
  title: string;

  @ApiProperty({ example: 'SLP-TS-001', description: 'Артикул товара' })
  sku: string;
}

// dto describing order item for manager view
export class OrderItemResponseDto {
  @ApiProperty({ example: 12, description: 'Идентификатор позиции заказа' })
  id: number;

  @ApiProperty({ type: () => OrderItemProductDto, description: 'Краткая информация о товаре' })
  product: OrderItemProductDto;

  @ApiProperty({ example: 2, description: 'Количество товара в заказе' })
  quantity: number;

  @ApiProperty({ example: 2990, description: 'Стоимость единицы товара' })
  unitPrice: number;
}
