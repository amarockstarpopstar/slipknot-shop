import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

// dto for creating user
export class CreateUserDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @Length(2, 150, { message: 'Имя должно содержать от 2 до 150 символов' })
  name: string;

  @IsEmail({}, { message: 'Введите корректный email' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(6, 100, { message: 'Пароль должен содержать от 6 до 100 символов' })
  password: string;

  @IsOptional()
  @IsPhoneNumber('RU', { message: 'Введите корректный номер телефона' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Роль должна быть строкой' })
  roleName?: string;
}
