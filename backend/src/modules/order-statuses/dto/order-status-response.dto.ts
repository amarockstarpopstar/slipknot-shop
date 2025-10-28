import { ApiProperty } from '@nestjs/swagger';

// dto describing order status lookup entry
export class OrderStatusResponseDto {
  @ApiProperty({ example: 1, description: 'Идентификатор статуса' })
  id: number;

  @ApiProperty({ example: 'Новый', description: 'Название статуса заказа' })
  name: string;
}
