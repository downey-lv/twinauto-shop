export interface CarInfo {
  name?: string;
  make?: number[];
  model?: number[];
  car?: number[];
  registration?: string;
  vin?: string;
  pl24?: string;
  warning?: string;
  csdd: {
    [key: string]: string;
  };
}
