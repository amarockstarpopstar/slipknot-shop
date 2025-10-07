import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

// dto for updating order attributes in admin panel
export class UpdateOrderDto {
  @IsOptional()
  @IsInt({ message: 'Статус заказа должен быть указан как число' })
  statusId?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Сумма заказа должна быть числом' })
  @IsPositive({ message: 'Сумма заказа должна быть больше нуля' })
  totalAmount?: number;

  @IsOptional()
  @IsString({ message: 'Способ оплаты должен быть строкой' })
  @MaxLength(100, { message: 'Название способа оплаты должно содержать не более 100 символов' })
  paymentMethod?: string;

  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  @MaxLength(1000, { message: 'Комментарий должен содержать не более 1000 символов' })
  comment?: string;
}
