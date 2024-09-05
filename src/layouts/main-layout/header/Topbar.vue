<template>
  <!--begin::Toolbar wrapper-->
  <div class="d-flex align-items-stretch flex-shrink-0">
    <!--    &lt;!&ndash;begin::Search&ndash;&gt;-->
    <!--    <div class="d-flex align-items-stretch ms-1 ms-lg-3">-->
    <!--      <KTSearch></KTSearch>-->
    <!--    </div>-->
    <!--    &lt;!&ndash;end::Search&ndash;&gt;-->

    <!--    &lt;!&ndash;begin::Activities&ndash;&gt;-->
    <!--    <div class="d-flex align-items-center ms-1 ms-lg-3">-->
    <!--      &lt;!&ndash;begin::drawer toggle&ndash;&gt;-->
    <!--      <div-->
    <!--        class="btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px"-->
    <!--        id="kt_activities_toggle"-->
    <!--      >-->
    <!--        <i class="bi bi-bell fs-2"></i>-->
    <!--      </div>-->
    <!--      &lt;!&ndash;end::drawer toggle&ndash;&gt;-->
    <!--    </div>-->
    <!--    &lt;!&ndash;end::Activities&ndash;&gt;-->

    <!--    &lt;!&ndash;begin::Quick links&ndash;&gt;-->
    <!--    <div class="d-flex align-items-center ms-1 ms-lg-3">-->
    <!--      &lt;!&ndash;begin::Menu&ndash;&gt;-->
    <!--      <div-->
    <!--        class="btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px"-->
    <!--        data-kt-menu-trigger="click"-->
    <!--        data-kt-menu-attach="parent"-->
    <!--        data-kt-menu-placement="bottom-end"-->
    <!--        data-kt-menu-flip="bottom"-->
    <!--      >-->
    <!--        <i class="bi bi-clipboard-check fs-2"></i>-->
    <!--      </div>-->
    <!--      <KTQuickLinksMenu></KTQuickLinksMenu>-->
    <!--      &lt;!&ndash;end::Menu&ndash;&gt;-->
    <!--    </div>-->
    <!--    &lt;!&ndash;end::Quick links&ndash;&gt;-->

    <!--    &lt;!&ndash;begin::Chat&ndash;&gt;-->
    <!--    <div class="d-flex align-items-center ms-1 ms-lg-3">-->
    <!--      &lt;!&ndash;begin::Menu wrapper&ndash;&gt;-->
    <!--      <div-->
    <!--        class="btn btn-icon btn-active-light-primary position-relative w-30px h-30px w-md-40px h-md-40px"-->
    <!--        id="kt_drawer_chat_toggle"-->
    <!--      >-->
    <!--        <i class="bi bi-app-indicator fs-2"></i>-->

    <!--        <span-->
    <!--          class="bullet bullet-dot bg-success h-6px w-6px position-absolute translate-middle top-0 start-50 animation-blink"-->
    <!--        >-->
    <!--        </span>-->
    <!--      </div>-->
    <!--      &lt;!&ndash;end::Menu wrapper&ndash;&gt;-->
    <!--    </div>-->
    <!--    &lt;!&ndash;end::Chat&ndash;&gt;-->

    <div
      class="d-flex align-items-center ms-1 ms-lg-3"
      v-if="internetStatus === false"
      title="Nav interneta, nedarbojas TecDoc un VIDe"
      v-tooltip
    >
      <div
        class="btn btn-icon btn-light-danger position-relative w-30px h-30px w-md-40px h-md-40px"
        ref="button"
      >
        <KTIcon icon-name="disconnect" icon-class="fs-2 fs-md-1" />
      </div>
    </div>

    <!--begin::Notifications-->
    <div class="d-flex align-items-center ms-1 ms-lg-3">
      <!--begin::Menu-->
      <ViewHistory />
      <!--end::Menu-->
    </div>
    <!--end::Notifications-->

    <!--begin::Theme mode-->
    <div class="d-flex align-items-center ms-1 ms-lg-3">
      <!--begin::Menu toggle-->
      <a
        href="#"
        class="btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px"
        data-kt-menu-trigger="{default:'click', lg: 'hover'}"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
      >
        <KTIcon
          icon-name="night-day"
          icon-class="theme-light-show fs-2 fs-md-1"
        />
        <KTIcon icon-name="moon" icon-class="theme-dark-show fs-2 fs-md-1" />
      </a>
      <!--begin::Menu toggle-->
      <KTThemeModeSwitcher></KTThemeModeSwitcher>
    </div>
    <!--end::Theme mode-->

    <!--begin::User-->
    <div
      class="d-flex align-items-center ms-1 ms-lg-3"
      id="kt_header_user_menu_toggle"
    >
      <!--begin::Menu-->
      <div
        class="cursor-pointer symbol symbol-30px symbol-md-40px"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
        data-kt-menu-flip="bottom"
      >
        <span class="symbol-label bg-primary text-inverse-primary fw-bold">{{
          user.name.substring(0, 2)
        }}</span>
      </div>
      <KTUserMenu></KTUserMenu>
      <!--end::Menu-->
    </div>
    <!--end::User -->

    <!--begin::Heaeder menu toggle-->
    <div
      class="d-flex align-items-center d-lg-none ms-2 me-n3"
      title="Show header menu"
    >
      <div
        class="btn btn-icon btn-active-light-primary btn-custom w-30px h-30px w-md-40px h-md-40px"
        id="kt_header_menu_mobile_toggle"
      >
        <KTIcon icon-name="text-align-left" icon-class="fs-1" />
      </div>
    </div>
    <!--end::Heaeder menu toggle-->
  </div>
  <!--end::Toolbar wrapper-->
</template>

<script lang="ts">
import {defineComponent, onBeforeUnmount, ref, watch} from "vue";
import KTSearch from "@/layouts/main-layout/search/Search.vue";
import ViewHistory from "@/layouts/main-layout/menus/ViewHistory.vue";
import KTQuickLinksMenu from "@/layouts/main-layout/menus/QuickLinksMenu.vue";
import KTUserMenu from "@/layouts/main-layout/menus/UserAccountMenu.vue";
import KTThemeModeSwitcher from "@/layouts/main-layout/theme-mode/ThemeModeSwitcher.vue";
import { useAuthStore } from "@/stores/auth";

export default defineComponent({
  name: "layout-topbar",
  components: {
    KTSearch,
    ViewHistory,
    KTQuickLinksMenu,
    KTUserMenu,
    KTThemeModeSwitcher,
  },
  setup() {
    const store = useAuthStore();
    let internetStatus = ref(true);

    const connectivityWatcher = watch(
      () => store.user.internetStatus,
      (newVal) => {
        internetStatus.value = newVal;
      }
    );

    onBeforeUnmount(() => {
      connectivityWatcher();
    });

    return {
      user: store.user,
      internetStatus,
    };
  },
});
</script>
