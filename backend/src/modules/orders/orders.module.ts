import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderStatus } from '../order-statuses/entities/order-status.entity';
import { User } from '../users/entities/user.entity';
import { UserAddress } from '../user-addresses/entities/user-address.entity';
import { CustomerOrdersController } from './customer-orders.controller';

// module wiring for order management
@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderStatus, User, UserAddress])],
  controllers: [OrdersController, CustomerOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
