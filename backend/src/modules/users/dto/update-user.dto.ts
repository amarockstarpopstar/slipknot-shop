import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({ example: 'Сид Уилсон', description: 'Новое имя пользователя' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Имя должно быть строкой' })
  @Length(2, 150, { message: 'Имя должно содержать от 2 до 150 символов' })
  name?: string;

  @ApiPropertyOptional({ example: 'sid@slipknot.com', description: 'Новый email' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail({}, { message: 'Введите корректный email' })
  @MaxLength(150, { message: 'Email должен содержать не более 150 символов' })
  email?: string;

  @ApiPropertyOptional({ example: '+7 (900) 765-43-21', description: 'Новый номер телефона' })
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Телефон должен быть строкой' })
  @MaxLength(30, { message: 'Телефон должен содержать не более 30 символов' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Менеджер', description: 'Роль пользователя' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Роль должна быть строкой' })
  @MaxLength(100, { message: 'Роль должна содержать не более 100 символов' })
  roleName?: string;
}
