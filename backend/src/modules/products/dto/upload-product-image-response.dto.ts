import { ApiProperty } from '@nestjs/swagger';

// response dto for uploaded product image
export class UploadProductImageResponseDto {
  @ApiProperty({
    example: '/uploads/products/1730025600000-8d4c8e2b9f.jpg',
    description: 'Путь к изображению, доступный для фронтенда',
  })
  url: string;

  @ApiProperty({ example: 'product-preview-8d4c8e2b9f.jpg', description: 'Имя сохранённого файла' })
  filename: string;

  @ApiProperty({ example: 1024, description: 'Ширина изображения в пикселях' })
  width: number;

  @ApiProperty({ example: 1024, description: 'Высота изображения в пикселях' })
  height: number;

  @ApiProperty({ example: 345678, description: 'Размер файла в байтах' })
  size: number;
}
