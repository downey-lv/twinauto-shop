import type { Product } from "./Product";

export interface Company {
  id: string;
  name: string;
  default_payterm: string;
  require_invoice_pdf?: boolean;
  eu_vat_validated?: boolean;
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
  data?: Product;
  priceWarning?: boolean;
  buy_price?: number;
  documentBuyPrice?: number;
  index?: number;
  productTitle?: string;
  productSubtitle?: string;
  eshopQuantity?: number;
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
  deliveryCost?: number;
  balance_due?: number;
  paymentRecipient?: string;
  paymentType?: string;
  cartId?: string | null;
  confirmed?: ConfirmedInvoice | null;
  confirmed_due_date?: string | null;
  confirmed_amount?: string | number | null;
  confirmed_source?: string | null;
  confirmed_without_vat?: boolean;
  invoice_file?: InvoiceFile | null;
  pendingFile?: InvoiceFile | null;
  require_invoice_pdf?: boolean | null;
}

// Supplier invoice PDF
export interface InvoiceFile {
  fileId: number;
  fileName: string;
  size: number;
}

// Supplier-confirmed invoice values from import
export interface ConfirmedInvoice {
  dueDate: string | null;
  amount: number | null;
  source?: string | null;
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
  shipping: number;
  comment: string;
  confirmed?: ConfirmedInvoice | null;
  items: ImportedProduct[];
}

export interface ImportedProduct {
  code: string;
  name: string;
  quantity: number;
  price: number;
  matches: Product[];
}
