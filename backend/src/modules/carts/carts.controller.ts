import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { CartResponseDto } from './dto/cart-response.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutResponseDto } from './dto/checkout-response.dto';
import { CartAuthGuard } from './guards/cart-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

// controller exposing cart endpoints for authenticated customers
@ApiTags('Корзина')
@Controller('cart')
@UseGuards(CartAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить текущую корзину пользователя' })
  @ApiOkResponse({ description: 'Содержимое корзины', type: CartResponseDto })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  getCart(@Req() req: AuthenticatedRequest): Promise<CartResponseDto> {
    return this.cartsService.getCart(req.user.id);
  }

  @Post('items')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить товар в корзину' })
  @ApiOkResponse({ description: 'Обновлённая корзина', type: CartResponseDto })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  addItem(
    @Req() req: AuthenticatedRequest,
    @Body() addCartItemDto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartsService.addItem(req.user.id, addCartItemDto);
  }

  @Patch('items/:itemId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить количество товара в корзине' })
  @ApiOkResponse({ description: 'Обновлённая корзина', type: CartResponseDto })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  updateItem(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartsService.updateItem(req.user.id, itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить товар из корзины' })
  @ApiOkResponse({ description: 'Обновлённая корзина', type: CartResponseDto })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<CartResponseDto> {
    return this.cartsService.removeItem(req.user.id, itemId);
  }

  @Post('checkout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оформить заказ из корзины' })
  @ApiOkResponse({
    description: 'Информация о созданном заказе',
    type: CheckoutResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  checkout(@Req() req: AuthenticatedRequest): Promise<CheckoutResponseDto> {
    return this.cartsService.checkout(req.user.id);
  }
}
