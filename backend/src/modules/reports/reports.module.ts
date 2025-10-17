import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

// module wiring reporting controllers and services
@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
