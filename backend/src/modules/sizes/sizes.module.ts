import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SizeEntity } from './entities/size.entity';
import { SizesService } from './sizes.service';
import { SizesController } from './sizes.controller';

// module wiring together size controller and service
@Module({
  imports: [TypeOrmModule.forFeature([SizeEntity])],
  controllers: [SizesController],
  providers: [SizesService],
  exports: [SizesService],
})
export class SizesModule {}
