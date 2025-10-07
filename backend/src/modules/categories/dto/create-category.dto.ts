import { IsInt, IsOptional, IsString, Length } from 'class-validator';

// dto for creating category
export class CreateCategoryDto {
  @IsString({ message: 'Название категории должно быть строкой' })
  @Length(2, 120, {
    message: 'Название категории должно содержать от 2 до 120 символов',
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @IsOptional()
  @IsInt({ message: 'Идентификатор родительской категории должен быть числом' })
  parentId?: number;
}
