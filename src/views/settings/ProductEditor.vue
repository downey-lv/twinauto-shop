<template>
  <div class="card mb-2" v-loading="loadingFilters">
    <div class="card-header border-0 pt-5">
      <h3 class="card-title">Filtri</h3>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-lg">
          <label class="fs-6 mb-2">Grupa</label>
          <SelectComponentVirtualized
            :options="settings.group"
            v-model="filters.productgroupid"
            :clearable="true"
          />
        </div>
        <div class="col-lg">
          <label class="fs-6 mb-2">Ražotājs</label>
          <SelectComponentVirtualized
            :options="settings.producer"
            v-model="filters.producerid"
            :clearable="true"
          />
        </div>
        <div class="col-lg">
          <label class="fs-6 mb-2">Novietne</label>
          <SelectComponentVirtualized
            :options="settings.location"
            v-model="filters.locationid"
            :clearable="true"
          />
        </div>
      </div>
    </div>
  </div>

  <div class="card mb-2" v-loading="loading">
    <div class="card-header border-0 pt-5">
      <h3 class="card-title">Produkti</h3>
      <div class="card-toolbar">
        <button
          type="button"
          class="btn btn-sm btn-light btn-icon"
          title="Drukāt uzlīmes"
          v-tooltip
          @click="printLabels"
        >
          <i class="fa-solid fa-note-sticky"></i>
        </button>
      </div>
    </div>
    <div class="card-body">
      <el-input
        v-model="filterText"
        placeholder="Filtrēt"
        class="mb-2"
        clearable
      />
      <el-table
        height="600"
        :data="filterProducts"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="" width="100" sortable class-name="text-center">
          <template #default="scope">
            <div class="bg-white" style="width: 100px; height: 100px">
              <img
                v-if="scope.row.imageUrl"
                :onmouseover="`showImage('${scope.row.imageUrl}')`"
                onmouseleave="showImage()"
                :src="scope.row.imageUrl"
                style="max-width: 100px; max-height: 100px"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column property="productidstr" label="ID" sortable />
        <el-table-column property="productcode" label="Kods" sortable>
          <template #default="scope">
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ scope.row.productcode }}</span>
              <button
                class="btn btn-icon btn-sm btn-active-primary"
                @click="viewProduct(scope.row.index)"
              >
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </template>
        </el-table-column>
        <el-table-column property="producer" label="Ražotājs" sortable />
        <el-table-column label="Nosaukums" width="350" sortable>
          <template #default="scope">
            <span v-html="scope.row.productname.replace(/\n/g, '<br/>')"></span>
          </template>
        </el-table-column>
        <el-table-column property="productgroup" label="Grupa" sortable />
        <el-table-column property="locations" label="Novietnes" sortable />
      </el-table>
    </div>
  </div>
  <div class="card mb-5">
    <div class="card-body">
      <div class="row mb-2" v-loading="loadingFilters">
        <div class="col-lg">
          <label class="fs-6 mb-2">Jaunā grupa</label>
          <SelectComponentVirtualized
            :options="settings.group"
            v-model="updateFields.productgroupid"
            :clearable="true"
          />
        </div>
        <div class="col-lg">
          <label class="fs-6 mb-2">Jaunais ražotājs</label>
          <SelectComponentVirtualized
            :options="settings.producer"
            v-model="updateFields.producerid"
            :clearable="true"
          />
        </div>
        <div class="col-lg">
          <label class="fs-6 mb-2">Jaunā novietne</label>
          <SelectComponentVirtualized
            :options="settings.location"
            v-model="updateFields.locationid"
            :clearable="true"
          />
          <div class="fs-7 fw-semibold text-muted">
            Ja filtrēts pēc novietnes, aizstās to novietni ar jauno<br />
            Ja nav filtrēts pēc novietnes, nomainīs pirmo
          </div>
        </div>
      </div>
      <div class="text-center" v-if="selectedProducts.length > 0 && updateSet">
        <el-popconfirm
          confirm-button-text="Jā"
          cancel-button-text="Nē"
          :title="`Vai saglabāt ${selectedProducts.length} produktus?`"
          :width="300"
          @confirm="saveProducts"
        >
          <template #reference>
            <button
              :data-kt-indicator="loading ? 'on' : null"
              class="btn btn-lg btn-primary"
              type="submit"
            >
              <span v-if="!loading" class="indicator-label"> Saglabāt </span>
              <span v-if="loading" class="indicator-progress">
                Gaidu datus...
                <span
                  class="spinner-border spinner-border-sm align-middle ms-2"
                ></span>
              </span>
            </button>
          </template>
        </el-popconfirm>
      </div>
    </div>
  </div>

  <ImageHover />
  <DocumentLabelsModal ref="modalLabels" :pData="selectedProducts" />
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, onBeforeUnmount } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import SelectComponentVirtualized from "@/components/core/form/SelectComponentVirtualized.vue";
import type { Products } from "@/types/ProductEditor";
import DocumentLabelsModal from "@/components/documents/DocumentLabels.vue";
import { useProductStore } from "@/stores/product";
import ImageHover from "@/components/product/ImageHover.vue";

export default defineComponent({
  components: { ImageHover, DocumentLabelsModal, SelectComponentVirtualized },
  setup() {
    const loading = ref<boolean>(false);
    const loadingFilters = ref<boolean>(false);
    const settings = ref<any>({});
    const filterText = ref("");

    const containsText = (text) =>
      (text ?? "").toLowerCase().includes(filterText.value.toLowerCase());

    const filterProducts = computed(() => {
      return products.value.filter(
        (data) =>
          !filterText.value ||
          containsText(data.productname) ||
          containsText(data.productcode) ||
          containsText(data.producer) ||
          containsText(data.productgroup) ||
          containsText(data.locations)
      );
    });

    const fields = {
      productgroupid: "",
      producerid: "",
      locationid: "",
    };
    const filters = ref({ ...fields });
    const updateFields = ref({ ...fields });

    const products = ref<Products[]>([]);
    const selectedProducts = ref([] as any);

    function loadProducts() {
      loading.value = true;
      selectedProducts.value = [];

      // Stop search if all filters are empty
      if (!Object.values(filters.value).some((value) => (value || "") !== "")) {
        products.value = [];
        loading.value = false;
        return;
      }

      ApiService.get("product/editor", "products", filters.value)
        .then((response) => {
          // Add index for each product
          response.data.forEach((product, index) => {
            product.index = index;
          });

          products.value = response.data;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          loading.value = false;
        });
    }

    function checkFiltersNotEmpty(filtersRef: any): boolean {
      return Object.values(filtersRef.value).some((value) => value !== "");
    }

    // Watch filters
    const fWatcher = watch(
      filters,
      () => {
        if (checkFiltersNotEmpty(filters)) {
          loadProducts();
        } else {
          products.value = [];
        }
      },
      { deep: true }
    );

    const updateSet = computed(() => {
      return checkFiltersNotEmpty(updateFields);
    });

    onBeforeUnmount(() => {
      fWatcher();
    });

    return {
      settings,
      loading,
      loadingFilters,
      filters,
      products,
      filterText,
      filterProducts,
      selectedProducts,
      updateFields,
      updateSet,
      loadProducts,
      fields,
    };
  },
  async mounted() {
    // Loop fields and set values from query
    const query = this.$route.query;
    Object.keys(this.fields).forEach((key) => {
      if (query[key]) {
        this.filters[key] = query[key] as string;
      }
    });

    this.loadingFilters = true;
    await Promise.all([
      this.loadData("location"),
      this.loadData("producer"),
      this.loadData("group"),
    ]).finally(() => {
      this.loadingFilters = false;
    });
  },
  methods: {
    async loadData(resource: string) {
      return ApiService.get(resource)
        .then((response) => {
          this.settings[resource] = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from ${resource}:`, error);
          push.error(`Neizdevās ielādēt ${resource}`);
        });
    },
    handleSelectionChange(val: any) {
      this.selectedProducts = val;
    },
    saveProducts() {
      const productIds = this.selectedProducts.map((item) => item.productid);
      const data = {
        productIds: productIds,
        filters: this.filters,
        updateFields: this.updateFields,
      };

      this.loading = true;
      ApiService.post("product/editor/products", data)
        .then((response) => {
          push.success("Saglabāts");
          this.updateFields = { ...this.fields };
          this.loadProducts();
        })
        .catch((error) => {
          push.error("Neizdevās saglabāt");
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    printLabels() {
      // Format data for labels
      this.selectedProducts = this.selectedProducts.map((product) => {
        // Add price
        product.priceSell = product.saleprice;

        // Add name for labels
        const name = product.productname.split("\r\n");
        product.productTitle = name[0];
        product.productSubtitle = name[1] ?? "";

        // Copy information data keys
        product.data = product;
        product.data.shop = product;

        // Set printing quantity
        product.quantity = 1;
        return product;
      });

      (this.$refs.modalLabels as any).show();
    },
    viewProduct(idx) {
      const productStore = useProductStore();
      const data = this.products[idx].data;
      if (data) productStore.setProduct([data]);
    },
  },
});
</script>
