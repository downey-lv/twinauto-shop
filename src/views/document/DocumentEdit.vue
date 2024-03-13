<template>
  <DocumentHeader v-on:menu-data="headerUpdate" />
  <el-form
    v-if="$route.params.type !== 'all'"
    @submit.prevent="submit()"
    :rules="rules"
    :model="document"
    ref="formRef"
    class="form"
  >
    <div class="card mb-5">
      <div class="card-header border-0 pt-5">
        <h3 class="card-title">
          Dokuments: {{ document.orderid ?? "Jauns" }}
          <a
            href="#"
            @click.prevent="['$tours']['documentEditTour'].start()"
            id="startTour"
          >
            <span
              class="ms-2 badge badge-info badge-square"
              title="Pamācība"
              v-tooltip
              ><i class="fa-regular fa-book-open me-1 text-light ms-auto"></i>
            </span>
          </a>
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

          <div id="containerSubmit">
            <button
              v-if="document.islocked"
              class="btn btn-sm btn-warning me-3"
              type="button"
              disabled
            >
              <i class="fa-solid fa-lock"></i> Bloķēts
            </button>
            <button
              v-else
              :data-kt-indicator="loading ? 'on' : null"
              class="btn btn-sm btn-primary me-3"
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
            <i
              v-if="hasZeroPrice"
              class="fa-solid fa-triangle-exclamation text-warning"
              title="Dokumentā ir produkti bez cenas"
              v-tooltip
            ></i>
          </div>
        </div>
      </div>
      <div class="card-body" v-loading="loading">
        <div class="row">
          <div class="col-lg-8">
            <div class="row">
              <div class="col-lg">
                <div class="fv-row" id="containerType" v-if="!dailyDocument">
                  <label class="fs-6 required">Tips</label>
                  <SelectComponent
                    :options="typesFiltered"
                    v-model="document.ordertypeid"
                    prop="ordertypeid"
                  />
                </div>
                <div class="fv-row" id="containerCompany">
                  <label class="fs-6 required">Klients</label>
                  <SelectComponent
                    :options="companies"
                    v-model="document.companyid"
                    @change="updatePayterm()"
                    prop="companyid"
                  />
                </div>
                <div class="fv-row" v-if="!dailyDocument">
                  <label class="fs-6">Dokumenta numurs</label>
                  <el-form-item prop="waybillno">
                    <el-input
                      v-model="document.waybillno"
                      @keydown.enter.prevent
                    />
                  </el-form-item>
                </div>
                <div class="fv-row" v-else-if="!document.orderid">
                  <label class="fs-6 required">Darba vieta</label>
                  <el-form-item prop="paymentRecipient">
                    <el-radio-group v-model="document.paymentRecipient">
                      <el-radio-button label="V1" value="1" />
                      <el-radio-button label="V2" value="2" />
                    </el-radio-group>
                  </el-form-item>
                </div>
              </div>
              <div class="col-lg">
                <div class="fv-row">
                  <label class="fs-6 required">Datums</label>
                  <el-form-item prop="orderdate">
                    <el-date-picker
                      type="date"
                      v-model="document.orderdate"
                      @change="updatePayterm()"
                      @keydown.enter.prevent
                      class="w-100"
                    />
                  </el-form-item>
                </div>
                <div class="fv-row" v-if="!dailyDocument">
                  <label class="fs-6 required">Apmaksas termiņš</label>
                  <el-form-item prop="payterm">
                    <el-date-picker
                      type="date"
                      v-model="document.payterm"
                      @keydown.enter.prevent
                      class="w-100"
                    />
                  </el-form-item>
                </div>
                <div class="fv-row" v-else-if="!document.orderid">
                  <label class="fs-6 required">Apmaksas veids</label>
                  <el-form-item prop="paymentType">
                    <el-radio-group v-model="document.paymentType">
                      <el-radio-button label="Kase" value="2" />
                      <el-radio-button label="Karte" value="3" />
                      <el-radio-button label="Skaidra" value="1" />
                    </el-radio-group>
                  </el-form-item>
                </div>
                <div
                  class="fv-row"
                  v-if="
                    $route.params.type === 'in' &&
                    $route.params.editId === 'new'
                  "
                >
                  <label class="fs-6">Piegādes izdevumi, bez PVN</label>
                  <el-form-item>
                    <el-input-number
                      v-model="document.deliveryCost"
                      :controls="false"
                      :precision="4"
                      @keydown.enter.prevent
                      class="w-100"
                    />
                    <div class="fs-7 fw-semibold text-muted">
                      Pēc saglabāšanas pārbaudi kopsummu
                    </div>
                  </el-form-item>
                </div>
              </div>
              <div class="col-lg">
                <div class="fv-row">
                  <label class="fs-6">Komentārs</label>
                  <el-form-item>
                    <el-input
                      v-model="document.comment"
                      type="textarea"
                      :autosize="{ minRows: 2 }"
                    />
                  </el-form-item>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg">
            <div class="card-body">
              <div class="d-flex">
                <div class="p-2 flex-grow-1">Summa bez PVN</div>
                <div class="p-2">{{ totalPrice.toFixed(2) }} €</div>
              </div>
              <div class="d-flex">
                <div class="p-2 flex-grow-1">PVN, {{ document.vat }}%</div>
                <div class="p-2">{{ totalVAT.toFixed(2) }} €</div>
              </div>
              <div class="d-flex fw-bold">
                <div class="p-2 flex-grow-1">Summa ar PVN</div>
                <div class="p-2">{{ totalPriceVAT.toFixed(2) }} €</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      id="containerItems"
      class="card mb-5"
      v-loading="loading"
      v-if="document.ordertypeid !== ''"
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

            <div class="col-2" id="headingCode">Kods</div>
            <div class="col-1">Ražotājs</div>
            <div class="col-2">Nosaukums</div>
            <div class="col-1">Daudzums</div>
            <div class="col-1" id="headingPrice">Cena bez PVN</div>
            <div class="col-1" id="headingPriceVAT">Cena ar PVN</div>
            <div class="col-1">Summa</div>
            <div class="col-1" id="headingComment">Komentārs</div>
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
                  :disabled="!!item.productid && parseInt(item.productid) !== 1"
                  :ref="'productcode_' + idx"
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
                <div
                  class="fs-7 fw-semibold text-muted"
                  v-if="item.imported?.code"
                >
                  {{ item.imported.code }}
                </div>
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
                >
                </el-input-number>
              </el-form-item>
            </div>

            <div class="col-lg-1 pb-1">
              <el-form-item :prop="`products[${idx}].priceVAT`">
                <el-tooltip
                  :content="item.data?.priceDetails || ``"
                  raw-content
                  placement="left"
                >
                  <el-input-number
                    v-model="item.priceVAT"
                    size="large"
                    :controls="false"
                    :precision="2"
                    placeholder="Cena"
                    @keydown.enter.prevent="nextRow(idx)"
                  />
                </el-tooltip>
                <i
                  v-if="
                    $route.params.type !== `in` &&
                    item.priceVAT < item.data?.priceBuy
                  "
                  class="fa-solid fa-triangle-exclamation ms-3 text-danger"
                  title="Cena zem iepirkuma"
                  v-tooltip
                ></i>
              </el-form-item>
            </div>

            <div class="col-lg-1 pb-1">
              <el-form-item :prop="`products[${idx}].total`">
                <el-input-number
                  v-model="item.total"
                  size="large"
                  :controls="false"
                  :precision="2"
                  placeholder="Summa"
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
                  <template v-for="(match, m_idx) in item.matches" :key="m_idx">
                    <div class="row">
                      <div class="col d-flex flex-row">
                        <div style="width: 20px" class="text-dark">
                          <span v-if="m_idx === item.selectedMatch">►</span>
                        </div>
                        <a href="#" @click.prevent="selectMatch(item, match)">{{
                          match.productid === ""
                            ? $route.params.type === "in"
                              ? " + Izveidot"
                              : "Neiepirkta prece"
                            : match.productid
                        }}</a>
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
  </el-form>
  <v-tour
    name="documentEditTour"
    :steps="tourSteps as any[]"
    :options="tourOptions"
  ></v-tour>
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
import { useDocumentImportStore } from "@/stores/documentImport";
import { Decimal } from "decimal.js";
import { debounce, isEqual } from "lodash";
import Swal from "sweetalert2/dist/sweetalert2.js";
import Notice from "@/components/core/Notice.vue";
import SelectComponent from "@/components/core/form/SelectComponent.vue";
import DocumentHeader from "@/components/documents/DocumentHeader.vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import tourSteps from "@/tours/DocumentEditTour";
import tourOptions from "@/tours/TourOptions";
import { useProductStore } from "@/stores/product";
import { useWindowStore } from "@/stores/activewindows";
import type {
  Company,
  Type,
  Imported,
  DocumentProduct,
  Header,
  Document,
} from "@/types/Document";
import type { FormInstance, FormRules } from "element-plus";
import {
  calculateTotalPrice,
  calculateTotalPriceVAT,
  calculateTotalVAT,
  calculatePriceVAT,
  calculateTotal,
} from "@/components/documents/calculations";
import { ProductService } from "@/components/documents/ProductService";
import {
  productValidator,
  validateCode,
  validateID,
} from "@/components/documents/validators";
import "@/assets/hover-icon.css";
import type { Product } from "@/types/Product";
import { DateTime } from "luxon";
import { getOption } from "@/core/services/OptionService";

export default defineComponent({
  components: {
    DocumentHeader,
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
    const companies = ref<Company[]>([]);
    const types = ref<Type[]>([]);

    // Initialize product and document
    const blankProduct: DocumentProduct = {
      valid: false,
      productid: "",
      productcode: "",
      producer: "",
      productname: "",
      quantity: 1,
      price: 0,
      priceVAT: 0,
      total: 0,
      matches: [] as Product[],
      comment: "",
    };

    const blankDocument: Document = {
      companyid: "",
      orderdate: DateTime.now().toJSDate(),
      payterm: null,
      ordertypeid: "",
      waybillno: "",
      comment: "",
      vat: 21,
      islocked: false,
      products: [],
      deletedItems: [],
      paymentRecipient: "",
      paymentType: "",
    };

    // Overwrite values from query
    if (route.query.orderType)
      blankDocument.ordertypeid = String(route.query.orderType);

    if (route.query.returnId) {
      blankDocument.returnid = String(route.query.returnId);
      blankDocument.payterm = DateTime.now().toJSDate();
    }

    if (route.params.type == "daily") {
      blankDocument.companyid = "6570";
      blankDocument.payterm = blankDocument.orderdate;

      const default_recipient = getOption("default_payment_recipient");
      if (default_recipient == "1" || default_recipient == "2")
        blankDocument.paymentRecipient = default_recipient;
    } else if (route.query.clientId)
      blankDocument.companyid = String(route.query.clientId);

    const document = ref({ ...blankDocument });

    // Daily document
    const dailyDocument = ref(false);
    function setDailyDocument() {
      dailyDocument.value = route.params.type === "daily";
    }

    // Custom validators
    const validateWaybillno = async (rule, value, callback) => {
      // Validate incoming documents
      if (document.value.ordertypeid === "1") {
        if (value === "") {
          return callback(new Error("Obligāts iepirkumam"));
        } else if (document.value.companyid !== "") {
          await ApiService.get("document", "validate/", {
            companyid: document.value.companyid,
            waybillno: value,
            orderid: document.value.orderid,
          })
            .then((response) => {
              if (response.data.exists)
                return callback(new Error("Dokuments jau eksistē"));
            })
            .catch(() => {
              callback(new Error("Neizdevās pārbaudīt dokumentu"));
            });
        }
      }
      return callback();
    };

    const validateComment = (rule, value, callback, product) => {
      const productid = product.productid;

      if (value === "" && parseInt(productid) === 1) {
        callback(new Error("Jānorāda komentārs"));
      } else {
        callback();
      }
    };

    // Define form rules
    const documentRules = {
      ordertypeid: [
        {
          required: true,
          message: "",
          trigger: "change",
        },
      ],
      companyid: [
        {
          validator: (rule, value, callback) => {
            if (value === "") {
              callback(new Error(""));
            } else {
              callback();
            }
            // Re-validate waybillno
            if (formRef.value && "waybillno" in rules.value)
              formRef.value.validateField("waybillno", () => null);
          },
          trigger: "change",
        },
      ],
      orderdate: [
        {
          required: true,
          message: "",
          trigger: "change",
        },
      ],
      products: [] as any[],
    };

    const invoiceRules = {
      payterm: [
        {
          required: true,
          message: "",
          trigger: "change",
        },
      ],
      waybillno: [
        {
          validator: productValidator(validateWaybillno, null),
          trigger: "change",
        },
      ],
    };

    const dailyRules = {
      paymentRecipient: [
        {
          required: true,
          message: "Jāizvēlas darba vieta",
          trigger: "change",
        },
      ],
      paymentType: [
        {
          required: true,
          message: "Jāizvēlas apmaksas veids",
          trigger: "change",
        },
      ],
    };

    // Set rules
    const rules = ref<FormRules>(documentRules);
    function setRules() {
      if (route.params.type === "daily") {
        // Delete invoiceRules
        for (const key in invoiceRules) delete rules.value[key];

        // Add dailyRules
        for (const key in dailyRules) rules.value[key] = dailyRules[key];
      } else {
        // Delete dailyRules
        for (const key in dailyRules) delete rules.value[key];

        // Add invoiceRules
        for (const key in invoiceRules) rules.value[key] = invoiceRules[key];
      }
      console.log(rules.value);
    }

    const addProductRules = (idx) => {
      const product = document.value.products[idx];

      if (!rules.value.products) return;

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
            required: true,
            message: "",
            trigger: "change",
          },
        ],
        comment: [
          {
            validator: productValidator(validateComment, product),
            trigger: "change",
          },
        ],
      };
    };

    // Computed if any prices are 0
    const hasZeroPrice = computed(() =>
      document.value.products.some((product) => product.price === 0)
    );

    // Define price calculators
    const vatDecimal = computed(() =>
      new Decimal(document.value.vat).dividedBy(100).plus(1)
    );
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

    // Calculate document totals
    const totalPrice = computed(() =>
      calculateTotalPrice(document.value.products, document.value.deliveryCost)
    );
    const totalPriceVAT = computed(() =>
      calculateTotalPriceVAT(totalPrice.value, vatDecimal.value)
    );
    const totalVAT = computed(() =>
      calculateTotalVAT(totalPriceVAT.value, totalPrice.value)
    );

    // Delete buttons
    const state = reactive({
      loadingProduct: document.value.products.map(() => false),
    });
    const stateRefs = toRefs(state);

    // Filter types by grouping
    const typesFiltered = computed(() => {
      return Object.values(types.value).filter(
        (type) => type.grouping === route.params.type
      );
    });

    const preSelectType = () => {
      const types = typesFiltered.value;

      // Don't do anything if no types
      if (!types || types.length === 0) return;

      // Don't change if valid
      if (types.find((type) => type.id === document.value.ordertypeid)) return;

      // Set default ordertype or clear
      if (types.length === 1) {
        document.value.ordertypeid = String(types[0].id);
      } else {
        document.value.ordertypeid = "";
      }
    };

    // Watch order types
    const oWatcher = watch(
      typesFiltered,
      () => {
        setRules();
        setDailyDocument();
        preSelectType();
      },
      { immediate: true }
    );
    watcherHandles.push(oWatcher);

    // Store window
    let importStoreChecked = false;
    const menuData = ref<Header[]>([]);
    const windowStore = useWindowStore();
    const wWatcher = watch(
      document,
      (newValue) => {
        if (!importStoreChecked) return;

        // Get section header
        const headerData = menuData.value.find(
          (item) => item.type === route.params.type
        );
        if (!headerData) return;

        let documentTitle = "Jauns";
        if (newValue.orderid) {
          documentTitle = `${newValue.companyname}`;
        }

        windowStore.addWindow(
          route.path,
          `${headerData.title}: ${documentTitle}`,
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
    const loadDocument = async (use_store = true) => {
      importStoreChecked = false;

      // Prepare products
      let products = [{ ...blankProduct }] as any[];

      // Process import
      if (route.query.import) {
        const importStore = useDocumentImportStore();

        if (importStore.data) {
          const data: Imported = importStore.data;
          document.value.ordertypeid = "1";
          document.value.companyid = String(data.company) ?? "";
          document.value.waybillno = data.bill ?? "";
          document.value.orderdate = DateTime.fromISO(data.date).toJSDate();
          document.value.payterm = DateTime.fromISO(data.term).toJSDate();
          document.value.comment = data.comment ?? "";
          updatePayterm(data.term);

          products = [];
          for (const item of data.items) {
            let product = { ...blankProduct };
            product.productcode = item.code;
            product.productname = item.name;
            product.quantity = item.quantity;
            product.price = new Decimal(item.price)
              .toDecimalPlaces(4)
              .toNumber();
            product.imported = item;

            addMatch(product, item.matches);

            products.push(product);
          }
        }

        document.value.products = products;
        originalDocument = { ...document.value };
        checkOriginal();
      } else {
        // Load from database or store
        await fetchDocument(use_store);
      }

      importStoreChecked = true;
    };

    const setDocument = (data, originalData) => {
      document.value = { ...data };
      originalDocument = { ...originalData };
      checkOriginal();
      preSelectType();

      // Re-run searchProduct
      document.value.products.forEach((product, index) => {
        if (product.productid === "") {
          searchProduct("code", index);
        }
      });
    };

    const fetchDocument = async (use_store = true) => {
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
      if (route.params.editId === "new") {
        if (!loadedDocument) loadedDocument = { ...blankDocument };
        setDocument(loadedDocument, blankDocument);
        return;
      }

      // Load from database
      loading.value = true;
      await ApiService.get("document", String(route.params.editId))
        .then((response) => {
          // Prepare for dropdowns
          response.data.ordertypeid = String(response.data.ordertypeid);
          response.data.companyid = String(response.data.companyid);

          // Format date
          response.data.orderdate = DateTime.fromISO(
            response.data.orderdate
          ).toJSDate();
          response.data.payterm = DateTime.fromISO(
            response.data.payterm
          ).toJSDate();

          // Format products
          response.data.products.forEach((product) => {
            // Set all products as valid
            product.valid = true;

            // Replace with formatted id
            product.productid = product.productidstr;

            // Format numbers
            product.price = parseFloat(product.price);
            product.quantity = parseFloat(product.quantity);
          });

          // Add deleted items placeholder
          response.data.deletedItems = [];

          if (!loadedDocument) loadedDocument = response.data;

          // Set document
          setDocument(loadedDocument, response.data);

          // Trigger warning if document is locked
          if (response.data.islocked) {
            Swal.fire({
              text: "Dokuments ir bloķēts",
              icon: "warning",
            });
          }
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
    const iWatcher = watch(
      () => route.params.editId,
      (newVal) => {
        if (newVal) loadDocument();
      },
      { deep: true }
    );
    watcherHandles.push(iWatcher);

    // Update payterm
    const updatePayterm = (termValue = null as any) => {
      if (termValue) return;
      if (!document.value.orderdate) return;
      if (dailyDocument.value) return;

      const company = companies.value.find(
        (company) => company.id === document.value.companyid
      );

      let days = parseInt(company?.default_payterm ?? "14");
      if (!days || days === 0) return;

      document.value.payterm = DateTime.fromJSDate(document.value.orderdate)
        .plus({ days: days })
        .toJSDate();
    };

    // Handle product search
    const productService = new ProductService(
      document,
      stateRefs,
      formRef,
      route,
      router
    );
    const searchProduct = (type, idx) =>
      productService.searchProduct(type, idx);
    const addMatch = (product, matches) =>
      productService.addMatch(product, matches);
    const selectMatch = (product, match) =>
      productService.selectMatch(product, match);

    const changeMatch = (product, increase = true) =>
      productService.changeMatch(product, increase);

    onBeforeRouteLeave(() => {
      watcherHandles.forEach((stop) => stop());
    });

    onBeforeUnmount(() => {
      watcherHandles.forEach((stop) => stop());
    });

    return {
      loading,
      companies,
      typesFiltered,
      types,
      document,
      blankProduct,
      totalPrice,
      totalPriceVAT,
      totalVAT,
      ...stateRefs,
      debouncedSearch: null as any,
      rules,
      tourSteps,
      tourOptions,
      menuData,
      loadDocument,
      updatePayterm,
      selectMatch,
      addMatch,
      changeMatch,
      searchProduct,
      fetchDocument,
      documentMatches,
      formRef,
      hasZeroPrice,
      dailyDocument,
    };
  },
  async mounted() {
    // Fetch dropdowns
    this.loading = true;
    await Promise.all([
      this.loadData("company/", "companies"),
      this.loadData("document/types", "types"),
    ]).finally(() => {
      this.loading = false;
    });

    // Load document
    const use_store = !this.$route.query.returnId;
    await this.loadDocument(use_store);
  },
  methods: {
    debounceSearch(type, idx) {
      if (!this.debouncedSearch) {
        this.debouncedSearch = debounce(
          this.searchProduct,
          Number(getOption("search_speed"))
        );
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
      const entryId = this.document.products[idx].entryid;
      if (entryId && entryId !== "") {
        this.document.deletedItems.push(entryId);
      }
      this.document.products.splice(idx, 1);
    },
    viewProduct(idx) {
      const productStore = useProductStore();
      const data = this.document.products[idx].data;
      if (data) productStore.setProduct([data]);
    },
    headerUpdate(data) {
      this.menuData = data;
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
          const data = { ...this.document } as any;

          // Format dates
          if (!data.orderdate || !data.payterm) return;
          data.orderdate = DateTime.fromJSDate(data.orderdate).toISODate();
          data.payterm = DateTime.fromJSDate(data.payterm).toISODate();

          this.loading = true;
          ApiService.post("document/", data)
            .then((response) => {
              push.success("Dokuments saglabāts");
              this.destroyWindow();

              const orderId = response.data.orderid;
              const { returnId } = response.data;
              if (returnId) {
                this.$router.push({
                  name: "return-view",
                  params: { returnId },
                });
              } else {
                this.$router.push({
                  name: "document-view",
                  params: { documentId: orderId },
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
