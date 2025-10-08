import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto, UserRoleDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

type RequestWithUser = Request & { user?: { userId?: number } };

// controller for user-related routes
@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiOkResponse({ description: 'Профиль авторизованного пользователя', type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  async getProfile(@Req() req: RequestWithUser): Promise<UserResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    return this.usersService.findById(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Администратор')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить список пользователей' })
  @ApiOkResponse({ description: 'Список пользователей', type: UserResponseDto, isArray: true })
  @ApiForbiddenResponse({ description: 'Доступ запрещён' })
  async getAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Администратор')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить список ролей' })
  @ApiOkResponse({ description: 'Список ролей пользователей', type: UserRoleDto, isArray: true })
  @ApiForbiddenResponse({ description: 'Доступ запрещён' })
  async getRoles(): Promise<UserRoleDto[]> {
    return this.usersService.findAllRoles();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Администратор')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить данные пользователя' })
  @ApiOkResponse({ description: 'Обновлённые данные пользователя', type: UserResponseDto })
  @ApiForbiddenResponse({ description: 'Доступ запрещён' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Администратор')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiNoContentResponse({ description: 'Пользователь удалён' })
  @ApiForbiddenResponse({ description: 'Доступ запрещён' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.remove(id);
  }
}
