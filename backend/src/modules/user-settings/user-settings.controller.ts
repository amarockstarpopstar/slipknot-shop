import { Body, Controller, Get, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserSettingsResponseDto } from './dto/user-settings-response.dto';
import { UserSettingsService } from './user-settings.service';

type RequestWithUser = Request & { user?: { userId?: number } };

// controller exposing endpoints for user settings persistence
@ApiTags('Настройки пользователя')
@Controller('user-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Получить настройки текущего пользователя' })
  @ApiOkResponse({
    description: 'Текущие настройки пользователя',
    type: UserSettingsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  async getForCurrentUser(@Req() req: RequestWithUser): Promise<UserSettingsResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    return this.userSettingsService.findForUser(userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Обновить настройки текущего пользователя' })
  @ApiOkResponse({ description: 'Обновлённые настройки', type: UserSettingsResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные значения настроек' })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  async updateForCurrentUser(
    @Req() req: RequestWithUser,
    @Body() payload: UpdateUserSettingsDto,
  ): Promise<UserSettingsResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    return this.userSettingsService.updateForUser(userId, payload);
  }
}
