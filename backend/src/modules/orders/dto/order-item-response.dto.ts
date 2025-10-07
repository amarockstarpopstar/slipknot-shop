// dto describing order item for manager view
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
