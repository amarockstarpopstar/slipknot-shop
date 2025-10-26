import { ApiProperty } from '@nestjs/swagger';

export class UploadProductImageResponseDto {
  @ApiProperty({
    example: 'http://localhost:3000/uploads/products/example.webp',
    description: 'Публичная ссылка на загружённое изображение товара.',
  })
  imageUrl: string;
}
