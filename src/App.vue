<template>
  <RouterView />

  <Notivue v-slot="item">
    <Notifications :item="item" />
  </Notivue>
</template>

<script lang="ts">
import {
  defineComponent,
  nextTick,
  onBeforeMount,
  onMounted,
  watch,
} from "vue";
import { RouterView, useRoute } from "vue-router";
import { useConfigStore } from "@/stores/config";
import { useThemeStore } from "@/stores/theme";
import { useBodyStore } from "@/stores/body";
import { themeConfigValue } from "@/core/helpers/config";
import { initializeComponents } from "@/core/plugins/keenthemes";
import { Notivue, Notifications } from "notivue";
import { removeTooltip } from "@/core/helpers/dom";

export default defineComponent({
  name: "app",
  components: {
    RouterView,
    Notivue,
    Notifications,
  },
  setup() {
    const configStore = useConfigStore();
    const themeStore = useThemeStore();
    const bodyStore = useBodyStore();
    const route = useRoute();

    onBeforeMount(() => {
      /**
       * Overrides the layout config using saved data from localStorage
       * remove this to use static config (@/core/config/DefaultLayoutConfig.ts)
       */
      configStore.overrideLayoutConfig();

      /**
       *  Sets a mode from configuration
       */
      themeStore.setThemeMode(themeConfigValue.value);
    });

    onMounted(() => {
      nextTick(() => {
        initializeComponents();

        bodyStore.removeBodyClassName("page-loading");
      });
    });

    // Watch for route changes
    watch(
      () => route.fullPath,
      () => {
        removeTooltip();
      }
    );
  },
});
</script>

<style lang="scss">
@import "bootstrap-icons/font/bootstrap-icons.css";
@import "quill/dist/quill.snow.css";
@import "sweetalert2/dist/sweetalert2.css";
@import "element-plus/dist/index.css";

// Main demo style scss
@import "assets/keenicons/duotone/style.css";
@import "assets/keenicons/outline/style.css";
@import "assets/keenicons/solid/style.css";
@import "assets/sass/element-ui.dark";
@import "assets/sass/plugins";
@import "assets/sass/style";

#app {
  display: contents;
}
</style>
