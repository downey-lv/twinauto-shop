<template>
  <div class="row g-5 g-xl-8">
    <div class="col-xl-3">
      <TecdocCar widget-classes="card-xl-stretch mb-xl-8" />
    </div>

    <div class="col-xl-9 g-5 row" v-loading="loading">
      <div class="card">
        <DataTable
          ref="table"
          id="categories"
          :columns="dt.categories.columns"
          :data="categories"
          :options="dtOptions"
          class="table table-hover table-row-bordered gy-5"
          @select="onSelect"
        >
          <thead>
            <tr class="fw-bolder text-dark p-4">
              <th v-for="(header, index) in dt.categories.headers" :key="index">
                {{ header }}
              </th>
            </tr>
          </thead>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import TecdocCar from "@/components/tecdoc/TecdocCar.vue";
import {
  getDtOptions,
  handleSelect,
  transformDtSource,
} from "@/assets/ts/layout/dtOptions";
import { useBreadcrumbStore } from "@/stores/breadcrumb";
import ApiService from "@/core/services/ApiService";

const breadcrumbStore = useBreadcrumbStore();

export default defineComponent({
  name: "tecdoc-categories",
  components: {
    TecdocCar,
  },
  setup() {
    const loading = ref<boolean>(false);
    const categories = ref();

    let dtOptions = getDtOptions(1);
    dtOptions["select"] = true;

    let dtSource = {
      categories: {
        assemblyGroupName: "Grupa",
        parentName: "Kategorija",
      },
    };

    const columnOptions = {
      categories: {
        parentName: {
          searchable: false,
          className: "text-muted",
        },
      },
    };

    const dt = transformDtSource(dtSource, columnOptions);

    return {
      categories,
      dtOptions,
      dt,
      loading,
    };
  },
  mounted() {
    this.updateBreadcrumbs();

    this.loading = true;
    ApiService.get(`tecdoc/catalogue`, String(this.$route.params.carId))
      .then((response) => {
        this.categories = response.data;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    onSelect(e, dt, type, indexes) {
      const rowData = handleSelect(dt, indexes);

      let params = this.$route.params;
      params.groupId = rowData[0]["assemblyGroupNodeId"];
      this.updateBreadcrumbs(rowData[0].assemblyGroupName);

      this.$router.push({
        name: "tecdoc-parts",
        params: params,
        query: this.$route.query,
      });
    },
    updateBreadcrumbs(selectedCategoryName = null) {
      if (selectedCategoryName) {
        breadcrumbStore.setBreadcrumbs(
          "tecdoc-parts",
          { groupId: selectedCategoryName },
          ["tecdoc-car", "tecdoc-groups"]
        );
      } else {
        breadcrumbStore.setBreadcrumbs(
          "tecdoc-groups",
          { carId: "Kategorijas" },
          ["tecdoc-car"]
        );
      }
    },
  },
});
</script>
