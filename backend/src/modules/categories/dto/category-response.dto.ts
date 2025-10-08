import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductSummaryDto } from '../../products/dto/product-summary.dto';

// dto for returning category details
export class CategoryResponseDto {
  @ApiProperty({ example: 3, description: 'Идентификатор категории' })
  id: number;

  @ApiProperty({ example: 'Толстовки', description: 'Название категории' })
  name: string;

  @ApiPropertyOptional({ example: 'Тёплые худи и свитшоты', description: 'Описание категории', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ example: 1, description: 'Идентификатор родительской категории', nullable: true })
  parentId: number | null;

  @ApiProperty({ description: 'Дата создания категории' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления категории' })
  updatedAt: Date;

  @ApiProperty({ type: () => ProductSummaryDto, isArray: true, description: 'Товары, относящиеся к категории' })
  products: ProductSummaryDto[];
}
