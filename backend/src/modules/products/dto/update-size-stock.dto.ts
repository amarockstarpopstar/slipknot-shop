import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

// dto for updating stock amount for specific product size
export class UpdateProductSizeStockDto {
  @ApiProperty({
    example: 12,
    description: 'Новое количество товара на складе для выбранного размера',
    minimum: 0,
  })
  @IsInt({ message: 'Количество должно быть целым числом' })
  @Min(0, { message: 'Количество не может быть отрицательным' })
  stock: number;
}
