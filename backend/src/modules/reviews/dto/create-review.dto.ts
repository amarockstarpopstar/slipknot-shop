import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// dto for creating a new review by authenticated user
export class CreateReviewDto {
  @ApiProperty({ example: 15, description: 'Идентификатор товара' })
  @IsInt({ message: 'Идентификатор товара должен быть числом' })
  productId: number;

  @ApiProperty({ example: 5, description: 'Оценка товара от 1 до 5' })
  @IsInt({ message: 'Оценка должна быть целым числом' })
  @Min(1, { message: 'Оценка не может быть меньше 1' })
  @Max(5, { message: 'Оценка не может быть больше 5' })
  rating: number;

  @ApiPropertyOptional({
    example: 'Отличное качество мерча!',
    description: 'Текстовый комментарий к отзыву',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  @MaxLength(2000, {
    message: 'Комментарий должен содержать не более 2000 символов',
  })
  comment?: string;
}
