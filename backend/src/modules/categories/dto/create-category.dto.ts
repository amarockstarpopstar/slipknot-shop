import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';

// dto for creating category
export class CreateCategoryDto {
  @ApiProperty({ example: 'Толстовки', description: 'Название категории' })
  @IsString({ message: 'Название категории должно быть строкой' })
  @Length(2, 120, {
    message: 'Название категории должно содержать от 2 до 120 символов',
  })
  name: string;

  @ApiPropertyOptional({ example: 'Тёплые худи и свитшоты', description: 'Описание категории' })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'Идентификатор родительской категории' })
  @IsOptional()
  @IsInt({ message: 'Идентификатор родительской категории должен быть числом' })
  parentId?: number;
}
