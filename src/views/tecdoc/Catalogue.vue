<template>
  <div class="row g-5 g-xl-8">
    <div class="col-xl-3">
      <TecdocCar widget-classes="card-xl-stretch mb-xl-8" />
    </div>

    <div class="col-xl-9">
      <PartsTable resource="tecdoc/catalogue" :slug="url" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import TecdocCar from "@/components/tecdoc/TecdocCar.vue";
import PartsTable from "@/components/parts/PartsTable.vue";
import { useRoute } from "vue-router";
import { useBreadcrumbStore } from "@/stores/breadcrumb";

const breadcrumbStore = useBreadcrumbStore();

export default defineComponent({
  name: "tecdoc-categories",
  components: {
    TecdocCar,
    PartsTable,
  },
  setup() {
    const route = useRoute();

    const url = computed(() => {
      if (route.params.carId && route.params.groupId) {
        return `${route.params.carId}/${route.params.groupId}`;
      }
      return "";
    });

    breadcrumbStore.setBreadcrumbs("tecdoc-groups", { carId: "Kategorijas" }, [
      "tecdoc-car",
      "tecdoc-groups",
      "tecdoc-parts",
    ]);

    return { url };
  },
  beforeRouteLeave() {
    breadcrumbStore.filterBreadcrumbs(["tecdoc-car", "tecdoc-groups"]);
  },
});
</script>
