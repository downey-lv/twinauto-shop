<template>
  <div class="card mb-2" v-loading="loadingFilters">
    <div class="card-header border-0 pt-5">
      <h3 class="card-title">Filtri</h3>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-lg">
          <label class="fs-6 mb-2">Grupa</label>
          <SelectComponent
            :options="settings.group"
            v-model="filters.productgroupid"
            :clearable="true"
          />
        </div>
        <div class="col-lg">
          <label class="fs-6 mb-2">Ražotājs</label>
          <SelectComponent
            :options="settings.producer"
            v-model="filters.producerid"
            :clearable="true"
          />
        </div>
        <div class="col-lg">
          <label class="fs-6 mb-2">Novietne</label>
          <SelectComponent
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
        <el-table-column property="productidstr" label="ID" sortable />
        <el-table-column property="productcode" label="Kods" sortable />
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
          <SelectComponent
            :options="settings.group"
            v-model="updateFields.productgroupid"
            :clearable="true"
          />
        </div>
        <div class="col-lg">
          <label class="fs-6 mb-2">Jaunais ražotājs</label>
          <SelectComponent
            :options="settings.producer"
            v-model="updateFields.producerid"
            :clearable="true"
          />
        </div>
        <div class="col-lg">
          <label class="fs-6 mb-2">Jaunā novietne</label>
          <SelectComponent
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
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, onBeforeUnmount } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import SelectComponent from "@/components/core/form/SelectComponent.vue";
import type { Products } from "@/types/ProductEditor";

export default defineComponent({
  components: { SelectComponent },
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
      ApiService.get("product/editor", "products", filters.value)
        .then((response) => {
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
  },
});
</script>
