import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { OrderStatus } from '../order-statuses/entities/order-status.entity';
import { CartAuthGuard } from './guards/cart-auth.guard';

// module providing cart functionality
@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Product, User, Order, OrderItem, OrderStatus]),
  ],
  controllers: [CartsController],
  providers: [CartsService, CartAuthGuard],
  exports: [CartsService],
})
export class CartsModule {}
