import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user?: { userId?: number; id?: number };
}

// controller exposing review endpoints
@ApiTags('Отзывы')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

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
}
