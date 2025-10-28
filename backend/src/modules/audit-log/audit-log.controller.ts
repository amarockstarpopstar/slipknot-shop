import {
  Controller,
  Get,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditLogService } from './audit-log.service';
import { AuditLogListResponseDto } from './dto/audit-log-response.dto';

// controller for audit log endpoints
@ApiTags('Журнал аудита')
@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Администратор')
@ApiBearerAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Получить журнал аудита с постраничной навигацией' })
  @ApiOkResponse({ description: 'Страница журнала аудита', type: AuditLogListResponseDto })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'tableName', required: false, type: String })
  async getAuditLog(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('tableName') tableName?: string,
  ): Promise<AuditLogListResponseDto> {
    const { items, total } = await this.auditLogService.findMany({ limit, offset, tableName });
    return {
      items,
      limit,
      offset,
      total,
    };
  }
}
