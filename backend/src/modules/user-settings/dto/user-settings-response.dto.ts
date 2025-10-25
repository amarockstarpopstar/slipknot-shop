import { ApiProperty } from '@nestjs/swagger';

type ThemeVariant = 'light' | 'dark';

type SavedFilters = Record<string, unknown>;

// dto returned to client with persisted settings
export class UserSettingsResponseDto {
  @ApiProperty({ example: 'dark', enum: ['light', 'dark'], description: 'Выбранная тема интерфейса' })
  theme: ThemeVariant;

  @ApiProperty({ example: 'DD.MM.YYYY', description: 'Формат отображения даты' })
  dateFormat: string;

  @ApiProperty({ example: '1 234,56', description: 'Формат отображения чисел' })
  numberFormat: string;

  @ApiProperty({ example: 20, description: 'Размер страницы для таблиц/списков' })
  itemsPerPage: number;

  @ApiProperty({ type: 'object', description: 'Сохранённые фильтры пользователя', additionalProperties: true })
  savedFilters: SavedFilters;
}
