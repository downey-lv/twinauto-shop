import { defineStore } from "pinia";

type Breadcrumb = {
  name: string;
  params: string[];
  title: string;
};

type BreadcrumbsMap = { [key: string]: {} };

type StoreState = {
  breadcrumbs: BreadcrumbsMap;
};

export const useBreadcrumbStore = defineStore({
  id: "breadcrumb",
  state: (): StoreState => ({
    breadcrumbs: {},
  }),
  actions: {
    getBreadcrumbs() {
      const preparedBreadcrumbs: Breadcrumb[] = [];
      const params: string[] = [];

      for (const [name, values] of Object.entries(this.breadcrumbs)) {
        for (const [paramKey, value] of Object.entries(values)) {
          if (value) {
            params.push(paramKey);
            const b = {
              name: name,
              params: [...params],
              title: String(value),
            };
            preparedBreadcrumbs.push(b);
          }
        }
      }

      return preparedBreadcrumbs;
    },
    setBreadcrumbs(key: string, data: object, keepKeys: string[] = []) {
      this.breadcrumbs[key] = data;

      if (!(key in keepKeys)) keepKeys.push(key);
      this.filterBreadcrumbs(keepKeys);
    },
    filterBreadcrumbs(keepKeys: string[] = []) {
      // Create a new type-safe structure for your filtered entries
      const filteredEntries: [string, {}][] = keepKeys
        .filter((key) =>
          Object.prototype.hasOwnProperty.call(this.breadcrumbs, key)
        ) // filter out non-existing keys
        .map((key) => [key, this.breadcrumbs[key]]); // create the [key, value] pair

      // Now, use Object.fromEntries with the known array of entries
      this.breadcrumbs = Object.fromEntries(filteredEntries);
    },
    getLastEntry() {
      const entries = this.getBreadcrumbs();
      return entries[entries.length - 1];
    },
    trimBreadcrumbs(index) {
      // Do nothing if clicked on the last one
      if (index === this.getBreadcrumbs().length - 1) return;

      // Remove all breadcrumbs after the clicked one
      const breadcrumbs = this.getBreadcrumbs();
      breadcrumbs.splice(index + 1, breadcrumbs.length - index);

      // Remove dropped names
      const names = breadcrumbs.map((b) => b.name);
      this.filterBreadcrumbs(names);

      // Merge breadcrumbs by name and params arrays
      const mergedBreadcrumbs = breadcrumbs.reduce((acc, b) => {
        const key = b.name;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key] = [...acc[key], ...b.params];
        return acc;
      }, {});

      // Loop this.breadcrumbs (object of objects), match by keys and remove all params that are not in mergedBreadcrumbs
      for (const [name, values] of Object.entries(this.breadcrumbs)) {
        if (name in mergedBreadcrumbs) {
          for (const [paramKey, value] of Object.entries(values)) {
            if (!mergedBreadcrumbs[name].includes(paramKey)) {
              delete this.breadcrumbs[name][paramKey];
            }
          }
        }
      }
    },
  },
});
