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
  @IsString({ message: 'Название товара должно быть строкой' })
  @Length(2, 200, { message: 'Название товара должно содержать от 2 до 200 символов' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Цена должна быть числом' })
  @IsPositive({ message: 'Цена должна быть больше нуля' })
  price: number;

  @IsString({ message: 'Артикул должен быть строкой' })
  @Length(2, 100, { message: 'Артикул должен содержать от 2 до 100 символов' })
  sku: string;

  @IsInt({ message: 'Количество на складе должно быть целым числом' })
  @Min(0, { message: 'Количество на складе не может быть отрицательным' })
  stockCount: number;

  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  @MaxLength(500, {
    message: 'Ссылка на изображение должна содержать не более 500 символов',
  })
  imageUrl?: string;

  @IsInt({ message: 'Идентификатор категории должен быть числом' })
  categoryId: number;

  @IsOptional()
  @IsInt({ message: 'Идентификатор размера должен быть числом' })
  sizeId?: number | null;
}
