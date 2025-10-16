import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReviewEligibilityResponseDto } from './dto/review-eligibility-response.dto';
import { ReviewModerationResponseDto } from './dto/review-moderation-response.dto';

interface AuthenticatedRequest extends Request {
  user?: { userId?: number; id?: number };
}

// controller exposing review endpoints
@ApiTags('Отзывы')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Администратор')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить список отзывов для модерации' })
  @ApiOkResponse({
    description: 'Список отзывов с данными пользователя и товара',
    type: ReviewModerationResponseDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Фильтр по статусу отзыва (pending, approved, rejected)',
  })
  async findAll(
    @Query('status') status?: string,
  ): Promise<ReviewModerationResponseDto[]> {
    return this.reviewsService.findAll(status);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать отзыв о товаре' })
  @ApiCreatedResponse({ description: 'Отзыв создан', type: ReviewResponseDto })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiBadRequestResponse({ description: 'Некорректные данные отзыва' })
  @ApiConflictResponse({ description: 'Отзыв на товар уже существует' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    return this.reviewsService.create(userId, dto);
  }

  @Get(':productId/eligibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Проверить, может ли пользователь оставить отзыв' })
  @ApiOkResponse({
    description: 'Информация о праве оставить отзыв',
    type: ReviewEligibilityResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  async checkEligibility(
    @Req() req: AuthenticatedRequest,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ReviewEligibilityResponseDto> {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    return this.reviewsService.getEligibility(userId, productId);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Получить список подтверждённых отзывов товара' })
  @ApiOkResponse({
    description: 'Список отзывов по товару',
    type: ReviewResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  async findForProduct(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ReviewResponseDto[]> {
    return this.reviewsService.findForProduct(productId);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Администратор')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Одобрить отзыв' })
  @ApiOkResponse({ description: 'Отзыв одобрен', type: ReviewResponseDto })
  @ApiNotFoundResponse({ description: 'Отзыв не найден' })
  async approve(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.approve(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Администратор')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить отзыв' })
  @ApiNoContentResponse({ description: 'Отзыв удалён' })
  @ApiNotFoundResponse({ description: 'Отзыв не найден' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.reviewsService.remove(id);
  }
}
