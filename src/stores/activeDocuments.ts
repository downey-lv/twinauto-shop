import { defineStore } from "pinia";
import type { Document } from "@/types/Document"; // Importing the Document type

type DocumentState = {
  documents: { [id: string]: { title: string; data: Document } };
};

export const useDocumentStore = defineStore({
  id: "document",
  state: (): DocumentState => ({
    documents: JSON.parse(sessionStorage.getItem("documentStore") ?? "{}"),
  }),
  actions: {
    updateStorage() {
      try {
        sessionStorage.setItem("documentStore", JSON.stringify(this.documents));
      } catch (e) {
        sessionStorage.setItem("documentStore", "");
        console.log("Quota exceeded");
      }
    },
    addDocument(id: string, title: string, documentData: Document) {
      this.documents[id] = { title: title, data: documentData };
      this.updateStorage();
    },
    removeDocument(id: string) {
      if (id in this.documents) {
        delete this.documents[id];
        this.updateStorage();
      } else {
        console.warn(`Document with ID ${id} not found.`);
      }
    },
    getDocument(id: string) {
      if (id in this.documents) {
        return this.documents[id];
      }
      return null;
    },
    getActiveDocuments() {
      return this.documents;
    },
  },
});
