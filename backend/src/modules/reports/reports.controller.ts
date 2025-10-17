import {
  Controller,
  Get,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
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

const EXCEL_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@ApiTags('Отчётность')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Менеджер', 'Администратор')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales/daily')
  @ApiOperation({ summary: 'Получить продажи по дням для графиков' })
  @ApiOkResponse({
    description: 'Данные по продажам по дням',
    type: DailySalesPointDto,
    isArray: true,
  })
  findDailySales(): Promise<DailySalesPointDto[]> {
    return this.reportsService.getDailySales();
  }

  @Get('sales/excel')
  @ApiOperation({ summary: 'Выгрузить продажи в Excel' })
  @ApiProduces(EXCEL_MIME_TYPE)
  @ApiOkResponse({
    description: 'Файл Excel с продажами',
    schema: { type: 'string', format: 'binary' },
  })
  async downloadSalesReport(
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const { buffer, filename } = await this.reportsService.generateSalesExcel();

    response.setHeader('Content-Type', EXCEL_MIME_TYPE);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"`,
    );

    return new StreamableFile(buffer);
  }
}
