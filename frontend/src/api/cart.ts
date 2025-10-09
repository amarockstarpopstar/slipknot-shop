import { http } from './http';

export interface CartProductDto {
  id: number;
  title: string;
  price: number;
  imageUrl: string | null;
}

export interface CartItemDto {
  id: number;
  quantity: number;
  unitPrice: number;
  product: CartProductDto;
}

export interface CartResponse {
  id: number;
  items: CartItemDto[];
  totalQuantity: number;
  totalAmount: number;
}

export interface AddCartItemPayload {
  productId: number;
  quantity?: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface CheckoutResponse {
  orderId: number;
  totalAmount: number;
  shippingStatus: string;
  shippingUpdatedAt: string;
}

export const fetchCart = async (): Promise<CartResponse> => {
  const { data } = await http.get<CartResponse>('/cart');
  return data;
};

export const addCartItem = async (payload: AddCartItemPayload): Promise<CartResponse> => {
  const { data } = await http.post<CartResponse>('/cart/items', payload);
  return data;
};

export const updateCartItemQuantity = async (
  itemId: number,
  payload: UpdateCartItemPayload,
): Promise<CartResponse> => {
  const { data } = await http.patch<CartResponse>(`/cart/items/${itemId}`, payload);
  return data;
};

export const removeCartItem = async (itemId: number): Promise<CartResponse> => {
  const { data } = await http.delete<CartResponse>(`/cart/items/${itemId}`);
  return data;
};

export const checkoutCart = async (): Promise<CheckoutResponse> => {
  const { data } = await http.post<CheckoutResponse>('/cart/checkout');
  return data;
};
