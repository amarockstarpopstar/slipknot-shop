import { http } from './http';

export interface OrderItemDto {
  id: number;
  product: {
    id: number;
    title: string;
    sku: string;
  };
  quantity: number;
  unitPrice: number;
}

export interface OrderDto {
  id: number;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  status: {
    id: number;
    name: string;
  };
  totalAmount: number;
  paymentMethod: string | null;
  comment: string | null;
  address: {
    id: number;
    city: string;
    street: string;
    postalCode: string;
    comment: string | null;
  } | null;
  items: OrderItemDto[];
  placedAt: string;
  shippingStatus: string;
  shippingUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusDto {
  id: number;
  name: string;
}

export interface UpdateOrderPayload {
  statusId?: number;
  totalAmount?: number;
  paymentMethod?: string;
  comment?: string;
  shippingStatus?: string;
}

export const fetchOrders = async (): Promise<OrderDto[]> => {
  const { data } = await http.get<OrderDto[]>('/orders');
  return data;
};

export const fetchOrderStatuses = async (): Promise<OrderStatusDto[]> => {
  const { data } = await http.get<OrderStatusDto[]>('/order-statuses');
  return data;
};

export const updateOrder = async (
  id: number,
  payload: UpdateOrderPayload,
): Promise<OrderDto> => {
  const { data } = await http.put<OrderDto>(`/orders/${id}`, payload);
  return data;
};

export const deleteOrder = async (id: number): Promise<void> => {
  await http.delete(`/orders/${id}`);
};
