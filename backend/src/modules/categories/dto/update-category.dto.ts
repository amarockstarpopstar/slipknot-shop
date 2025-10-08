import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';

// dto for updating category
export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Футболки', description: 'Новое название категории' })
  @IsOptional()
  @IsString({ message: 'Название категории должно быть строкой' })
  @Length(2, 120, {
    message: 'Название категории должно содержать от 2 до 120 символов',
  })
  name?: string;

  @ApiPropertyOptional({ example: 'Обновлённое описание категории', description: 'Описание категории' })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiPropertyOptional({ example: 2, description: 'Идентификатор родительской категории' })
  @IsOptional()
  @IsInt({ message: 'Идентификатор родительской категории должен быть числом' })
  parentId?: number;
}
