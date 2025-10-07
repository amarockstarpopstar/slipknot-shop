import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Category } from '../categories/entities/category.entity';
import { SizeEntity } from '../sizes/entities/size.entity';

// module for product operations
@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, SizeEntity])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
