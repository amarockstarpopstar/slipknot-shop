import { OrderItemResponseDto } from './order-item-response.dto';

// dto describing order details for manager responses
export class OrderResponseDto {
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
  items: OrderItemResponseDto[];
  placedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
