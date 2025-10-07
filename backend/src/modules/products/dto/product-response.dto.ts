// dto for returning product details
export class ProductResponseDto {
  id: number;
  title: string;
  description: string | null;
  price: number;
  sku: string;
  stock: number;
  mainImageUrl: string | null;
  category: {
    id: number;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
