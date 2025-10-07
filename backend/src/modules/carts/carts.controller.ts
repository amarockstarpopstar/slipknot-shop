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
@Controller('cart')
@UseGuards(CartAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  getCart(@Req() req: AuthenticatedRequest): Promise<CartResponseDto> {
    return this.cartsService.getCart(req.user.id);
  }

  @Post('items')
  addItem(
    @Req() req: AuthenticatedRequest,
    @Body() addCartItemDto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartsService.addItem(req.user.id, addCartItemDto);
  }

  @Patch('items/:itemId')
  updateItem(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartsService.updateItem(req.user.id, itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<CartResponseDto> {
    return this.cartsService.removeItem(req.user.id, itemId);
  }

  @Post('checkout')
  checkout(@Req() req: AuthenticatedRequest): Promise<CheckoutResponseDto> {
    return this.cartsService.checkout(req.user.id);
  }
}
