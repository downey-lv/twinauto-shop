import type { LinkageBrand } from "./Linkages";

export interface Shop {
  productid: string;
  productcode: string;
  productcodealphanum: string;
  productname: string;
  saleprice: string;
  rest: number;
  productgroupid: number;
  productgroup: string;
  productgroupname: string;
  volume: null | string;
  unitid: string;
  unitname: string;
  lastprice: string;
  lastsupplierid: string;
  lastsuppliername: string;
  productimageid: number;
  imageweb: boolean;
  productimage2id: null | number;
  image2web: null | boolean;
  productimage3id: null | number;
  image3web: null | boolean;
  locationid: string;
  location2id: null | string;
  locations: string;
  suppliercode: null | string;
  producer: string;
  producerid: string;
  producerimageid: string;
  tecdocid: string;
  oem_producer: boolean;
  maxsaledate: string;
  salequantity6months: number;
  productidstr: string;
  ean: null | string;
  labelfilename: string;
  message: null | string;
  description: null | string;
  comment: string;
  boldcomment: null | string;
  dimensions: null | string;
  oecode: string;
  analogi: string;
  ts: string;
  suppliercodealphanum: null | string;
  productdescriptionwithoutspaces: null | string;
  productcommentwithoutspaces: string;
  productnamewithoutspaces: string;
  boldcommentwithoutspaces: null | string;
  oecodewithoutspaces: string;
  analogiwithoutspaces: string;
  images: string[];
  producerimage: string;
  productTitle: string;
  productSubtitle: string;
  productnameFormatted: string;
  details: Detail[];
  stale: boolean;
}

export interface Tecdoc {
  manufacturerId: number;
  manufacturerName: string;
  productCode: string;
  productCodeAlphanum: string;
  productName: string;
  articleState: string;
  details: Detail[];
  oemNumbers: (string | string[])[][];
  partsList: any[]; // Define based on actual structure if needed
  byEan: boolean;
  images: {
    withFrame: Record<string, unknown>; // Adjust based on actual structure
    withoutFrame: string[];
  };
  linkages?: LinkageBrand[];
}

export interface Vide {
  autoshop_id: string;
  code: string;
  code_alphanum: string;
  tecdoc_id: number;
  producer: string;
  name: string;
  buy_price: number;
  sell_price: number;
  sell_price_2: number;
  sell_price_3: number;
  sell_price_shop: number;
  sell_price_service: number;
  cross: any[]; // Define based on actual structure if needed
  suppliers: Supplier[];
}

export interface Supplier {
  supplier_rest: number;
  supplier_id: number;
  supplier_name: string;
  supplier_price: string;
  supplier_price_gross: number;
  code_supplier: string;
  search_url: string | null;
  supplier_autoshop_id: number;
  order_date: string;
  delivery_days: number;
  delivery_warehouse: string;
  delivery_info: string;
  deposit_price: number;
  deposit_details: string;
  min_order: number;
  volume_pricing: Object;
  volume_pricing_string: string;
}

export interface Product {
  shop: Shop;
  tecdoc: Tecdoc;
  vide: Vide;
  productid: string;
  code: string;
  codeAlphanum: string;
  rest: string;
  tecdocId: number;
  producerId: string;
  producer: string;
  name: string;
  sold6Months: string;
  comment: string;
  producerimage: string;
  staleProduct: boolean;
  topProduct: boolean;
  priceBuy: string;
  priceBuyGross: number;
  priceSell: string;
  priceService: string;
  priceOnline: Record<string, string>;
  prices: Price[];
  images: string[];
  suppliers: Supplier[];
  restSupplier: number;
  exactMatch: number;
  priceDetails: string;
  priceDetailsList: string[];
  hasDeposit: boolean;
}

export interface Price {
  label: string;
  value: string;
}

export interface Detail {
  label: string;
  value: string;
}

export interface Product {
  shop: Shop;
  tecdoc: Tecdoc;
  vide: Vide;
  productid: string;
  code: string;
  codeAlphanum: string;
  rest: string;
  tecdocId: number;
  producerId: string;
  producer: string;
  name: string;
  sold6Months: string;
  comment: string;
  producerimage: string;
  staleProduct: boolean;
  topProduct: boolean;
  priceBuy: string;
  priceSell: string;
  priceService: string;
  priceOnline: Record<string, string>;
  prices: Price[];
  images: string[];
  suppliers: Supplier[];
  restSupplier: number;
  exactMatch: number;
}
