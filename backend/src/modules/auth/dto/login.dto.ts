import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

// dto for login request
export class LoginDto {
  @ApiProperty({ example: 'corey@slipknot.com', description: 'Электронная почта' })
  @IsEmail({}, { message: 'Введите корректный email' })
  email: string;

  @ApiProperty({ example: 'verySecure123', description: 'Пароль' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(6, 100, { message: 'Пароль должен содержать от 6 до 100 символов' })
  password: string;
}
