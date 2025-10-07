import { ProductSummaryDto } from '../../products/dto/product-summary.dto';

// dto for returning category details
export class CategoryResponseDto {
  id: number;
  name: string;
  description: string | null;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
  products: ProductSummaryDto[];
}
