import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReviewModerationAuthorDto {
  @ApiProperty({ example: 3, description: 'Идентификатор автора отзыва' })
  id: number;

  @ApiProperty({ example: 'Кори Тейлор', description: 'Имя автора отзыва' })
  name: string;

  @ApiProperty({
    example: 'corey@slipknot.com',
    description: 'Email автора отзыва',
  })
  email: string;
}

class ReviewModerationProductDto {
  @ApiProperty({ example: 12, description: 'Идентификатор товара' })
  id: number;

  @ApiProperty({
    example: 'Футболка Slipknot Iowa',
    description: 'Название товара',
  })
  title: string;

  @ApiProperty({ example: 'SLP-TS-002', description: 'Артикул товара' })
  sku: string;
}

// dto returned for moderation screen in admin panel
export class ReviewModerationResponseDto {
  @ApiProperty({ example: 45, description: 'Идентификатор отзыва' })
  id: number;

  @ApiProperty({ example: 4, description: 'Оценка товара от 1 до 5' })
  rating: number;

  @ApiPropertyOptional({
    example: 'Отличное качество мерча!',
    description: 'Комментарий покупателя',
    nullable: true,
  })
  comment: string | null;

  @ApiProperty({ example: 'pending', description: 'Текущий статус модерации' })
  status: string;

  @ApiProperty({
    type: () => ReviewModerationProductDto,
    description: 'Информация о товаре',
  })
  product: ReviewModerationProductDto;

  @ApiProperty({
    type: () => ReviewModerationAuthorDto,
    description: 'Информация об авторе отзыва',
  })
  author: ReviewModerationAuthorDto;

  @ApiProperty({ description: 'Дата создания отзыва' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления отзыва' })
  updatedAt: Date;
}
