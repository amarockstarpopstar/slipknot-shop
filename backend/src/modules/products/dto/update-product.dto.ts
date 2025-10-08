import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

// dto for updating product
export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Футболка Slipknot 1999', description: 'Название товара' })
  @IsOptional()
  @IsString({ message: 'Название товара должно быть строкой' })
  @Length(2, 200, { message: 'Название товара должно содержать от 2 до 200 символов' })
  title?: string;

  @ApiPropertyOptional({ example: 'Обновлённое описание товара', description: 'Описание товара' })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiPropertyOptional({ example: 3190, description: 'Новая цена товара' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Цена должна быть числом' })
  @IsPositive({ message: 'Цена должна быть больше нуля' })
  price?: number;

  @ApiPropertyOptional({ example: 'SLP-TS-002-NEW', description: 'Артикул товара' })
  @IsOptional()
  @IsString({ message: 'Артикул должен быть строкой' })
  @Length(2, 100, { message: 'Артикул должен содержать от 2 до 100 символов' })
  sku?: string;

  @ApiPropertyOptional({ example: 30, description: 'Количество на складе' })
  @IsOptional()
  @IsInt({ message: 'Количество на складе должно быть целым числом' })
  @Min(0, { message: 'Количество на складе не может быть отрицательным' })
  stockCount?: number;

  @ApiPropertyOptional({ example: 'https://example.com/images/shirt-new.jpg', description: 'Ссылка на изображение товара' })
  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  @MaxLength(500, {
    message: 'Ссылка на изображение должна содержать не более 500 символов',
  })
  imageUrl?: string;

  @ApiPropertyOptional({ example: 5, description: 'Идентификатор категории' })
  @IsOptional()
  @IsInt({ message: 'Идентификатор категории должен быть числом' })
  categoryId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Идентификатор размера', nullable: true })
  @IsOptional()
  @IsInt({ message: 'Идентификатор размера должен быть числом' })
  sizeId?: number | null;
}
