import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, Length, Min } from 'class-validator';

// dto describing size + stock payload for product creation/update
export class ProductSizeWithStockDto {
  @ApiProperty({ example: 'L', description: 'Название размера' })
  @IsString({ message: 'Название размера должно быть строкой' })
  @Length(1, 20, {
    message: 'Название размера должно содержать от 1 до 20 символов',
  })
  size: string;

  @ApiProperty({ example: 15, description: 'Количество товара на складе' })
  @IsInt({ message: 'Количество должно быть целым числом' })
  @Min(0, { message: 'Количество не может быть отрицательным' })
  stock: number;
}

// dto describing size info returned to clients
export class ProductSizeStockResponseDto {
  @ApiProperty({ example: 42, description: 'Идентификатор размера товара' })
  id: number;

  @ApiProperty({ example: 'L', description: 'Название размера' })
  size: string;

  @ApiProperty({ example: 10, description: 'Текущее количество на складе' })
  stock: number;

  @ApiPropertyOptional({
    example: 77,
    description: 'Идентификатор записи склада (size_stock)',
    nullable: true,
  })
  stockId: number | null;

  @ApiPropertyOptional({
    description: 'Дата последнего обновления остатка',
    nullable: true,
  })
  stockUpdatedAt: Date | null;
}
