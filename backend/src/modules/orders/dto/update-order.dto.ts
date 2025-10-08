import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

// dto for updating order attributes in manager panel
export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 3, description: 'Новый статус заказа' })
  @IsOptional()
  @IsInt({ message: 'Статус заказа должен быть указан как число' })
  statusId?: number;

  @ApiPropertyOptional({ example: 7490, description: 'Новая сумма заказа' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Сумма заказа должна быть числом' })
  @IsPositive({ message: 'Сумма заказа должна быть больше нуля' })
  totalAmount?: number;

  @ApiPropertyOptional({ example: 'Оплата картой онлайн', description: 'Способ оплаты' })
  @IsOptional()
  @IsString({ message: 'Способ оплаты должен быть строкой' })
  @MaxLength(100, { message: 'Название способа оплаты должно содержать не более 100 символов' })
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'Уточнить время доставки', description: 'Комментарий менеджера' })
  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  @MaxLength(1000, { message: 'Комментарий должен содержать не более 1000 символов' })
  comment?: string;
}
