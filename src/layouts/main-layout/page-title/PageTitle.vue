<template>
  <!--begin::Page title-->
  <div
    v-if="pageTitleDisplay"
    :class="`page-title d-flex flex-${pageTitleDirection} justify-content-center flex-wrap me-3`"
  >
    <template v-if="pageTitle">
      <!--begin::Title-->
      <h1
        class="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0"
      >
        {{ pageTitle }}
      </h1>
      <!--end::Title-->

      <span
        v-if="pageTitleDirection === 'row' && pageTitleBreadcrumbDisplay"
        class="h-20px border-gray-200 border-start mx-3"
      ></span>

      <!--begin::Breadcrumb-->
      <ul
        v-if="breadcrumbs && pageTitleBreadcrumbDisplay"
        class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1"
      >
        <!--begin::Item-->
        <li class="breadcrumb-item text-muted">
          <router-link to="/" class="text-muted text-hover-primary"
            >Sākums</router-link
          >
        </li>
        <!--end::Item-->
        <template v-for="(item, i) in breadcrumbs" :key="i">
          <!--begin::Item-->
          <li class="breadcrumb-item">
            <span class="bullet bg-gray-400 w-5px h-2px"></span>
          </li>
          <!--end::Item-->
          <!--begin::Item-->
          <li class="breadcrumb-item text-muted">
            <router-link
              v-if="item.name && typeof item.name !== 'function'"
              :to="{ name: item.name, params: replaceParams(item) }"
              class="text-muted text-hover-primary"
            >
              {{ item.title }}
            </router-link>
            <router-link
              v-else-if="item.link && typeof item.link !== 'function'"
              :to="item.link"
              class="text-muted text-hover-primary"
            >
              {{ item.title }}
            </router-link>

            <span v-else>{{ item }}</span>
          </li>
          <!--end::Item-->
        </template>
      </ul>
      <!--end::Breadcrumb-->
    </template>
  </div>
  <div v-else class="align-items-stretch"></div>
  <!--end::Page title-->
</template>

<script lang="ts">
import { watch, computed, defineComponent, ref } from "vue";
import {
  pageTitleBreadcrumbDisplay,
  pageTitleDirection,
  pageTitleDisplay,
} from "@/core/helpers/config";
import { useRoute } from "vue-router";
import { useBreadcrumbStore } from "@/stores/breadcrumb";

export default defineComponent({
  name: "layout-page-title",
  components: {},
  setup() {
    const route = useRoute();
    const breadcrumbs = ref();
    const stopWatchHandle = ref();

    const pageTitle = computed(() => {
      return route.meta.pageTitle;
    });

    const startWatcher = () => {
      stopWatchHandle.value = watch(
        () => breadcrumbStore.breadcrumbs,
        () => {
          breadcrumbs.value = breadcrumbStore.getBreadcrumbs();
        }
      );
    };

    const breadcrumbStore = useBreadcrumbStore();
    if (route.meta.breadcrumbStore) {
      startWatcher();
    }

    watch(
      () => route.meta.breadcrumbStore,
      (newStore, oldStore) => {
        if (oldStore && newStore !== oldStore) {
          // The breadcrumbs are not related. stop the watcher.
          if (stopWatchHandle.value) stopWatchHandle.value();

          // Start the watcher with the new store
          if (newStore) startWatcher();

          breadcrumbs.value = route.meta.breadcrumbs;
        } else {
          // Re-start the watcher
          startWatcher();
        }
      }
    );

    return {
      pageTitle,
      breadcrumbs,
      pageTitleDisplay,
      pageTitleBreadcrumbDisplay,
      pageTitleDirection,
    };
  },
  methods: {
    replaceParams(item: any) {
      let formattedParams = {};
      if (typeof item === "object" && "params" in item) {
        for (const param of item["params"]) {
          if (param in this.$route.params)
            formattedParams[param] = this.$route.params[param];
        }
      }
      return formattedParams;
    },
  },
});
</script>
