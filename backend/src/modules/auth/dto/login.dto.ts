import { IsEmail, IsString, Length } from 'class-validator';

// dto for login request
export class LoginDto {
  @IsEmail({}, { message: 'Введите корректный email' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(6, 100, { message: 'Пароль должен содержать от 6 до 100 символов' })
  password: string;
}
