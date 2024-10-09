<template>
  <div class="row g-5 g-xl-8">
    <div class="col-xl-3">
      <TecdocCar widget-classes="card-xl-stretch mb-xl-8" />
    </div>

    <div class="col-xl-9 g-5 row" v-loading="loading">
      <div class="card p-5">
        <el-input
          v-model="filterText"
          ref="filterTextRef"
          placeholder="Meklēt"
          class="mb-5"
          clearable
        />
        <el-tree
          :data="filteredCategories"
          node-key="id"
          :default-expand-all="isFiltered"
          :key="treeKey"
          @node-expand="treeUpdate"
          @node-collapse="treeUpdate"
          ref="treeRef"
        >
          <template #default="{ node, data }">
            <span
              class="custom-tree-node"
              @dblclick.stop="openCategory(data.data, data)"
              @click="data.children ? '' : openCategory(data.data, data)"
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
import { defineComponent, nextTick, ref } from "vue";
import TecdocCar from "@/components/tecdoc/TecdocCar.vue";
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
    const filterText = ref("");
    const isFiltered = ref(false);
    const treeKey = ref(0);
    const treeRef = ref();
    const currentNode = ref();

    return {
      categories,
      filterText,
      loading,
      isFiltered,
      treeKey,
      treeRef,
      currentNode,
    };
  },
  mounted() {
    // Focus search input
    this.$nextTick(() => {
      if (this.$refs.filterTextRef)
        (this.$refs.filterTextRef as HTMLElement).focus();
    });

    // Get currentNode from sessionStorage
    const nodeData = sessionStorage.getItem("tecdoc-categories");
    if (nodeData) {
      this.currentNode = JSON.parse(nodeData);
    }

    // Load data
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

        // Set current node
        nextTick(() => {
          if (this.treeRef && this.currentNode) {
            const node = this.treeRef.getNode(this.currentNode);
            if (node) this.treeRef.setCurrentNode(node.data as Node, true);
          }
        });
      });
  },
  computed: {
    filteredCategories() {
      const cleanString = (s) => {
        return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      };

      const filterTree = (categoryData, filterValue) => {
        if (!categoryData) {
          return [];
        }

        if (!filterValue) {
          this.isFiltered = false;
          return categoryData;
        }

        // Deep clone the data to avoid modifying the original data
        const data = JSON.parse(JSON.stringify(categoryData));

        this.isFiltered = true;

        const filterLower = cleanString(filterValue);

        return data.filter(parent => {
          if (cleanString(parent.label).includes(filterLower)) {
            return true;
          }
          if (parent.children) {
            // Filter children
            parent.children = filterTree(parent.children, filterValue);
            return parent.children.length > 0;
          }
          return false;
        });
      };

      const newData = filterTree(this.categories, this.filterText);
      this.treeKey += 1;
      return newData;
    },
  },
  methods: {
    openCategory(data, node) {
      // Update current node
      this.treeUpdate(node);

      // Update breadcrumbs
      this.updateBreadcrumbs(data.name);

      // Create route
      let params = this.$route.params;
      params.groupId = data.id;

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
    treeUpdate(nodeData) {
      try {
        sessionStorage.setItem("tecdoc-categories", JSON.stringify(nodeData));
      } catch (e) {
        console.error("Error saving current node:", e);
      }
    },
  },
});
</script>
