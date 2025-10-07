import { IsInt, Min } from 'class-validator';

// dto for updating cart item quantity
export class UpdateCartItemDto {
  @IsInt({ message: 'Количество должно быть целым числом' })
  @Min(1, { message: 'Количество должно быть не меньше 1' })
  quantity: number;
}
