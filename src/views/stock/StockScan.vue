<template>
  <div class="card mb-5" v-loading="loadingLocations">
    <div class="card-header border-0 pt-5">
      <h3 class="card-title" v-if="current_location && !loadingLocations">
        {{ locations[current_location] }}
      </h3>
      <div class="card-toolbar">
        <template v-if="location_change">
          <el-select-v2
            v-model="current_location_selected"
            :options="locations_select"
            placeholder="Izvēlēties"
            size="large"
            style="width: 100%; min-width: 240px"
            filterable
            clearable
          />
          <div class="text-end w-100">
            <el-button-group class="me-2 mt-1">
              <el-button @click="cancelLocation" type="danger" size="small"
                ><i class="fas fa-times"></i
              ></el-button>
              <el-button
                @click="setLocation(current_location_selected)"
                type="success"
                size="small"
                ><i class="fas fa-check"></i
              ></el-button>
            </el-button-group>
          </div>
        </template>
        <button
          class="btn btn-sm btn-light me-2"
          @click="selectLocation()"
          v-else
        >
          Mainīt novietni
        </button>
      </div>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-xl-2 col-lg-8">
          <div class="input-group">
            <button
              class="btn btn-outline-secondary d-xl-none"
              type="button"
              @click="barcodeModalState = true"
            >
              <i class="fa-solid fa-camera"></i>
            </button>
            <div class="form-floating">
              <Field
                type="text"
                class="form-control form-control-solid"
                name="current_barcode"
                v-model="current_barcode"
                @keyup.enter="addBarcode()"
                placeholder="ID vai EAN"
                autocomplete="off"
                enterkeyhint="done"
                inputmode="numeric"
                id="barcode_input"
              />
              <label>ID vai EAN</label>
            </div>
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="addBarcode()"
            >
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
        <div class="col-xl-2 col-lg-4">
          <el-form-item label="Ievadīt arī daudzumu">
            <el-switch
              v-model="openModal"
              active-text="Jā"
              inactive-text="Nē"
            />
          </el-form-item>
        </div>
      </div>
    </div>
  </div>

  <div class="card mb-5" v-if="current_location" v-loading="loadingProducts">
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
    <div class="card-body p-2">
      <el-table :data="products" style="width: 100%">
        <el-table-column type="expand">
          <template #default="props">
            <div class="p-4">
              <p
                class="mb-2"
                v-html="props.row.productname.replace(/\n/g, '<br/>')"
              ></p>
              <h4>
                Atlikums veikalā:
                <el-tag type="info">{{ props.row.rest }}</el-tag>
              </h4>
              <h4>
                Saskaitīts šeit:
                <el-tag type="info">{{ props.row.quantity }}</el-tag>
              </h4>

              <el-table :data="props.row.entries">
                <el-table-column label="Daudzums" prop="quantity" />
                <el-table-column label="Pievienots" prop="updated_timestamp">
                  <template #default="scope">
                    <span>{{
                      DateTime.fromISO(scope.row.updated_timestamp, {
                        zone: "local",
                      }).toFormat("HH:mm:ss")
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column>
                  <template #default="scope">
                    <button
                      class="btn btn-icon btn-sm btn-active-primary"
                      @click="editEntry(scope.row.entry_id)"
                    >
                      <i class="fa-solid fa-pencil"></i>
                    </button>
                  </template>
                </el-table-column>
              </el-table>

              <h4 class="mt-5">
                Saskaitīts citur:
                <el-tag type="info">{{
                  props.row.totalQuantity - props.row.quantity
                }}</el-tag>
              </h4>
              <el-table :data="props.row.otherEntries">
                <el-table-column label="Daudz." prop="quantity" />
                <el-table-column label="Nov." prop="location" />
                <el-table-column label="Liet." prop="user_name" />
                <el-table-column label="Piev." prop="updated_timestamp">
                  <template #default="scope">
                    <span>{{
                      DateTime.fromISO(scope.row.updated_timestamp, {
                        zone: "local",
                      }).toFormat("HH:mm:ss")
                    }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column property="productidstr" label="ID">
          <template #default="scope">
            <span>{{ scope.row.productidstr }}</span>
            <br />
            <button
              class="btn btn-icon btn-sm btn-active-primary"
              @click="viewProduct(scope.row.productid)"
            >
              <i class="fa-solid fa-eye"></i>
            </button>
          </template>
        </el-table-column>
        <el-table-column property="productname" label="Prece">
          <template #default="scope">
            <span class="fs-7"
              >{{ scope.row.producer }} {{ scope.row.productcode }}</span
            >
          </template>
        </el-table-column>
        <el-table-column property="quantity">
          <template #default="scope">
            <div class="d-flex justify-content-center">
              <el-tag :type="scope.row.tag">{{ scope.row.quantity }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column property="last_updated_str" label="Atj.">
          <template #default="scope">
            <span class="fs-7 text-muted">{{
              scope.row.last_updated_str
            }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <Notice
    v-else
    classes="rounded-3"
    color="warning"
    body="Nav norādīta novietne"
  ></Notice>

  <EditEntryModal :entry-id="editId" @refresh="getProducts()" ref="editModal" />

  <CameraScanner
    v-model="barcodeScanned"
    v-model:open-modal="barcodeModalState"
  />
  <DocumentLabelsModal ref="modalLabels" :pData="productsLabel" />
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref, watch } from "vue";
import { Field } from "vee-validate";
import Swal from "sweetalert2/dist/sweetalert2.js";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { useProductStore } from "@/stores/product";
import { DateTime } from "luxon";
import { useRoute } from "vue-router";
import Notice from "@/components/core/Notice.vue";
import EditEntryModal from "@/components/stock/EditEntryModal.vue";
import CameraScanner from "@/components/stock/CameraScanner.vue";
import DocumentLabelsModal from "@/components/documents/DocumentLabels.vue";
import type { StockEntry } from "@/types/Stock";
export default defineComponent({
  computed: {
    DateTime() {
      return DateTime;
    },
  },
  components: {
    DocumentLabelsModal,
    EditEntryModal,
    Notice,
    Field,
    CameraScanner,
  },
  setup() {
    const route = useRoute();

    const loadingProducts = ref(false);
    const loadingLocations = ref(false);
    const products = ref<StockEntry[]>([]);
    const productsLabel = ref<any[]>([]);
    const current_barcode = ref("");
    const current_location = ref("");
    const current_location_selected = ref("");
    const location_change = ref(false);
    const locations = ref();
    const locations_select = ref();
    const editId = ref(null);

    const openModal = ref(false);

    const barcodeScanned = ref("");
    const barcodeModalState = ref(false);

    // Load locations
    loadingLocations.value = true;
    ApiService.get(`location`)
      .then((response) => {
        const data = response.data;

        // Set value and label for select
        locations_select.value = data.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        // Create dictionary
        locations.value = data.reduce((acc, item) => {
          acc[item.id] = item.name;
          return acc;
        }, {});
      })
      .catch((error) => {
        console.error(`Error fetching location data:`, error);
        push.error(`Neizdevās ielādēt atrašanās vietas`);
      })
      .finally(() => {
        loadingLocations.value = false;
      });

    const focusInput = async () => {
      // Focus input field if not using camera scanner
      if (!barcodeModalState.value) {
        await nextTick();
        const input_field = document.getElementById("barcode_input");
        if (input_field) input_field.focus();
      }
    };

    // Load products
    const getProducts = () => {
      const scanId = route.params.scanId;

      if (!scanId) return;

      loadingProducts.value = true;
      ApiService.get(`stocktake/products/${scanId}`)
        .then((response) => {
          products.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching stocktake products:`, error);
          push.error(`Neizdevās ielādēt produktus`);
        })
        .finally(() => {
          loadingProducts.value = false;

          // Focus input field
          focusInput();
        });
    };

    // React to ID change
    const fetchData = async (scanId) => {
      // Load list data
      if (scanId) {
        ApiService.get(`stocktake/list/${scanId}`)
          .then((response) => {
            current_location.value = response.data.locationid;
            current_location_selected.value = response.data.locationid;
          })
          .catch((error) => {
            console.error(`Error fetching stocktake list:`, error);
            push.error(`Neizdevās ielādēt sarakstu`);
          });
      }

      // Get products
      getProducts();

      // Focus input field
      await focusInput();
    };

    // Watch for route changes and load data
    watch(
      () => route.params.scanId,
      (newVal) => {
        fetchData(newVal);
      }
    );

    // Load data on mount
    onMounted(() => {
      fetchData(route.params.scanId);
    });

    // Watch for openModal change and store in browser
    watch(
      () => openModal.value,
      (newVal) => {
        if (newVal) {
          localStorage.setItem("openModal", "true");
        } else {
          localStorage.removeItem("openModal");
        }
      }
    );

    // Set openModal on mount
    onMounted(() => {
      if (localStorage.getItem("openModal")) {
        openModal.value = true;
      }
    });

    return {
      current_barcode,
      current_location,
      current_location_selected,
      locations,
      locations_select,
      products,
      productsLabel,
      getProducts,
      location_change,
      editId,
      loadingProducts,
      loadingLocations,
      barcodeScanned,
      barcodeModalState,
      focusInput,
      openModal,
    };
  },
  watch: {
    barcodeScanned(newVal) {
      if (newVal) {
        this.current_barcode = newVal;
        this.addBarcode();
      }
    },
  },
  methods: {
    addBarcode() {
      // Get barcode
      const barcode = this.current_barcode;

      // Check if barcode is empty
      if (!barcode) return;

      // Clear input field
      this.current_barcode = "";
      this.barcodeScanned = "";

      // Check if location barcode
      if (barcode.startsWith("#NOVIETNE-")) {
        const location_id = barcode.replace("#NOVIETNE-", "");
        this.setLocation(location_id);
        return;
      }

      // Check if location is set
      if (!this.current_location) {
        this.notifyFailed("", "Nav norādīta novietne");
        return;
      }

      // Handle product barcode
      this.productSearch(barcode);
    },
    toast(title, text = "") {
      Swal.fire({
        title: title,
        text: text,
        icon: "success",
        showConfirmButton: false,
        stopKeydownPropagation: false,
        timer: 2000,
        toast: true,
      });
    },
    storeProduct(product) {
      // Check if productid is set
      if (!product.productid) {
        this.notifyFailed("", "Produktam nav atrasts ID");
        return;
      }

      const scanId = this.$route.params.scanId;
      if (!scanId) {
        this.notifyFailed("", "Skaitīšanas saraksts nav atrasts");
        return;
      }

      // Send product to server
      ApiService.post(`stocktake/products/${scanId}`, {
        productId: product.productid,
      })
        .then((result) => {
          // Refresh product list
          this.getProducts();

          // Open edit modal
          if (this.openModal) {
            this.editEntry(result.data.entry_id);
          } else {
            // Show notification
            this.toast(
              `${product.producer} ${product.productcode}`,
              product.productname.split("\n")[0]
            );
          }
        })
        .catch((error) => {
          console.error(`Error saving product to DB:`, error);
          this.notifyFailed("", "Neizdevās saglabāt datubāzē");
        });
    },
    productSearch(barcode) {
      let search_type = "ean";
      if (barcode.length === 5) {
        search_type = "id";
      }

      ApiService.get(`/product/find/${search_type}/${barcode}`)
        .then((response) => {
          const data = response.data;

          // Check if exactly one product was found
          if (data.length == 0) {
            this.notifyFailed(barcode, "Produkts nav atrasts");
            return;
          }

          if (data.length !== 1) {
            this.notifyFailed(barcode, "Atrasti vairāki produkti");
            return;
          }

          // Extract product
          let product = data[0];
          if (search_type === "id") {
            product = product.shop;
          }

          // Store product
          this.storeProduct(product);

          // Focus input field
          if (!this.openModal) {
            this.focusInput();
          }
        })
        .catch((error) => {
          console.error(
            `Error fetching data from product/find/${search_type}/${barcode}:`,
            error
          );
          this.notifyFailed(barcode, "Kļūda ielādējot produktu");
        });
    },
    editEntry(entry_id) {
      this.editId = entry_id;
      (this.$refs.editModal as any).show();
    },
    selectLocation() {
      this.location_change = true;
    },
    cancelLocation() {
      this.current_location_selected = this.current_location;
      this.location_change = false;
    },
    setLocation(location_id) {
      const location_name = this.locations[location_id];

      // Check if location exists
      if (!location_name) {
        this.notifyFailed("", "Novietne nav atrasta");
        return;
      }

      // Request list data from server
      ApiService.get(`stocktake/location/${location_id}`)
        .then((response) => {
          const data = response.data;
          const scanId = data.list_id;

          if (!scanId) {
            this.notifyFailed("", "Skaitīšanas saraksts nav atrasts");
            return;
          }

          // Remove dropdown
          this.cancelLocation();

          // Notify user
          this.toast(`Novietne nomainīta`, location_name);

          // Update URL
          this.$router.push({ name: "stock-scan", params: { scanId } });
        })
        .catch((error) => {
          console.error(`Error fetching stocktake data:`, error);
          this.notifyFailed("", "Neizdevās nomainīt sarakstu");
        });
    },
    notifyFailed(barcode, error = "Produkts nav atrasts") {
      // Show notification
      const result = Swal.fire({
        title: error,
        text: barcode,
        icon: "error",
      });

      // Focus input field after dismissed
      result.then(() => {
        this.focusInput();
      });

      // Play chime
      const audio = new Audio(
        "data:audio/mpeg;base64,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U2YEwAhgLghgEBYwmQETAoARMIUGMwHAKTAwBqMBQA0wegICQBj//n577nrLCtd/tvme60shFqHIp2xlVMBAAJS5QBBQaAKMBQBxBKFgBxEBMRAYEwGC45akqYC4Buuf/N93++3s958////////i7r1MZy3rDHnO2OZTn///////5gAAGA4DYuCYB4AKb4WAQDAGEqFAUKzAPAPQ2Y4gvHC4YCDCCCHIAAAAAMYU0hyierQQOpPZZihr/1xv/H+8b39fX/1841/v//4z/bP+M4t/9bzXPpTMCuZ963jUG+t/W5dV8Jgi2hVg5ixJ408R7FixppoVaNWsTUeanreSeWuO4R49olt7vnGdv4GW/Fpf/imqyuqVUzWdq7o5/2vFanuoWVc0jtUKj+f741HXlUqFQ7ePCxlSjhiDtC8N84RsgmSYBzDKMAdZhf/////wX8xsGKtBvBOjiFpJDKQg4wgA/P/////06o0PUg+xdhnlvFKHwa5XK1OgCU7FZEqlMIjLQsEQiDIaCROypZMNQHM5RONlRwN0QlMKRrMVAHM0RRNkwpMiFmMQg1MWRHAo3lBKmDhhGMwCA4S06x8CLbTSoSVmZEKXzfYHwANZMcjDvJ0CpdYw40t2Y8IYgcYsOAS5khAWWgQyYEYtEeBolIrB0AyiUQlAAbMwEM8LNcAFjIFKAEAX3RlRNVqS6EBYLAwASEIQwRwGFhkOICAXCiNGYoIW3QlJlogoBXHdMP/70mRZAAz1ilNud0AAeNFIkMAoACKBmUw53AARv0UigwCgABGQKAdFYFJByxkINER4eKCQKBM0AeMSDR5baqriv+3dHkCi2JCEIkmSAklDEgV/NnGQY0DVWiCKxUCMqHhCfsKh+4xlE17YN9lSD4QbQXXYWrBINlpgQ5ftBGXvCDiR6Ky6UmFVEtWKFmErwEItwGuWXS90ZdK2QtaWNC2jqHtbdh6HkTrd/TyRmXQc5CuEMUA8AU7ethaqnu+MQbuofFlOnOYc82V3e8r+6tV9ctyiNy6tyivRN96OQw5AEPxyGP///////4iySIujUlUCz79z8OSN5pyHK////////9zsRcn8s8qtSUvq7tXC1/////////+la36p6VezllSrKp9Hq090ZmTStavWrm+f5+tHf81D2c00jJFP6s5YwuWIXJFEU2izS9x8SDYnURJh4iho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"
      );
      audio.play();
    },
    viewProduct(product_id) {
      ApiService.get(`/product/find/id/${product_id}`).then((response) => {
        const data = response.data[0];
        const productStore = useProductStore();
        if (data) productStore.setProduct([data]);
      });
    },
    onDecode(result) {
      console.log(result);
    },
    printLabels() {
      // Format data for labels
      this.productsLabel = [...this.products] as any[];
      this.productsLabel.forEach((product) => {
        // Add price
        product.priceSell = product.saleprice;

        // Add name for labels
        const name = product.productname.split("\n");
        product.productTitle = name[0];
        product.productSubtitle = name[1] ?? "";

        // Add everything to data
        product.data = product;
        product.data.shop = product;
      });

      this.$nextTick(() => {
        // Show modal
        (this.$refs.modalLabels as any).show();
      });
    },
  },
});
</script>
