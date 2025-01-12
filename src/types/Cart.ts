import type { PreorderedProduct } from "@/types/PreorderedProducts";

export interface newCartItem {
  selectedCart: string;
  amount: number | null;
  quantity: number;
  productId: string;
  price?: number;
}

export interface Cart {
  cart_id: string;
  title: string;
  owner_name: string;
  total?: number;
  created_timestamp?: string;
  products?: newCartItem[];
}

export interface CartDocument {
  orderid: string;
  orderdate: string;
  comment: string;
  grouping: string;
}

export interface preorderCart {
  selectedCart: string;
  preorders: PreorderedProduct[];
}
