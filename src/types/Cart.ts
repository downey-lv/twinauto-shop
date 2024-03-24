export interface newCartItem {
  selectedCart: string;
  amount: number | null;
  quantity: number;
  productId: string;
}

export interface Cart {
  cart_id: string;
  title: string;
  owner_name: string;
  created_timestamp?: string;
  products?: newCartItem[];
}
