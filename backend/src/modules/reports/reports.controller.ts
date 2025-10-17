import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { DailySalesPointDto } from './dto/daily-sales-point.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

// controller exposing reporting endpoints for managers/admins
@ApiTags('Отчётность')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Менеджер', 'Администратор')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales/daily')
  @ApiOperation({ summary: 'Получить продажи по дням для графика' })
  @ApiOkResponse({
    description: 'Сводные данные по продажам за день',
    type: DailySalesPointDto,
    isArray: true,
  })
  getDailySales(): Promise<DailySalesPointDto[]> {
    return this.reportsService.getDailySales();
  }

  @Get('sales/export')
  @ApiOperation({ summary: 'Скачать Excel-отчёт по продажам' })
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiOkResponse({ description: 'Excel-файл со сводкой и детализацией продаж' })
  async downloadSalesReport(@Res() res: Response): Promise<void> {
    const file = await this.reportsService.generateSalesWorkbook();
    const timestamp = new Date().toISOString().split('T')[0];

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sales-report-${timestamp}.xlsx"`,
    );

    res.send(file);
  }
}
