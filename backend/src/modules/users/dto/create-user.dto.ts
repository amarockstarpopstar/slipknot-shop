import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

// dto for creating user
export class CreateUserDto {
  @ApiProperty({ example: 'Кори Тейлор', description: 'Имя и фамилия пользователя' })
  @IsString({ message: 'Имя должно быть строкой' })
  @Length(2, 150, { message: 'Имя должно содержать от 2 до 150 символов' })
  name: string;

  @ApiProperty({ example: 'corey@slipknot.com', description: 'Электронная почта' })
  @IsEmail({}, { message: 'Введите корректный email' })
  email: string;

  @ApiProperty({ example: 'verySecure123', description: 'Пароль пользователя' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(6, 100, { message: 'Пароль должен содержать от 6 до 100 символов' })
  password: string;

  @ApiPropertyOptional({ example: '+7 (900) 123-45-67', description: 'Номер телефона' })
  @IsOptional()
  @IsPhoneNumber('RU', { message: 'Введите корректный номер телефона' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Россия', description: 'Страна пользователя' })
  @IsOptional()
  @IsString({ message: 'Страна должна быть строкой' })
  @MaxLength(100, { message: 'Страна должна содержать не более 100 символов' })
  country?: string;

  @ApiPropertyOptional({ example: 'Москва', description: 'Город пользователя' })
  @IsOptional()
  @IsString({ message: 'Город должен быть строкой' })
  @MaxLength(100, { message: 'Город должен содержать не более 100 символов' })
  city?: string;

  @ApiPropertyOptional({ example: 'ул. Арбат, д. 12, кв. 34', description: 'Полный адрес пользователя' })
  @IsOptional()
  @IsString({ message: 'Адрес должен быть строкой' })
  @MaxLength(500, { message: 'Адрес должен содержать не более 500 символов' })
  address?: string;

  @ApiPropertyOptional({ example: 'Администратор', description: 'Название роли' })
  @IsOptional()
  @IsString({ message: 'Роль должна быть строкой' })
  roleName?: string;
}
