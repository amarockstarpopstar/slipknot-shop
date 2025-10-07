import { http } from './http';

export interface CategoryDto {
  id: number;
  name: string;
}

export interface SizeDto {
  id: number;
  name: string;
}

export interface ProductDto {
  id: number;
  title: string;
  description: string | null;
  price: number;
  sku: string;
  stockCount: number;
  imageUrl: string | null;
  category: CategoryDto | null;
  size: SizeDto | null;
  createdAt: string;
  updatedAt: string;
}

export const fetchProducts = async (): Promise<ProductDto[]> => {
  const { data } = await http.get<ProductDto[]>('/products');
  return data;
};

export const fetchProductById = async (id: number): Promise<ProductDto> => {
  const { data } = await http.get<ProductDto>(`/products/${id}`);
  return data;
};
