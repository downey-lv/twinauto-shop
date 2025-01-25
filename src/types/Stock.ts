export interface StockEntry {
  entry_id: number;
  quantity: number;
  productidstr: string;
  productname: string;
  productcode: string;
  producer: string;
  saleprice?: number;
}
