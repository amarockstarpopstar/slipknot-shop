import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

// dto for creating new size option
export class CreateSizeDto {
  @ApiProperty({ example: 'XL', description: 'Название размера' })
  @IsString({ message: 'Название размера должно быть строкой' })
  @Length(1, 50, { message: 'Название размера должно содержать от 1 до 50 символов' })
  name: string;
}
