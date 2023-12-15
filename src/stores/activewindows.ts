import { defineStore } from "pinia";
import { push } from "@/main";

type Path = { [path: string]: { title: string; data: object } };

type PathState = {
  paths: Path | {};
};

export const useWindowStore = defineStore({
  id: "window",
  state: (): PathState => ({
    paths: {},
  }),
  actions: {
    addWindow(path: string, title: string, data: object) {
      this.paths[path] = { title: title, data: data };
      console.log(this.paths);
    },
    closeWindow(path: string) {
      if (path in this.paths) delete this.paths[path];

      // Redirect to first open window or to home
      // return Object.keys(this.paths)[0] ?? "/";
    },
    getWindow(path: string) {
      if (path in this.paths) {
        push.info("Atjaunoti aizpildītie dati");
        return this.paths[path];
      }
      return false;
    },
    getActiveWindows() {
      return Object.entries(this.paths).map(([key, value]) => ({
        path: key,
        title: value.title,
      }));
    },
  },
});
