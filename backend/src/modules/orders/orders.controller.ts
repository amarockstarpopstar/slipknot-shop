import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

// controller providing manager CRUD for orders
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Менеджер')
@ApiTags('Заказы')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список заказов' })
  @ApiOkResponse({ description: 'Список заказов', type: OrderResponseDto, isArray: true })
  findAll(): Promise<OrderResponseDto[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заказ по идентификатору' })
  @ApiOkResponse({ description: 'Детали заказа', type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Заказ не найден' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<OrderResponseDto> {
    return this.ordersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить данные заказа' })
  @ApiOkResponse({ description: 'Заказ обновлён', type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Заказ не найден' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить заказ' })
  @ApiNoContentResponse({ description: 'Заказ удалён' })
  @ApiNotFoundResponse({ description: 'Заказ не найден' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ordersService.remove(id);
  }
}
