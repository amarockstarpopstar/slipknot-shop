// dto describing order item for admin view
export class OrderItemResponseDto {
  id: number;
  product: {
    id: number;
    title: string;
    sku: string;
  };
  quantity: number;
  unitPrice: number;
}
