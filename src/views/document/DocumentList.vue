<template>
  <DocumentHeader v-on:menu-data="headerUpdate" />
  <DailyFilter
    v-if="documentType === 'daily'"
    :show-user-filter="false"
    :show-payment-filter="true"
    @updateFilters="updateFilters"
  />
  <DailyFilter
    v-else
    :show-user-filter="false"
    :show-recipient-filter="false"
    show-state-filter
    :issued-label="documentType === 'in' ? 'PDF' : 'Pavadzīme'"
    :pre-select-date="false"
    @updateFilters="updateFilters"
  />
  <DocumentTable
    v-if="documentType && documentType !== 'all'"
    :type="documentType"
    :server-side="true"
    :filters="filters"
  />
</template>

<script lang="ts">
import { computed, defineComponent, watch, ref, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import DocumentHeader from "@/components/documents/DocumentHeader.vue";
import DocumentTable from "@/components/documents/DocumentTable.vue";
import DailyFilter from "@/components/documents/DailyFilter.vue";
import { useBreadcrumbStore } from "@/stores/breadcrumb";
import type { Header } from "@/types/Document";

const breadcrumbStore = useBreadcrumbStore();

export default defineComponent({
  components: {
    DocumentHeader,
    DocumentTable,
    DailyFilter,
  },
  setup() {
    const route = useRoute();

    const documentType = computed(() => {
      if (route.params.type) return String(route.params.type);
      return null;
    });

    // Set breadcrumbs
    const menuData = ref<Header[]>([]);
    const bWatcher = watch(
      [documentType, menuData],
      ([newType, newMenuData]) => {
        if (!newMenuData.length || newType === undefined) return;

        if (newType === "all") {
          breadcrumbStore.filterBreadcrumbs();
          return;
        }

        const headerData = newMenuData.find((item) => item.type === newType);

        if (!headerData) return;

        breadcrumbStore.setBreadcrumbs("document-list", {
          type: `Dokumenti: ${headerData.title}`,
        });
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      bWatcher();
    });

    const filters = ref<any>({});
    const updateFilters = (newData) => {
      filters.value = { ...newData };
    };

    return { documentType, menuData, updateFilters, filters };
  },
  methods: {
    headerUpdate(data) {
      this.menuData = data;
    },
  },
});
</script>
