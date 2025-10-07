// response dto for single cart item
export interface CartItemResponseDto {
  id: number;
  quantity: number;
  unitPrice: number;
  product: {
    id: number;
    title: string;
    price: number;
    imageUrl: string | null;
  };
}
