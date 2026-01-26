<template>
  <div v-loading="loading">
    <div class="card mb-5">
      <div class="border-0 p-5">
        <div class="row">
          <div class="col">
            <!--suppress VueMissingComponentImportInspection -->
            <el-select-v2
              v-model="currentLocation"
              :options="locations"
              placeholder="Novietne"
              size="large"
              style="width: 100%; min-width: 240px"
              filterable
              clearable
            />
          </div>
          <div class="col">
            <div class="input-group">
              <div class="form-floating">
                <Field
                  type="text"
                  class="form-control form-control-solid"
                  name="product_id"
                  v-model="productId"
                  @keyup.enter="loadData()"
                  placeholder="ID"
                  autocomplete="off"
                  enterkeyhint="done"
                  inputmode="numeric"
                  id="product_id"
                />
                <label>ID</label>
              </div>
              <button
                class="btn btn-outline-secondary"
                type="button"
                @click="loadData()"
              >
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template v-if="currentControl">
      <template v-for="(chunk, chunkIndex) in currentControl" :key="chunkIndex">
        <div class="row g-5">
          <template v-for="(item, index) in chunk" :key="index">
            <div class="col-md-4">
              <div class="card card-stretch mb-5">
                <div class="card-body p-5">
                  <div
                    class="d-flex justify-content-center mb-3"
                    v-if="item.images[0]"
                  >
                    <img
                      :src="item.images[0]"
                      alt="Product image"
                      style="max-height: 200px; max-width: 100%"
                    />
                  </div>

                  <div class="row mb-3">
                    <label class="col-4 fw-light">ID</label>
                    <label class="col-8 fw-bold">
                      {{ item.product_id }}
                      <button
                        class="btn btn-icon btn-sm btn-active-primary"
                        @click="viewProduct(item.product_id)"
                      >
                        <i class="fa-solid fa-eye"></i>
                      </button>
                    </label>
                  </div>

                  <div class="row mb-3">
                    <label class="col-4 fw-light">Kods</label>
                    <label class="col-8 fw-bold"
                      >{{ item.productcode }} {{ item.producer }}</label
                    >
                  </div>

                  <div class="row mb-3">
                    <label class="col-4 fw-light">Nosaukums</label>
                    <label
                      class="col-8 fw-bold"
                      v-html="item.productname?.replace(`\n`, `<br/>`)"
                    ></label>
                  </div>

                  <div class="row mb-3">
                    <label class="col-4 fw-light">Novietne</label>
                    <label class="col-8 fw-bold">{{
                      item.previous_locations_string
                    }}</label>
                  </div>

                  <div class="row mb-3">
                    <label class="col-4 fw-light">Atlikums</label>
                    <label class="col-8 fw-bold">
                      <span v-if="item.target_quantity != item.rest">
                        Inventarizācijā: {{ item.target_quantity }}<br />
                        Tagad: {{ item.rest }}
                      </span>
                      <span v-else>{{ item.target_quantity }}</span>
                    </label>
                  </div>

                  <div class="row mb-3">
                    <label class="col-4 fw-light">Saskaitīts</label>
                    <label class="col-8 fw-bold">
                      {{ item.counted_quantity }}
                      <span
                        class="ms-2"
                        :class="
                          item.difference_quantity < 0
                            ? 'text-danger'
                            : 'text-success'
                        "
                      >
                        <template v-if="item.difference_quantity > 0"
                          >+</template
                        >
                        {{ item.difference_quantity }}
                      </span>
                    </label>
                  </div>

                  <template v-for="(list, idx) in item.lists" :key="idx">
                    <div class="row" v-if="list.quantity > 0">
                      <div class="col-4"></div>
                      <div class="col-8 row">
                        <div class="col">{{ list.quantity }}</div>
                        <div class="col">{{ list.location.locationname }}</div>
                        <div class="col">{{ list.user_name }}</div>
                      </div>
                    </div>
                  </template>
                </div>
                <div class="card-footer">
                  <div class="row">
                    <label class="col-md-4 fw-light">Jaunais atlikums</label>
                    <div class="col-md-4">
                      <el-input-number
                        v-model="quantities[item.product_id]"
                        :step="1"
                        :min="0"
                        class="w-100"
                      />
                    </div>
                    <div class="col-md-4">
                      <el-popconfirm
                        confirm-button-text="Saglabāt"
                        cancel-button-text="Atcelt"
                        confirm-button-type="success"
                        :title="`Saglabāt atlikumu?`"
                        :width="200"
                        @confirm="saveQuantity(item.product_id)"
                      >
                        <template #reference>
                          <el-button>Saglabāt</el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import type { ControlProduct, StockControl } from "@/types/Stock";
import { useProductStore } from "@/stores/product";
import { Field } from "vee-validate";

export default defineComponent({
  components: { Field },
  setup() {
    const control = ref<StockControl[]>([]);
    const locations = ref<any[]>([]);
    const loading = ref(false);

    const productId = ref("");
    const currentLocation = ref<number>();
    const currentControl = computed(() => {
      if (!control.value || !currentLocation.value) {
        return [];
      }

      // Find data for current location
      const data = control.value.find(
        (entry) => entry.location.locationid === currentLocation.value
      );
      if (!data) return [];

      // Split products into chunks
      const products = data.products;
      const chunkSize = 3;
      const chunks = [] as ControlProduct[][];
      for (let i = 0; i < products.length; i += chunkSize) {
        chunks.push(products.slice(i, i + chunkSize));
      }
      return chunks;
    });

    const quantities = ref({});

    // Load control
    const loadData = () => {
      loading.value = true;
      ApiService.get(`/stocktake/control`, "", { productId: productId.value })
        .then((response) => {
          control.value = response.data;

          let currentLocationExists = false;
          // Extract locations from each value
          let groupedLocations: [any[], any[]] = [[], []];

          locations.value = [];
          control.value.forEach((entry) => {
            const productCount = entry.products.length;

            // Create group if needed
            if (!groupedLocations[entry.is_counted])
              groupedLocations[entry.is_counted] = [];

            groupedLocations[entry.is_counted].push({
              value: entry.location.locationid,
              label: `${entry.location.locationname} (${productCount})`,
            });

            if (entry.location.locationid === currentLocation.value) {
              currentLocationExists = true;
            }
          });

          // Sort and group locations
          if (groupedLocations[1].length > 0) {
            groupedLocations[1].sort((a, b) => a.label.localeCompare(b.label));

            locations.value.push({
              value: "Novietne saskaitīta",
              label: "Novietne saskaitīta",
              options: groupedLocations[1],
            });
          }
          if (groupedLocations[0].length > 0) {
            groupedLocations[0].sort((a, b) => a.label.localeCompare(b.label));

            locations.value.push({
              value: "Novietne nav skaitīta",
              label: "Novietne nav skaitīta",
              options: groupedLocations[0],
            });
          }

          // Reset current location if it does not exist
          if (productId.value) {
            currentLocation.value = control.value[0]?.location.locationid;
          } else if (!currentLocationExists) {
            currentLocation.value = undefined;
          }

          // Set quantities
          quantities.value = control.value.reduce((acc, entry) => {
            entry.products.forEach((product) => {
              acc[product.product_id] = product.counted_quantity;
            });
            return acc;
          }, {});
        })
        .catch((error) => {
          console.error(`Error fetching location overview:`, error);
          push.error(`Neizdevās ielādēt datus`);
        })
        .finally(() => {
          loading.value = false;
        });
    };

    loadData();

    return {
      currentControl,
      currentLocation,
      productId,
      locations,
      quantities,
      loading,
      loadData,
    };
  },
  methods: {
    viewProduct(product_id) {
      ApiService.get(`/product/find/id/${product_id}`).then((response) => {
        const data = response.data[0];
        const productStore = useProductStore();
        if (data) productStore.setProduct([data]);
      });
    },
    saveQuantity(product_id) {
      const quantity = this.quantities[product_id];
      ApiService.post(`/stocktake/control`, {
        productId: product_id,
        correctedQuantity: quantity,
      })
        .then(() => {
          push.success(`Atlikums saglabāts`);
          this.loadData();
        })
        .catch(() => {
          push.error(`Neizdevās saglabāt atlikumu`);
        });
    },
  },
});
</script>
