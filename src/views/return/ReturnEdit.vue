<template>
  <el-form
    @submit.prevent="submit()"
    :rules="rules"
    :model="document"
    ref="formRef"
    class="form"
  >
    <div class="card mb-5">
      <div class="card-header border-0 pt-5">
        <h3 class="card-title">
          Atgriešana: {{ document.return_id ?? "Jauns" }}
        </h3>
        <div class="card-toolbar">
          <a
            @click="loadDocument(false)"
            class="btn btn-sm btn-light-danger me-3"
            v-if="!documentMatches"
          >
            Atcelt izmaiņas
          </a>
          <a v-else @click="closeDocument" class="btn btn-sm btn-light me-3">
            Aizvērt
          </a>

          <div>
            <button
              :data-kt-indicator="loading ? 'on' : null"
              class="btn btn-sm btn-primary"
              type="button"
              @click="submit()"
            >
              <span v-if="!loading" class="indicator-label"> Saglabāt </span>
              <span v-if="loading" class="indicator-progress">
                Gaidu datus...
                <span
                  class="spinner-border spinner-border-sm align-middle ms-2"
                ></span>
              </span>
            </button>
          </div>
        </div>
      </div>
      <div class="card-body" v-loading="loading">
        <div class="row">
          <div class="col-lg-8">
            <div class="row">
              <div class="col-lg">
                <div class="fv-row">
                  <label class="fs-6 required">Veids</label>
                  <el-form-item prop="internal">
                    <el-radio-group v-model="document.internal" size="large">
                      <el-radio-button label="true">Iekšējā</el-radio-button>
                      <el-radio-button label="false">Klienta</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </div>
                <div class="fv-row">
                  <label class="fs-6 required">Iemesls</label>
                  <SelectComponent
                    :options="types"
                    v-model="document.return_type"
                    prop="return_type"
                  />
                </div>
              </div>
              <div class="col-lg">
                <div class="fv-row">
                  <label class="fs-6">Komentārs</label>
                  <el-form-item>
                    <el-input
                      v-model="document.return_comment"
                      type="textarea"
                      :autosize="{ minRows: 2 }"
                    />
                  </el-form-item>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-if="!document.return_id">
      <div
        class="card mb-5"
        v-loading="loading"
        v-if="document.internal === 'true' && document.return_type"
      >
        <div class="card-body">
          <div class="d-none d-lg-block d-xl-block">
            <div class="row fw-semibold fs-6 mb-2">
              <div class="col-1">
                <div class="row">
                  <div class="col-3"></div>
                  <div class="col">ID</div>
                </div>
              </div>

              <div class="col-2">Kods</div>
              <div class="col-1">Ražotājs</div>
              <div class="col-2">Nosaukums</div>
              <div class="col-2">Piegādātājs</div>
              <div class="col-1">Daudzums</div>
              <div class="col-1">Cena bez PVN</div>
              <div class="col-1">Komentārs</div>
            </div>
          </div>
          <template v-for="(item, idx) in document.products" :key="idx">
            <div class="row" v-loading="loadingProduct[idx]">
              <div class="col-lg-1 pb-1">
                <div class="row">
                  <div class="col-3">
                    <div style="height: 40px" class="d-flex align-items-center">
                      <div class="hover-container">
                        <span
                          class="badge badge-square badge-light element-to-hide"
                        >
                          {{ idx + 1 }}</span
                        >
                        <a
                          href="#"
                          class="badge badge-square badge-danger element-to-show"
                          @click.prevent="deleteRow(idx)"
                          ><i class="fa-solid fa-trash text-light"></i
                        ></a>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <el-form-item :prop="`products[${idx}].productid`">
                      <el-input
                        v-model="item.productid"
                        size="large"
                        placeholder="ID"
                        :ref="'productid_' + idx"
                        @input="debounceSearch('id', idx)"
                        @keydown.enter.prevent="nextRow(idx)"
                      />
                    </el-form-item>
                  </div>
                </div>
              </div>

              <div class="col-lg-2 pb-1">
                <el-form-item :prop="`products[${idx}].productcode`">
                  <el-input
                    v-model="item.productcode"
                    clearable
                    size="large"
                    placeholder="Kods"
                    :ref="'productcode_' + idx"
                    :disabled="
                      !!item.productid && parseInt(item.productid) !== 1
                    "
                    @input="debounceSearch('code', idx)"
                    @keydown.enter.prevent="codeEnter(idx)"
                    @keydown.up.prevent="changeMatch(item, false)"
                    @keydown.down.prevent="changeMatch(item)"
                  >
                    <template #append v-if="!!item.data">
                      <el-button @click="viewProduct(idx)"
                        ><i class="fa-solid fa-eye"></i
                      ></el-button>
                    </template>
                  </el-input>
                </el-form-item>
              </div>

              <div class="col-lg-1 pb-1">
                <div style="height: 40px" class="d-flex align-items-center">
                  {{ item.producer }}
                </div>
              </div>

              <div class="col-lg-2 pb-1">
                <span
                  style="height: 40px"
                  class="d-flex align-items-center"
                  v-html="item.productname"
                ></span>
              </div>

              <div class="col-lg-2 pb-1">
                <SelectComponent
                  :options="item.history"
                  v-model="item.orderid"
                  size="large"
                  :prop="`products[${idx}].orderid`"
                  keyColumn="orderid"
                  labelColumn="label"
                  @change="selectHistory(idx)"
                />
              </div>

              <div class="col-lg-1 pb-1">
                <el-form-item :prop="`products[${idx}].quantity`">
                  <el-input-number
                    v-model="item.quantity"
                    size="large"
                    placeholder="Daudzums"
                    @keydown.enter.prevent="nextRow(idx)"
                  />
                </el-form-item>
              </div>

              <div class="col-lg-1 pb-1">
                <el-form-item :prop="`products[${idx}].price`">
                  <el-input-number
                    v-model="item.price"
                    size="large"
                    :controls="false"
                    :precision="4"
                    placeholder="Cena bez PVN"
                    @keydown.enter.prevent="nextRow(idx)"
                  />
                </el-form-item>
              </div>

              <div class="col-lg-2 pb-1">
                <el-form-item :prop="`products[${idx}].comment`">
                  <el-input
                    v-model="item.comment"
                    clearable
                    size="large"
                    placeholder="Komentārs"
                    @keydown.enter.prevent="nextRow(idx)"
                  />
                </el-form-item>
              </div>

              <!-- Add matches in a row underneath -->
              <div class="row">
                <div class="col-lg-1"></div>
                <div class="col-lg-4 pb-1">
                  <Notice
                    classes="rounded-3 mb-3"
                    color="info"
                    v-if="item.matches?.length > 0"
                  >
                    <template
                      v-for="(match, m_idx) in item.matches"
                      :key="m_idx"
                    >
                      <div class="row">
                        <div class="col d-flex flex-row">
                          <div style="width: 20px" class="text-dark">
                            <span v-if="m_idx === item.selectedMatch">►</span>
                          </div>
                          <a
                            href="#"
                            @click.prevent="selectMatch(item, match)"
                            >{{ match.productid }}</a
                          >
                        </div>
                        <div class="col">{{ match.code }}</div>
                        <div class="col">{{ match.producer }}</div>
                      </div>
                    </template>
                  </Notice>
                </div>
              </div>
            </div>
            <div
              class="separator separator-dashed my-10 d-lg-none d-xl-none"
            ></div>
          </template>
          <div class="row">
            <div class="col-1 pb-1">
              <div class="row">
                <div class="col-3">
                  <a
                    href="#"
                    class="badge badge-square badge-info"
                    @click.prevent="newRow()"
                    ><i class="fa-solid fa-plus text-light"></i
                  ></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </el-form>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  reactive,
  ref,
  toRefs,
  watch,
  onBeforeUnmount,
} from "vue";
import type { WatchStopHandle } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Decimal } from "decimal.js";
import { debounce, isEqual } from "lodash";
import Swal from "sweetalert2/dist/sweetalert2.js";
import Notice from "@/components/core/Notice.vue";
import SelectComponent from "@/components/core/form/SelectComponent.vue";
import { useRoute, useRouter } from "vue-router";
import { useProductStore } from "@/stores/product";
import { useWindowStore } from "@/stores/activewindows";
import type { FormInstance } from "element-plus";
import {
  calculatePriceVAT,
  calculateTotal,
} from "@/components/documents/calculations";
import { ProductService } from "@/components/documents/ProductService";
import {
  productValidator,
  validateCode,
  validateID,
  validatePrice,
} from "@/components/documents/validators";
import type { ReturnDocument, ReturnProduct, ReturnType } from "@/types/Return";
import "@/assets/hover-icon.css";

export default defineComponent({
  components: {
    SelectComponent,
    Notice,
  },
  setup() {
    const loading = ref<boolean>(false);
    const route = useRoute();
    const router = useRouter();
    const formRef = ref<FormInstance>();
    const watcherHandles: WatchStopHandle[] = [];

    // Initialize dropdowns
    const types = ref<ReturnType[]>([]);

    // Initialize product and document
    const blankProduct: ReturnProduct = {
      comment: "",
      maxQuantity: 0,
      valid: false,
      productid: "",
      productcode: "",
      producer: "",
      productname: "",
      quantity: 1,
      price: 0,
      priceVAT: 0,
      total: 0,
      matches: [],
      history: [],
      orderid: "",
    };

    const blankDocument: ReturnDocument = {
      return_type: "",
      internal: "",
      products: [],
      return_comment: "",
    };

    const document = ref({ ...blankDocument });

    const matchedProducts = ref({} as any);

    // Form rules
    const rules = ref({
      return_type: [
        {
          required: true,
          message: "",
          trigger: "change",
        },
      ],
      internal: [
        {
          required: true,
          message: "Jāizvēlas veids",
          trigger: "change",
        },
      ],
      products: [] as any[],
    });

    const validateQuantity = (rule, value, callback, product) => {
      if (!value) {
        callback(new Error(""));
      } else if (product.orderid !== "" && value > product.maxQuantity) {
        callback(new Error("Atgriezts vairāk nekā iepirkts"));
      } else {
        callback();
      }
    };

    const validateOrder = (rule, value, callback, product, idx) => {
      if (!value) {
        callback(new Error(""));
      } else {
        // Check if already matched with the same order, exclude if key = idx
        const alreadyMatched = Object.keys(matchedProducts.value).find(
          (key) =>
            matchedProducts.value[key].orderid === value &&
            matchedProducts.value[key].productid === product.productid &&
            parseInt(key) !== idx
        );

        if (alreadyMatched) {
          callback(new Error("Dokuments jau izmantots"));
        } else {
          callback();
        }
      }
    };

    const addProductRules = (idx) => {
      const product = document.value.products[idx];
      rules.value.products[idx] = {
        productid: [
          {
            validator: productValidator(validateID, product),
            trigger: "change",
          },
        ],
        productcode: [
          {
            validator: productValidator(validateCode, product),
            trigger: "change",
          },
        ],
        quantity: [
          {
            validator: productValidator(validateQuantity, product),
            trigger: "change",
          },
        ],
        price: [
          {
            required: true,
            validator: validatePrice,
            message: "",
            trigger: "change",
          },
        ],
        orderid: [
          {
            validator: productValidator(validateOrder, product, idx),
            trigger: "change",
          },
        ],
      };
    };

    // Define price calculators
    const vatDecimal = computed(() => new Decimal(21).dividedBy(100).plus(1));
    const useProductWatcher = (product) => {
      product.priceVAT = calculatePriceVAT(product, vatDecimal);
      product.total = calculateTotal(product, vatDecimal);
    };

    // Initialize price watcher and rules for existing products
    document.value.products.forEach((product, index) => {
      useProductWatcher(product);
      addProductRules(index);
    });

    // Watch for new products
    let previousProductsLength = document.value.products.length;
    const pWatcher = watch(
      () => document.value.products,
      (newProducts) => {
        for (let i = previousProductsLength; i < newProducts.length; i++) {
          useProductWatcher(newProducts[i]);
          addProductRules(i);
        }
        previousProductsLength = newProducts.length;
      },
      { deep: true, immediate: true }
    );
    watcherHandles.push(pWatcher);

    // Delete buttons
    const state = reactive({
      loadingProduct: document.value.products.map(() => false),
    });
    const stateRefs = toRefs(state);

    // Store window
    const windowStore = useWindowStore();
    const wWatcher = watch(
      document,
      (newValue) => {
        windowStore.addWindow(
          route.path,
          `Atgriešanas dokuments: ${document.value.return_id ?? "Jauns"}`,
          newValue
        );

        checkOriginal();
      },
      { deep: true }
    );
    watcherHandles.push(wWatcher);

    // Track changes
    let originalDocument;
    const documentMatches = ref(true);
    function checkOriginal() {
      documentMatches.value = isEqual(document.value, originalDocument);
    }

    // Document load
    const setDocument = (data, originalData) => {
      document.value = { ...data };
      originalDocument = { ...originalData };
      checkOriginal();
    };

    const loadDocument = async (use_store = true) => {
      let loadedDocument;

      // Grab data from windowStore
      let window;
      if (use_store) {
        const windowStore = useWindowStore();
        window = windowStore.getWindow(route.path);
        if (window) {
          loadedDocument = window.data;
        }
      }

      // Set new document
      if (route.params.returnId === "new") {
        if (!loadedDocument) loadedDocument = { ...blankDocument };
        setDocument(loadedDocument, blankDocument);
        return;
      }

      // Load from database
      loading.value = true;
      await ApiService.get("return", String(route.params.returnId))
        .then((response) => {
          // Prepare for dropdowns
          response.data.return_id = String(response.data.return_id);
          response.data.return_type = String(response.data.return_type);
          response.data.internal = String(response.data.internal);
          response.data.products = [];
          if (!loadedDocument) loadedDocument = response.data;

          // Set document
          setDocument(loadedDocument, response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          push.error("Neizdevās ielādēt dokumentu");
        })
        .finally(() => {
          loading.value = false;
        });
    };

    // Watch for changes in id
    const idWatcher = watch(
      () => route.params.returnId,
      (newVal) => {
        if (newVal) loadDocument();
      },
      { deep: true }
    );
    watcherHandles.push(idWatcher);

    // Handle product search
    const productService = new ProductService(
      document,
      stateRefs,
      formRef,
      route,
      router,
      true
    );
    const searchProduct = (type, idx) =>
      productService.searchProduct(
        type,
        idx,
        document.value.return_type !== "1"
      );

    const selectMatch = (product, match) =>
      productService.selectMatch(product, match);

    const changeMatch = (product, increase = true) =>
      productService.changeMatch(product, increase);

    onBeforeUnmount(() => {
      watcherHandles.forEach((stop) => stop());
    });

    return {
      loading,
      types,
      document,
      blankProduct,
      ...stateRefs,
      debouncedSearch: null as any,
      rules,
      loadDocument,
      selectMatch,
      searchProduct,
      changeMatch,
      documentMatches,
      formRef,
      matchedProducts,
    };
  },
  async mounted() {
    // Fetch dropdowns
    this.loading = true;
    await Promise.all([this.loadData("return/types", "types")]).finally(() => {
      this.loading = false;
    });

    // Load document
    await this.loadDocument();
  },
  methods: {
    debounceSearch(type, idx) {
      if (!this.debouncedSearch) {
        this.debouncedSearch = debounce(this.searchProduct, 700);
      }
      this.debouncedSearch(type, idx);
    },
    async loadData(resource: string, attr: string) {
      return ApiService.get(resource)
        .then((response) => {
          this[attr] = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from ${resource}:`, error);
          push.error(`Neizdevās ielādēt ${resource}`);
        });
    },
    newRow(field = "id") {
      this.document.products.push({ ...this.blankProduct });
      this.moveCursortoField(this.document.products.length - 1, field);
    },
    moveCursortoField(idx, field = "id") {
      this.$nextTick(() => {
        const refElement = this.$refs[`product${field}_${idx}`] as any;
        if (refElement && refElement[0]) {
          const inputElement = refElement[0].$el.querySelector("input");
          if (inputElement) (inputElement as HTMLElement).focus();
        }
      });
    },
    nextRow(idx, field = "id") {
      if (idx === this.document.products.length - 1) this.newRow(field);
      else this.moveCursortoField(idx + 1, field);
    },
    deleteRow(idx) {
      this.document.products.splice(idx, 1);
    },
    viewProduct(idx) {
      const productStore = useProductStore();
      const data = this.document.products[idx].data;
      if (data) productStore.setProduct([data]);
    },
    destroyWindow() {
      const windowStore = useWindowStore();
      windowStore.closeWindow(this.$route.path);
    },
    closeDocument() {
      this.destroyWindow();
      this.$router.go(-1);
    },
    codeEnter(idx) {
      const product = this.document.products[idx];
      const matches = product.matches;

      // Select match
      if (Object.keys(matches).length > 0)
        this.selectMatch(
          this.document.products[idx],
          matches[Number(product.selectedMatch)]
        );

      this.nextRow(idx, "code");
    },
    selectHistory(idx) {
      // Find product
      const product = this.document.products[idx];
      const history = product.history.find(
        (item) => String(item.orderid) === String(product.orderid)
      );

      // Set price and max quantity
      if (history) {
        product.maxQuantity = history.quantity;
        product.price = Number(history.price);
      }

      // Add as matched
      this.matchedProducts[idx] = {
        productid: product.productid,
        orderid: product.orderid,
      };

      // Re-validate form
      if (this.$refs.formRef) (this.$refs.formRef as FormInstance).validate();
    },
    submit() {
      if (!this.document) {
        return;
      }

      // Drop products that match blank product
      this.document.products = this.document.products.filter(
        (product) => !isEqual(product, this.blankProduct)
      );

      (this.$refs.formRef as FormInstance).validate((valid: boolean) => {
        if (valid) {
          this.loading = true;

          ApiService.post("return/", this.document)
            .then((response) => {
              push.success("Dokuments saglabāts");
              this.destroyWindow();
              const returnId = response.data.returnId;

              if (
                this.$route.params.returnId !== "new" ||
                this.document.internal === "true"
              ) {
                this.$router.push({
                  name: "return-view",
                  params: { returnId: returnId },
                });
              } else {
                this.$router.push({
                  name: "document-edit",
                  params: { editId: "new", type: "return" },
                  query: { returnId, orderType: response.data.orderType },
                });
              }
            })
            .catch((err) => {
              Swal.fire({
                title: "Neizdevās saglabāt",
                text: err.response?.data?.message ?? "",
                icon: "error",
              });
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          push.warning("Pārbaudi ievadītos datus");
          return false;
        }
      });
    },
  },
});
</script>
