import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// dto for creating a new order from manager panel
export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'Идентификатор пользователя' })
  @Type(() => Number)
  @IsInt({ message: 'Пользователь должен быть указан' })
  @IsPositive({
    message: 'Идентификатор пользователя должен быть положительным',
  })
  userId: number;

  @ApiProperty({ example: 2, description: 'Идентификатор статуса заказа' })
  @Type(() => Number)
  @IsInt({ message: 'Статус заказа должен быть указан' })
  @IsPositive({ message: 'Идентификатор статуса должен быть положительным' })
  statusId: number;

  @ApiProperty({ example: 7490.5, description: 'Итоговая сумма заказа' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Сумма заказа должна быть числом' },
  )
  @Min(0, { message: 'Сумма заказа не может быть отрицательной' })
  totalAmount: number;

  @ApiPropertyOptional({
    example: 'Банковская карта',
    description: 'Способ оплаты',
  })
  @IsOptional()
  @IsString({ message: 'Способ оплаты должен быть строкой' })
  @MaxLength(100, {
    message: 'Способ оплаты должен содержать не более 100 символов',
  })
  paymentMethod?: string;

  @ApiPropertyOptional({
    example: 'Готовится к отправке',
    description: 'Статус доставки',
  })
  @IsOptional()
  @IsString({ message: 'Статус доставки должен быть строкой' })
  @MaxLength(120, {
    message: 'Статус доставки должен содержать не более 120 символов',
  })
  shippingStatus?: string;

  @ApiPropertyOptional({
    example: 'Позвонить перед доставкой',
    description: 'Комментарий менеджера',
  })
  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  comment?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Идентификатор адреса доставки',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'Идентификатор адреса должен быть целым числом' })
  @IsPositive({ message: 'Идентификатор адреса должен быть положительным' })
  addressId?: number;
}
