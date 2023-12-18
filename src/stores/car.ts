import { defineStore } from "pinia";

export const useCarStore = defineStore({
  id: "car",
  state: () => ({
    data: [] as object,
  }),
  actions: {
    setVehicle(data: any) {
      console.log("setVehicle");
      this.data = data;
    },
    unsetVehicle() {
      console.log("unsetVehicle");
      this.data = [];
    },
  },
});
