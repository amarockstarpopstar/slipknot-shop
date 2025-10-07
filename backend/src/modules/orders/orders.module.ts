import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderStatus } from '../order-statuses/entities/order-status.entity';

// module wiring for order management
@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderStatus])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
