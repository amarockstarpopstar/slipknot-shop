import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

// dto for updating cart item quantity
export class UpdateCartItemDto {
  @ApiProperty({
    example: 3,
    description: 'Новое количество товара',
    minimum: 1,
  })
  @IsInt({ message: 'Количество должно быть целым числом' })
  @Min(1, { message: 'Количество должно быть не меньше 1' })
  quantity: number;
}
