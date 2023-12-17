import type { Product } from "./Product";

export interface Company {
  id: string;
  name: string;
  default_payterm: string;
}

export interface Type {
  id: string;
  name: string;
  grouping: string;
}

export interface DocumentProduct {
  valid: boolean;
  entryid?: string;
  productid: string;
  productcode: string;
  producer: string;
  productname: string;
  quantity: number;
  price: number;
  priceVAT: number;
  total: number;
  comment: string;
  matches: Product[];
  selectedMatch?: number;
  imported?: ImportedProduct;
  data?: object[];
}

export interface Document {
  orderid?: string;
  islocked: boolean;
  companyid: string;
  companyname?: string;
  orderdate: Date | null;
  payterm: Date | null;
  ordertypeid: string;
  ordertypename?: string;
  waybillno: string;
  comment: string;
  vat: number;
  products: DocumentProduct[];
  deletedItems: string[];
  is_paid?: boolean;
  paid_date?: Date;
  grouping?: string;
  links?: DocumentLinks;
  returnid?: string;
}

interface DocumentLinks {
  invoice: string | null;
  repair: string | null;
  prepaid: string | null;
}

export interface Header {
  title: string;
  type: string;
}

export interface Imported {
  company: string;
  bill: string;
  date: string;
  term: string;
  comment: string;
  items: ImportedProduct[];
}

export interface ImportedProduct {
  code: string;
  name: string;
  quantity: number;
  price: number;
  matches: Product[];
}
