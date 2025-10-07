import { Controller, Get } from '@nestjs/common';
import { OrderStatusesService } from './order-statuses.service';
import { OrderStatusResponseDto } from './dto/order-status-response.dto';

// controller exposing read-only endpoints for order statuses
@Controller('order-statuses')
export class OrderStatusesController {
  constructor(private readonly orderStatusesService: OrderStatusesService) {}

  @Get()
  findAll(): Promise<OrderStatusResponseDto[]> {
    return this.orderStatusesService.findAll();
  }
}
