export interface Value {
  value: string;
  label: number | string;
}

export interface Criteria {
  id: string;
  label: string;
  values: Value[];
}

export interface CriteriaFiltered {
  [key: string]: string[];
}
