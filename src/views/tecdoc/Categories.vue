<template>
  <div class="row g-5 g-xl-8">
    <div class="col-xl-3">
      <TecdocCar widget-classes="card-xl-stretch mb-xl-8" />
    </div>

    <div class="col-xl-9 g-5 row" v-loading="loading">
      <div class="card p-5">
        <el-input
          v-model="filterText"
          placeholder="Meklēt"
          class="mb-5"
          clearable
        />
        <el-tree
          :data="categories"
          node-key="id"
          :filter-node-method="filterNode"
          ref="treeRef"
        >
          <template #default="{ node, data }">
            <span
              class="custom-tree-node"
              @dblclick.stop="openCategory(data.data)"
              @click="data.children ? '' : openCategory(data.data)"
            >
              {{ node.label }}
            </span>
          </template>
        </el-tree>
      </div>
    </div>
  </div>
</template>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount, watch } from "vue";
import TecdocCar from "@/components/tecdoc/TecdocCar.vue";
import { useBreadcrumbStore } from "@/stores/breadcrumb";
import ApiService from "@/core/services/ApiService";
import type { WatchStopHandle } from "vue";

const breadcrumbStore = useBreadcrumbStore();

export default defineComponent({
  name: "tecdoc-categories",
  components: {
    TecdocCar,
  },
  setup() {
    const watcherHandles: WatchStopHandle[] = [];
    const loading = ref<boolean>(false);
    const categories = ref();

    // Tree setup
    const treeRef = ref();
    const filterText = ref("");

    const tWatcher = watch(filterText, (val) => {
      treeRef.value!.filter(val);
    });
    watcherHandles.push(tWatcher);

    const filterNode = (value: string, data: any) => {
      if (!value) return true;
      // Remove accents
      const cleanString = (s: string) =>
        s
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
      return cleanString(data.label).includes(cleanString(value));
    };

    onBeforeUnmount(() => {
      watcherHandles.forEach((stop) => stop());
    });

    return {
      categories,
      treeRef,
      filterNode,
      filterText,
      loading,
    };
  },
  mounted() {
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
    openCategory(data) {
      let params = this.$route.params;
      params.groupId = data.id;
      this.updateBreadcrumbs(data.name);

      this.$router.push({
        name: "tecdoc-parts",
        params: params,
        query: this.$route.query,
      });
    },
    updateBreadcrumbs(selectedCategoryName: string) {
      breadcrumbStore.setBreadcrumbs(
        "tecdoc-parts",
        { groupId: selectedCategoryName },
        ["tecdoc-car", "tecdoc-groups"]
      );
    },
  },
});
</script>
