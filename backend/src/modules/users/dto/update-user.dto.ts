import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

// dto for updating user data by administrator
export class UpdateUserDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Имя должно быть строкой' })
  @Length(2, 150, { message: 'Имя должно содержать от 2 до 150 символов' })
  name?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail({}, { message: 'Введите корректный email' })
  @MaxLength(150, { message: 'Email должен содержать не более 150 символов' })
  email?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Телефон должен быть строкой' })
  @MaxLength(30, { message: 'Телефон должен содержать не более 30 символов' })
  phone?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Роль должна быть строкой' })
  @MaxLength(100, { message: 'Роль должна содержать не более 100 символов' })
  roleName?: string;
}
