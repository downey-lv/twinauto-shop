export interface PreorderedProduct {
  preorder_id: number;
  productid: number;
  quantity: number;
  price: number;
  supplier_id?: number;
  customer_id?: number;
  comment: string;
  user_id: number;
  created_date: string;
  delivered: boolean;
  delivered_date: string;
  productidstr: string;
  productcode: string;
  producer: string;
  productname: string;
  supplier_name?: string;
  customer_name?: string;
  user_name: string;
}

export interface newPreorderedProduct {
  preorder_id?: number | null;
  product_id: number | null;
  quantity: number;
  price: number | null;
  supplier_id?: string | null;
  customer_id?: string | null;
  comment: string;
  user_name?: string;
  created_date?: string;
  code?: string;
  producer?: string;
  tecdocId?: number;
}
