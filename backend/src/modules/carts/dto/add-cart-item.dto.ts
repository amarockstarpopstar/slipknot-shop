import { IsInt, IsOptional, Min } from 'class-validator';

// dto for adding product to cart
export class AddCartItemDto {
  @IsInt({ message: 'Идентификатор товара должен быть числом' })
  productId: number;

  @IsOptional()
  @IsInt({ message: 'Количество должно быть целым числом' })
  @Min(1, { message: 'Количество должно быть не меньше 1' })
  quantity?: number;
}
