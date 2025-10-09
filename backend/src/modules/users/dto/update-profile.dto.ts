import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

// dto for updating current user profile
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Мик Томсон', description: 'Имя пользователя' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Имя должно быть строкой' })
  @Length(2, 150, { message: 'Имя должно содержать от 2 до 150 символов' })
  name?: string;

  @ApiPropertyOptional({ example: 'mick@slipknot.com', description: 'Электронная почта' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail({}, { message: 'Введите корректный email' })
  @MaxLength(150, { message: 'Email должен содержать не более 150 символов' })
  email?: string;

  @ApiPropertyOptional({ example: '+7 (900) 654-32-10', description: 'Номер телефона' })
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Телефон должен быть строкой' })
  @MaxLength(30, { message: 'Телефон должен содержать не более 30 символов' })
  phone?: string;

  @ApiPropertyOptional({ example: 'НадёжныйПароль123', description: 'Новый пароль' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(6, 100, { message: 'Пароль должен содержать от 6 до 100 символов' })
  password?: string;

  @ApiPropertyOptional({ example: 'Россия', description: 'Страна проживания' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Страна должна быть строкой' })
  @MaxLength(100, { message: 'Страна должна содержать не более 100 символов' })
  country?: string;

  @ApiPropertyOptional({ example: 'Москва', description: 'Город проживания' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Город должен быть строкой' })
  @MaxLength(100, { message: 'Город должен содержать не более 100 символов' })
  city?: string;

  @ApiPropertyOptional({ example: 'ул. Арбат, д. 12, кв. 34', description: 'Полный адрес проживания' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Адрес должен быть строкой' })
  @MaxLength(500, { message: 'Адрес должен содержать не более 500 символов' })
  address?: string;
}
