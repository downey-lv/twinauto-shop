<template>
  <div class="row g-5 g-xl-8">
    <div class="col-xl-3">
      <TecdocCar widget-classes="card-xl-stretch mb-xl-8" />
    </div>

    <div class="col-xl-9">
      <PartsTable resource="tecdoc/catalogue" :slug="url">
        <template v-slot:header>
          <h3 class="card-title"></h3>
          <div class="card-toolbar">
            <router-link
              :to="{ name: 'tecdoc-groups' }"
              class="btn btn-sm btn-light me-3"
            >
              Atpakaļ
            </router-link>
          </div>
        </template>
      </PartsTable>
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

    return { url };
  },
  beforeRouteLeave() {
    breadcrumbStore.filterBreadcrumbs(["tecdoc-car", "tecdoc-groups"]);
  },
});
</script>
