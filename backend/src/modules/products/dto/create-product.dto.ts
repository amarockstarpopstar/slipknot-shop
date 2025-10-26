import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

// dto for creating product
export class CreateProductDto {
  @ApiProperty({
    example: 'Футболка Slipknot Iowa',
    description: 'Название товара',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Название товара должно быть строкой' })
  @Length(2, 200, {
    message: 'Название товара должно содержать от 2 до 200 символов',
  })
  title: string;

  @ApiPropertyOptional({
    example: 'Чёрная футболка с логотипом Slipknot',
    description: 'Описание товара',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiPropertyOptional({
    example: 2990,
    description:
      'Цена товара (обязательна, если у товара отсутствуют размеры)',
  })
  @Type(() => Number)
  @ValidateIf((dto) => !dto.sizes || dto.sizes.length === 0)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Цена должна быть числом' })
  @IsPositive({ message: 'Цена должна быть больше нуля' })
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 'SLP-TS-002', description: 'Артикул товара' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Артикул должен быть строкой' })
  @Length(2, 100, { message: 'Артикул должен содержать от 2 до 100 символов' })
  sku: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/shirt.jpg',
    description: 'Ссылка на изображение товара',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  @MaxLength(500, {
    message: 'Ссылка на изображение должна содержать не более 500 символов',
  })
  imageUrl?: string;

  @ApiProperty({ example: 3, description: 'Идентификатор категории' })
  @Type(() => Number)
  @IsInt({ message: 'Идентификатор категории должен быть числом' })
  @IsPositive({ message: 'Идентификатор категории должен быть больше нуля' })
  categoryId: number;

  @ApiPropertyOptional({
    type: () => ProductSizeWithStockDto,
    isArray: true,
    description: 'Размеры и остатки товара',
  })
  @IsOptional()
  @IsArray({ message: 'Размеры должны быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => ProductSizeWithStockDto)
  sizes?: ProductSizeWithStockDto[];
}
