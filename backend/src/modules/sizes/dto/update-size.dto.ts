import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

// dto for updating existing size option
export class UpdateSizeDto {
  @ApiPropertyOptional({ example: 'XXL', description: 'Новое название размера' })
  @IsOptional()
  @IsString({ message: 'Название размера должно быть строкой' })
  @Length(1, 50, { message: 'Название размера должно содержать от 1 до 50 символов' })
  name?: string;
}
