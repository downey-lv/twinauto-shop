import type { DocumentProduct } from "@/types/Document";
import type { Product } from "@/types/Product";

export interface ReturnDocument {
  return_id?: string;
  return_type: string;
  internal: string;
  return_comment: string;
  products: ReturnProduct[];
}

export interface ReturnProduct extends DocumentProduct {
  history: ReturnHistory[];
  orderid: string;
  maxQuantity: number;
}

export interface ReturnHistory {
  orderid: string;
  label: string;
  price: number;
  quantity: number;
}

export interface ReturnType {
  id: string;
  name: string;
}

export interface ReturnView {
  direction: string;
  title: string | null;
  return_comment: string;
  date: string;
  hasSupplier: boolean;
  hasClient: boolean;
  companyname: string;
  companyid?: string;
  status: {
    name: string;
    bg: string;
  };
  supplierDocumentType?: string;
}
