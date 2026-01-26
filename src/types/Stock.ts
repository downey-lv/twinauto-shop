export interface StockEntry {
  entry_id: number;
  quantity: number;
  productidstr: string;
  productname: string;
  productcode: string;
  producer: string;
  saleprice?: number;
}

export interface StockControl {
  location: LocationData;
  products: ControlProduct[];
  is_counted: number;
}

export interface ControlProduct {
  product_id: number;
  productcode: string;
  productname: string;
  producer: string;
  target_quantity: number;
  counted_quantity: number;
  rest: number;
  difference_quantity: number;
  images: string[];
  lists: ListData[];
  previous_locations: LocationData[];
  previous_locations_string: string;
}

interface ListData {
  list_id: number;
  user_name: string;
  location: LocationData;
  quantity: number;
}

interface LocationData {
  locationid: number;
  locationname: string;
}