import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReviewAuthorDto {
  @ApiProperty({ example: 7, description: 'Идентификатор автора отзыва' })
  id: number;

  @ApiProperty({ example: 'Кори Тейлор', description: 'Имя автора отзыва' })
  name: string;
}

// dto returned when reading reviews
export class ReviewResponseDto {
  @ApiProperty({ example: 21, description: 'Идентификатор отзыва' })
  id: number;

  @ApiProperty({ example: 5, description: 'Оценка товара' })
  rating: number;

  @ApiPropertyOptional({
    example: 'Футболка просто огонь!',
    description: 'Комментарий к отзыву',
    nullable: true,
  })
  comment: string | null;

  @ApiProperty({ example: 'pending', description: 'Статус модерации отзыва' })
  status: string;

  @ApiProperty({ example: 10, description: 'Идентификатор товара' })
  productId: number;

  @ApiProperty({ type: () => ReviewAuthorDto, description: 'Автор отзыва' })
  author: ReviewAuthorDto;

  @ApiProperty({ description: 'Дата создания отзыва' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления отзыва' })
  updatedAt: Date;
}
