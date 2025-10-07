import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

// controller providing admin CRUD for orders
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(): Promise<OrderResponseDto[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<OrderResponseDto> {
    return this.ordersService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ordersService.remove(id);
  }
}
