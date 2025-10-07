import { IsOptional, IsString, Length } from 'class-validator';

// dto for updating existing size option
export class UpdateSizeDto {
  @IsOptional()
  @IsString({ message: 'Название размера должно быть строкой' })
  @Length(1, 50, { message: 'Название размера должно содержать от 1 до 50 символов' })
  name?: string;
}
