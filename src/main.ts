import { createApp } from "vue";
import { createPinia } from "pinia";
import { Tooltip } from "bootstrap";
import App from "./App.vue";

//imports for app initialization
import ApiService from "@/core/services/ApiService";
import { initVeeValidate } from "@/core/plugins/vee-validate";
import { initKtIcon } from "@/core/plugins/keenthemes";

const app = createApp(App);
app.use(createPinia());

// Import router
import router from "./router";
app.use(router);

// Import element plus
import ElementPlus from "element-plus";
import lv from "element-plus/dist/locale/lv.mjs";
import "dayjs/locale/lv";
app.use(ElementPlus, {
  locale: lv,
});

// import datatable
import DataTable from "datatables.net-vue3";
import DataTablesLib from "datatables.net-bs5";
import "datatables.net-select-bs5";
DataTable.use(DataTablesLib);
app.component("DataTable", DataTable);

// Import clipboard
import Clipboard from "v-clipboard";
app.use(Clipboard);

// Import Notivue notifications
import { createNotivue } from "notivue";
import "notivue/notifications.css";
import "notivue/animations.css";

// Import primevue
import PrimeVue from "primevue/config";
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
app.use(PrimeVue);

// Import labelService
import { labelService } from "@/core/services/LabelService";
app.provide("labelService", labelService);

// Import Tour
import Vue3Tour from "vue3-tour";
import "vue3-tour/dist/vue3-tour.css";
app.use(Vue3Tour);

ApiService.init(app);
initKtIcon(app);
initVeeValidate();

// Set up tooltip
function makeTooltip(
  constructorArgs: Partial<Tooltip.Options> | undefined = undefined
) {
  return {
    mounted(el) {
      el.tooltipInstance = new Tooltip(el, constructorArgs);
    },
    beforeUnmount(el) {
      disposeTooltip(el);
    },
    updated(el) {
      disposeTooltip(el);
      el.tooltipInstance = new Tooltip(el, constructorArgs);
    },
  };
}

function disposeTooltip(el) {
  if (el.tooltipInstance) {
    el.tooltipInstance.dispose();
    delete el.tooltipInstance;
  }
}

app.directive("tooltip", makeTooltip());
app.directive("tooltip-html", makeTooltip({ html: true }));

// Place it at THE END of the app.use() chain, just right before app.mount()
export const push = createNotivue(app);
app.mount("#app");
