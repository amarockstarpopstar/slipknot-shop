import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

// dto for adding product to cart
export class AddCartItemDto {
  @ApiProperty({ example: 12, description: 'Идентификатор товара' })
  @IsInt({ message: 'Идентификатор товара должен быть числом' })
  productId: number;

  @ApiPropertyOptional({
    example: 45,
    description: 'Идентификатор размера товара',
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'Идентификатор размера должен быть числом' })
  productSizeId?: number | null;

  @ApiPropertyOptional({
    example: 2,
    description: 'Количество товара',
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Количество должно быть целым числом' })
  @Min(1, { message: 'Количество должно быть не меньше 1' })
  quantity?: number;
}
