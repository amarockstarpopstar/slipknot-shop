import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderStatusesService } from './order-statuses.service';
import { OrderStatusResponseDto } from './dto/order-status-response.dto';

// controller exposing read-only endpoints for order statuses
@ApiTags('Статусы заказов')
@Controller('order-statuses')
export class OrderStatusesController {
  constructor(private readonly orderStatusesService: OrderStatusesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список статусов заказов' })
  @ApiOkResponse({ description: 'Справочник статусов заказов', type: OrderStatusResponseDto, isArray: true })
  findAll(): Promise<OrderStatusResponseDto[]> {
    return this.orderStatusesService.findAll();
  }
}
