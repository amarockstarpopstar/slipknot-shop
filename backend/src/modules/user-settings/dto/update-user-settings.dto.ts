import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

type ThemeVariant = 'light' | 'dark';

type SavedFilters = Record<string, unknown>;

// dto for updating settings partially
export class UpdateUserSettingsDto {
  @ApiPropertyOptional({ enum: ['light', 'dark'], description: 'Тема интерфейса' })
  @IsOptional()
  @IsIn(['light', 'dark'])
  theme?: ThemeVariant;

  @ApiPropertyOptional({ description: 'Формат даты, например DD.MM.YYYY' })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({ description: 'Формат чисел, например 1 234,56' })
  @IsOptional()
  @IsString()
  numberFormat?: string;

  @ApiPropertyOptional({ description: 'Размер страницы для пагинации', minimum: 5, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(100)
  itemsPerPage?: number;

  @ApiPropertyOptional({ type: 'object', description: 'Сохранённые фильтры', additionalProperties: true })
  @IsOptional()
  @IsObject()
  savedFilters?: SavedFilters;
}
