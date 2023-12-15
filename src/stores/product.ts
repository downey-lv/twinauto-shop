import { defineStore } from "pinia";
import type { Product } from "@/types/Product";

type ProductState = {
  productData: Product | null;
};

export const useProductStore = defineStore({
  id: "product",
  state: (): ProductState => ({
    productData: null,
  }),
  actions: {
    setProduct(data: any) {
      this.productData = data;
    },
  },
});
