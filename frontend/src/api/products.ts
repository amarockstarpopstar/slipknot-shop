import { http } from './http';

export interface CategoryDto {
  id: number;
  name: string;
}

export interface ProductDto {
  id: number;
  title: string;
  description: string | null;
  price: number;
  sku: string;
  imageUrl: string | null;
  category: CategoryDto | null;
  sizes: ProductSizeDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductSizeDto {
  id: number;
  size: string;
  price: number;
  stock: number;
  stockId: number | null;
  stockUpdatedAt: string | null;
}

export interface ProductSizePayload {
  size: string;
  price: number;
  stock: number;
}

export const fetchProducts = async (search?: string): Promise<ProductDto[]> => {
  const { data } = await http.get<ProductDto[]>('/products', {
    params: search ? { search } : undefined,
  });
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
  imageUrl?: string;
  categoryId?: number;
  sizes?: ProductSizePayload[];
}

export interface CreateProductPayload {
  title: string;
  description?: string;
  price: number;
  sku: string;
  imageUrl?: string;
  categoryId: number;
  sizes?: ProductSizePayload[];
}

export interface UploadProductImageResponse {
  url: string;
  filename: string;
  width: number;
  height: number;
  size: number;
}

export const createProduct = async (payload: CreateProductPayload): Promise<ProductDto> => {
  const { data } = await http.post<ProductDto>('/products', payload);
  return data;
};

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

export const uploadProductImage = async (
  file: File,
): Promise<UploadProductImageResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await http.post<UploadProductImageResponse>(
    '/products/upload-image',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  return data;
};
