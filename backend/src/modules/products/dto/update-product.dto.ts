import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { ProductSizeWithStockDto } from './product-size.dto';

// dto for updating product
export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'Футболка Slipknot 1999',
    description: 'Название товара',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Название товара должно быть строкой' })
  @Length(2, 200, {
    message: 'Название товара должно содержать от 2 до 200 символов',
  })
  title?: string;

  @ApiPropertyOptional({
    example: 'Обновлённое описание товара',
    description: 'Описание товара',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiPropertyOptional({ example: 3190, description: 'Новая цена товара' })
  @Type(() => Number)
  @ValidateIf(
    (dto) => Array.isArray(dto.sizes) && dto.sizes.length === 0,
  )
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Цена должна быть числом' })
  @IsPositive({ message: 'Цена должна быть больше нуля' })
  price?: number;

  @ApiPropertyOptional({
    example: 'SLP-TS-002-NEW',
    description: 'Артикул товара',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Артикул должен быть строкой' })
  @Length(2, 100, { message: 'Артикул должен содержать от 2 до 100 символов' })
  sku?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/shirt-new.jpg',
    description: 'Ссылка на изображение товара',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  @MaxLength(500, {
    message: 'Ссылка на изображение должна содержать не более 500 символов',
  })
  imageUrl?: string;

  @ApiPropertyOptional({ example: 5, description: 'Идентификатор категории' })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'Идентификатор категории должен быть числом' })
  categoryId?: number;

  @ApiPropertyOptional({
    type: () => ProductSizeWithStockDto,
    isArray: true,
    description: 'Набор размеров и остатков (полностью заменяет текущие)',
  })
  @IsOptional()
  @IsArray({ message: 'Размеры должны быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => ProductSizeWithStockDto)
  sizes?: ProductSizeWithStockDto[];
}
