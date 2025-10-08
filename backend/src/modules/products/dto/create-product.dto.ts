import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

// dto for creating product
export class CreateProductDto {
  @ApiProperty({ example: 'Футболка Slipknot Iowa', description: 'Название товара' })
  @IsString({ message: 'Название товара должно быть строкой' })
  @Length(2, 200, { message: 'Название товара должно содержать от 2 до 200 символов' })
  title: string;

  @ApiPropertyOptional({
    example: 'Чёрная футболка с логотипом Slipknot',
    description: 'Описание товара',
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiProperty({ example: 2990, description: 'Цена товара' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Цена должна быть числом' })
  @IsPositive({ message: 'Цена должна быть больше нуля' })
  price: number;

  @ApiProperty({ example: 'SLP-TS-002', description: 'Артикул товара' })
  @IsString({ message: 'Артикул должен быть строкой' })
  @Length(2, 100, { message: 'Артикул должен содержать от 2 до 100 символов' })
  sku: string;

  @ApiProperty({ example: 20, description: 'Количество на складе' })
  @IsInt({ message: 'Количество на складе должно быть целым числом' })
  @Min(0, { message: 'Количество на складе не может быть отрицательным' })
  stockCount: number;

  @ApiPropertyOptional({
    example: 'https://example.com/images/shirt.jpg',
    description: 'Ссылка на изображение товара',
  })
  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  @MaxLength(500, {
    message: 'Ссылка на изображение должна содержать не более 500 символов',
  })
  imageUrl?: string;

  @ApiProperty({ example: 3, description: 'Идентификатор категории' })
  @IsInt({ message: 'Идентификатор категории должен быть числом' })
  categoryId: number;

  @ApiPropertyOptional({ example: 2, description: 'Идентификатор размера', nullable: true })
  @IsOptional()
  @IsInt({ message: 'Идентификатор размера должен быть числом' })
  sizeId?: number | null;
}
