import { defineStore } from "pinia";

export const useCarStore = defineStore({
  id: "car",
  state: () => ({
    data: {},
  }),
  actions: {
    setVehicle(data: any) {
      this.data = data;
    },
    unsetVehicle() {
      this.data = {};
    },
  },
});
