// store.js
import { defineStore } from "pinia";

export const useDocumentImportStore = defineStore({
  id: "document-import",
  state: () => ({
    data: null,
  }),
  actions: {
    saveDataToStore(data) {
      this.data = data;
    },
    clearData() {
      this.data = null;
    },
  },
});
