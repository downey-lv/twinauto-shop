// store.js
import { defineStore } from "pinia";

export const useViewHistoryStore = defineStore({
  id: "view-history",
  state: () => ({
    data: {},
  }),
  actions: {
    addHistory(
      type: string,
      path: string,
      title: string,
      comment: string = ""
    ) {
      if (!(type in this.data)) this.data[type] = [];

      // Remove item if already exists
      this.data[type] = this.data[type].filter((item: any) => {
        return item.path !== path;
      });

      // Add new item
      this.data[type].push({ path: path, title: title, comment: comment });

      // Keep only 20 last items
      this.data[type] = this.data[type].slice(-20);

      // Update local storage
      localStorage.setItem("viewHistory", JSON.stringify(this.data));
    },
    getHistory() {
      // Get data from local storage
      const data = localStorage.getItem("viewHistory");
      if (data) this.data = JSON.parse(data);
      return this.data;
    },
  },
});
