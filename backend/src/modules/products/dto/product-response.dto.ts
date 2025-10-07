// dto for returning product details
export class ProductResponseDto {
  id: number;
  title: string;
  description: string | null;
  price: number;
  sku: string;
  stockCount: number;
  imageUrl: string | null;
  category: {
    id: number;
    name: string;
  } | null;
  size: {
    id: number;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
