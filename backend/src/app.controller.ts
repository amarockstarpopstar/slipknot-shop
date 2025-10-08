import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Сервис')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Проверка работоспособности API' })
  @ApiOkResponse({ description: 'Текстовое сообщение о состоянии сервиса', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
