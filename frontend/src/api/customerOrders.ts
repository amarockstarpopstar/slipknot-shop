import { http } from './http';

export interface CustomerOrderItemDto {
  id: number;
  product: {
    id: number;
    title: string;
    sku: string;
  };
  size: {
    id: number;
    size: string;
  } | null;
  quantity: number;
  unitPrice: number;
}

export interface CustomerOrderDto {
  id: number;
  totalAmount: number;
  status: {
    id: number;
    name: string;
  };
  paymentMethod: string | null;
  shippingStatus: string;
  shippingUpdatedAt: string;
  placedAt: string;
  items: CustomerOrderItemDto[];
}

export const fetchCustomerOrders = async (): Promise<CustomerOrderDto[]> => {
  const { data } = await http.get<CustomerOrderDto[]>('/customer/orders');
  return data;
};

export const cancelCustomerOrder = async (
  orderId: number,
): Promise<CustomerOrderDto> => {
  const { data } = await http.patch<CustomerOrderDto>(
    `/customer/orders/${orderId}/cancel`,
  );
  return data;
};
