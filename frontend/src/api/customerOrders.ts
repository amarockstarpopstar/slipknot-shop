import { http } from './http';

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
}

export const fetchCustomerOrders = async (): Promise<CustomerOrderDto[]> => {
  const { data } = await http.get<CustomerOrderDto[]>('/customer/orders');
  return data;
};
