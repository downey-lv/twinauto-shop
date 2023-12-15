<template>
  <!--begin::Menu wrapper-->
  <div
    class="header-menu align-items-stretch"
    data-kt-drawer="true"
    data-kt-drawer-name="header-menu"
    data-kt-drawer-activate="{default: true, lg: false}"
    data-kt-drawer-overlay="true"
    data-kt-drawer-width="{default:'200px', '300px': '250px'}"
    data-kt-drawer-direction="end"
    data-kt-drawer-toggle="#kt_header_menu_mobile_toggle"
    data-kt-swapper="true"
    data-kt-swapper-mode="prepend"
    data-kt-swapper-parent="{default: '#kt_body', lg: '#kt_header_menu_nav'}"
  >
    <!--begin::Menu-->
    <div
      class="menu menu-lg-rounded menu-column menu-lg-row menu-state-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-400 fw-semobold my-5 my-lg-0 align-items-stretch"
      id="#kt_header_menu"
      data-kt-menu="true"
    >
      <template v-for="(item, i) in activeWindows" :key="i">
        <div class="menu-item me-lg-1">
          <router-link class="menu-link fs-8" :to="item.path" active-class="active">
            <span class="menu-title">{{ item.title }}</span>
          </router-link>
        </div>
      </template>

      <!--end::Menu-->
    </div>
  </div>
  <!--end::Menu wrapper-->
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import { useWindowStore } from "@/stores/activewindows";

export default defineComponent({
  name: "KTMenu",
  components: {},
  setup() {
    const route = useRoute();

    const hasActiveChildren = (match: string) => {
      return route.path.indexOf(match) !== -1;
    };

    const windowStore = useWindowStore();
    const activeWindows = computed(() => windowStore.getActiveWindows());

    return {
      hasActiveChildren,
      activeWindows,
    };
  },
});
</script>
