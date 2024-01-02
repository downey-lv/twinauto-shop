export interface Client {
  companyid: string;
  companyname: string;
  pvnno: string;
  nmrno: string;
  address: string;
  country: string;
  countryName?: string;
  person: string;
  telno: string;
  account: string;
  default_payterm: number;
  vat_validated: any;
  vat_excluded: boolean;
  is_supplier: boolean;
  credit: number | null;
  balance: number;
}
