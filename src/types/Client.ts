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
  require_invoice_pdf?: boolean;
  credit?: number | null;
  comment: string;
  email: string;
  status?: ClientStatus;
}

interface ClientDebts {
  label: string;
  days: number;
  amount: number;
}

export interface ClientStatus {
  balance?: number;
  blocked_reasons: string[];
  blocked: boolean;
  credit_left: number;
  credit_used: number;
  debts: ClientDebts[];
}
