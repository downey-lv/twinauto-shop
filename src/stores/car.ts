import { defineStore } from "pinia";
import type { CarInfo } from "@/types/CarInfo";

type CarState = {
  data: CarInfo | null;
};

export const useCarStore = defineStore({
  id: "car",
  state: (): CarState => ({
    data: null,
  }),
  actions: {
    setVehicle(data: any) {
      this.data = data;
    },
    unsetVehicle() {
      this.data = null;
    },
  },
});
