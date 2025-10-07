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

export interface UpdateProductPayload {
  title?: string;
  description?: string;
  price?: number;
  sku?: string;
  stockCount?: number;
  imageUrl?: string;
  categoryId?: number;
  sizeId?: number | null;
}

export const updateProduct = async (
  id: number,
  payload: UpdateProductPayload,
): Promise<ProductDto> => {
  const { data } = await http.put<ProductDto>(`/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await http.delete(`/products/${id}`);
};
