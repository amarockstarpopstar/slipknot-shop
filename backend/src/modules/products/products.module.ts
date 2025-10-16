import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Category } from '../categories/entities/category.entity';
import { ProductSize } from './entities/product-size.entity';
import { SizeStock } from './entities/size-stock.entity';

// module for product operations
@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, ProductSize, SizeStock]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
