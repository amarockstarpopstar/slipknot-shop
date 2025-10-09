import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { CustomerOrderResponseDto } from './dto/customer-order-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

// controller providing customer access to their order history
@UseGuards(JwtAuthGuard)
@ApiTags('Личный кабинет')
@ApiBearerAuth()
@Controller('customer/orders')
export class CustomerOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить историю заказов текущего пользователя' })
  @ApiOkResponse({ description: 'История заказов', type: CustomerOrderResponseDto, isArray: true })
  findMyOrders(@Req() req: AuthenticatedRequest): Promise<CustomerOrderResponseDto[]> {
    return this.ordersService.findForUser(req.user.id);
  }
}
