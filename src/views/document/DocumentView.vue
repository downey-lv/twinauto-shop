<template>
  <div class="card mb-5">
    <div class="card-header border-0 pt-5">
      <h3 class="card-title">Dokuments: {{ $route.params.documentId }}</h3>
      <div class="card-toolbar">
        <a
          v-if="documentData.links?.repair"
          :href="`https://vide.twinauto.lv/service/repair/info/${documentData.links.repair}`"
          target="_blank"
          class="btn btn-sm btn-light me-2"
        >
          <i class="fa-solid fa-car-wrench"></i> Atvērt remontu
        </a>
        <button
          v-if="hasRepackage"
          class="btn btn-sm btn-primary me-2"
          @click="repackageDocument()"
        >
          <i class="fa-solid fa-box-open"></i> Izkomplektēt
        </button>
        <template v-else>
          <div class="btn-group me-2" role="group">
            <a
              v-if="documentData.links?.invoice"
              :href="`https://vide.twinauto.lv/shop/invoice/${documentData.links.invoice}`"
              target="_blank"
              class="btn btn-sm btn-light"
            >
              Pavadzīme
            </a>
            <a
              v-if="documentData.links?.prepaid"
              :href="`https://vide.twinauto.lv/shop/documents/?document_id=${$route.params.documentId}`"
              target="_blank"
              class="btn btn-sm btn-light"
            >
              Priekšapmaksas rēķins
            </a>
            <a
              v-if="
                !documentData.links?.invoice &&
                [2, 3, 7, 8, 9, 10, 11].includes(
                  Number(documentData.ordertypeid)
                )
              "
              class="btn btn-sm btn-light dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              <i class="fa-solid fa-file-invoice"></i> Jauns
            </a>
            <ul class="dropdown-menu">
              <li>
                <a
                  v-if="!documentData.links?.invoice"
                  class="dropdown-item"
                  :href="`https://vide.twinauto.lv/shop/invoice/new_${$route.params.documentId}`"
                  target="_blank"
                  >{{
                    documentData.ordertypeid === "8"
                      ? "Kredītrēķins"
                      : "Pavadzīme"
                  }}</a
                >
              </li>
              <li>
                <a
                  v-if="
                    !documentData.links?.invoice &&
                    !documentData.links?.prepaid &&
                    documentData.ordertypeid !== '8'
                  "
                  class="dropdown-item"
                  :href="`https://vide.twinauto.lv/shop/documents/?document_id=${$route.params.documentId}`"
                  target="_blank"
                  >Rēķins</a
                >
              </li>
            </ul>
          </div>
        </template>

        <div class="btn-group me-2" role="group">
          <button
            type="button"
            title="Izmaiņas"
            v-tooltip
            class="btn btn-sm btn-light"
            @click="showLog()"
          >
            <i class="fa-solid fa-book"></i>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-info"
            title="Maksājumi"
            v-tooltip
            @click="showPayments()"
          >
            <i class="fa-solid fa-cash-register"></i>
          </button>
          <button
            v-if="documentData.islocked"
            type="button"
            class="btn btn-sm btn-warning"
            title="Atslēgt dokumentu"
            v-tooltip
            @click="lockDocument(documentData.islocked)"
          >
            <i class="fa-solid fa-fw fa-lock"></i>
          </button>
          <button
            v-else
            type="button"
            class="btn btn-sm btn-light"
            title="Slēgt dokumentu"
            v-tooltip
            @click="lockDocument(documentData.islocked)"
          >
            <i class="fa-solid fa-fw fa-lock-open"></i>
          </button>
        </div>
        <div class="btn-group me-2" role="group">
          <button
            type="button"
            title="Nosūtīt uz telefonu"
            v-tooltip
            class="btn btn-sm btn-light"
            @click="toPhone($event)"
          >
            <i class="fa-solid fa-mobile-signal-out"></i>
          </button>
          <div class="btn-group">
            <button
              type="button"
              class="btn btn-sm btn-light dropdown-toggle"
              title="Drukāt dokumentu"
              v-tooltip
              data-bs-toggle="dropdown"
            >
              <i class="fa-solid fa-fw fa-print"></i>
            </button>
            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item cursor-pointer" @click="printDocument"
                  >Pavaddokuments</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item cursor-pointer"
                  @click="printPackingList"
                  >Iepakošanas saraksts</a
                >
              </li>
            </ul>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-light"
            title="Drukāt uzlīmes"
            v-tooltip
            @click="printLabels"
          >
            <i class="fa-solid fa-fw fa-note-sticky"></i>
          </button>
        </div>

        <router-link
          v-if="documentData.grouping && !documentData.islocked"
          class="btn btn-sm btn-info me-2"
          type="button"
          :to="{
            name: `document-edit`,
            params: {
              editId: $route.params.documentId,
              type: documentData.grouping,
            },
          }"
        >
          <i class="fa-solid fa-pencil"></i> Labot
        </router-link>

        <!--  Show back if in return view-->
        <router-link
          v-if="$route.params.returnId"
          :to="{
            name: 'return-view',
            params: { returnId: $route.params.returnId },
          }"
          class="btn btn-sm btn-light me-3"
        >
          Atpakaļ
        </router-link>
        <!-- Show close if breadcrumb exists-->
        <router-link
          v-else-if="lastBreadcrumb"
          :to="{ name: lastBreadcrumb.name }"
          class="btn btn-sm btn-light me-2"
        >
          Aizvērt
        </router-link>
        <button
          v-else-if="$route.query.enableBack"
          @click="$router.back()"
          class="btn btn-sm btn-light me-3"
        >
          Aizvērt
        </button>
      </div>
    </div>
    <div class="card-body" v-loading="loading">
      <div class="row">
        <div class="col-lg">
          <div class="row">
            <div class="col-5 fw-bold">Tips</div>
            <div class="col">{{ documentData.ordertypename }}</div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">Klients</div>
            <div class="col">
              {{ documentData.companyname }}
              <router-link
                class="ms-2"
                v-if="documentData.companyid"
                :to="{
                  name: 'client-view',
                  params: { clientId: documentData.companyid },
                }"
                title="Atvērt klientu"
                v-tooltip
              >
                <i class="fa-solid fa-eye"></i>
              </router-link>
              <span class="ms-2">
                <ClientStatusTag
                  v-if="client_status"
                  :blocked-reasons="client_status.blocked_reasons"
                  :credit-left="client_status.credit_left"
                  :blocked="client_status.blocked"
                  :document-type="$route.params.type"
                />
              </span>
            </div>
          </div>

          <div class="row">
            <div class="col-5 fw-bold">Dokumenta numurs</div>
            <div class="col">{{ documentData.waybillno }}</div>
          </div>
        </div>
        <div class="col-lg">
          <div class="row">
            <div class="col-5 fw-bold">Datums</div>
            <div class="col">
              {{ String(documentData.orderdate).split("T")[0] }}
            </div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">Apmaksas termiņš</div>
            <div class="col">
              {{ String(documentData.payterm).split("T")[0] }}
            </div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">Apmaksāts</div>
            <div class="col">
              <span
                class="badge"
                :class="{
                  'badge-success': documentData.is_paid,
                  'badge-danger': !documentData.is_paid,
                }"
              >
                {{ documentData.is_paid ? "Jā" : "Nē" }}
              </span>
              <span
                class="ms-2"
                v-if="documentData.is_paid && documentData.paid_date"
                >{{ String(documentData.paid_date).split("T")[0] }}</span
              >
            </div>
          </div>
        </div>
        <div class="col-lg">
          <div class="row">
            <div class="col-5 fw-bold">Komentārs</div>
            <div class="col">{{ documentData.comment }}</div>
          </div>
        </div>
        <div class="col-lg">
          <div class="row">
            <div class="col-5 fw-bold">Summa bez PVN</div>
            <div class="col">{{ totalPrice.toNumber().toFixed(2) }} €</div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">PVN, {{ documentData.vat }}%</div>
            <div class="col">{{ totalVAT.toNumber().toFixed(2) }} €</div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">Summa ar PVN</div>
            <div class="col">{{ totalPriceVAT }} €</div>
          </div>
          <template v-if="(documentData.balance_due ?? 0) > 0">
            <div class="separator my-2"></div>
            <div class="row">
              <div class="col-5 fw-bold">Apmaksai</div>
              <div class="col">{{ documentData.balance_due }} €</div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <div
    id="containerItems"
    class="card mb-5"
    v-loading="loading"
    v-if="documentData.ordertypeid !== ''"
  >
    <div class="card-body">
      <el-table
        :data="documentData.products"
        style="width: 100%"
        :default-sort="{ prop: 'entryid', order: 'ascending' }"
      >
        <el-table-column type="index" :index="indexMethod" />
        <el-table-column property="productidstr" label="ID" sortable />
        <el-table-column property="productcode" label="Kods" sortable>
          <template #default="scope">
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ scope.row.productcode }}</span>
              <button
                class="btn btn-icon btn-sm btn-active-primary"
                @click="viewProduct(scope.row.index)"
                :onmouseover="`showImage('${scope.row.data?.images?.[0]}')`"
                onmouseleave="showImage()"
              >
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </template>
        </el-table-column>
        <el-table-column property="producer" label="Ražotājs" sortable />
        <el-table-column
          property="productname"
          label="Nosaukums"
          width="350"
          sortable
        >
          <template #default="scope">
            <span v-html="scope.row.productname.replace(/\n/g, '<br/>')"></span>
          </template>
        </el-table-column>
        <el-table-column
          property="quantity"
          label="Daudzums"
          sortable
          width="130"
        >
          <template #default="scope">
            {{ scope.row.quantity }}
            <i
              v-if="
                $route.params.type == `in` && scope.row.data?.shop?.repackage_to
              "
              class="fa-duotone fa-solid fa-fw fa-box-open text-info"
              title="Jāizkomplektē"
              v-tooltip
            ></i>
            <template
              v-if="
                $route.params.type !== `in` && scope.row.preorderStatus !== null
              "
            >
              <i
                v-if="scope.row.preorderStatus"
                class="fa-duotone fa-solid fa-fw fa-circle-check text-success"
                title="Piegādāts"
                v-tooltip
              ></i>
              <i
                v-else
                class="fa-duotone fa-solid fa-fw fa-hourglass-start text-warning"
                title="Pasūtīts"
                v-tooltip
              ></i>
            </template>
          </template>
        </el-table-column>
        <el-table-column
          property="priceVAT"
          label="Cena ar PVN"
          sortable
          width="150"
        >
          <template #default="scope">
            <el-tooltip
              :content="scope.row.data?.priceDetails"
              placement="left"
              raw-content
            >
              {{ scope.row.priceVAT.toFixed(2) }} €
            </el-tooltip>
            <el-tooltip
              v-if="
                !$route.params.returnId &&
                $route.params.type !== `in` &&
                scope.row.priceVAT < (scope.row.data?.priceOnline?.[1] ?? 0)
              "
              :content="
                scope.row.priceVAT < (scope.row.documentBuyPrice ?? 0)
                  ? `Zem iepirkuma`
                  : `Zem interneta`
              "
            >
              <i
                class="fa-solid fa-triangle-exclamation ms-3"
                :class="
                  scope.row.priceVAT < (scope.row.documentBuyPrice ?? 0)
                    ? 'text-danger'
                    : 'text-warning'
                "
              ></i>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column property="total" label="Summa" sortable width="100">
          <template #default="scope">
            {{ scope.row.total.toFixed(2) }} €
          </template>
        </el-table-column>
        <el-table-column property="comment" label="Komentārs" sortable />
      </el-table>
    </div>
  </div>

  <DocumentLabelsModal ref="modalLabels" :pData="documentData.products" :supplier-id="documentData.companyid" />
  <DocumentRepackageModal
    ref="modalRepackage"
    :pData="documentData.products"
    :document-id="$route.params.documentId"
    @refresh="fetchDocument()"
  />
  <PaymentModal
    ref="modalPayment"
    :pData="documentData"
    @refresh="fetchDocument()"
  />
  <ImageHover />
  <LogModal
    ref="modalLog"
    logType="orders"
    :logID="String($route.params.documentId)"
  />
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  watch,
  onBeforeUnmount,
  nextTick,
} from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Decimal } from "decimal.js";
import { useRoute } from "vue-router";
import { useProductStore } from "@/stores/product";
import type { Document } from "@/types/Document";
import DocumentLabelsModal from "@/components/documents/DocumentLabels.vue";
import {
  calculateTotalPrice,
  calculateTotalPriceVAT,
  calculateTotalVAT,
} from "@/components/documents/calculations";
import { useBreadcrumbStore } from "@/stores/breadcrumb";
import { removeTooltip } from "@/core/helpers/dom";
import { DateTime } from "luxon";
import PaymentModal from "@/components/documents/PaymentModal.vue";
import { useAuthStore } from "@/stores/auth";
import ImageHover from "@/components/product/ImageHover.vue";
import { Tooltip } from "bootstrap";
import LogModal from "@/components/data/LogModal.vue";
import { useViewHistoryStore } from "@/stores/viewHistory";
import ClientStatusTag from "@/components/clients/ClientStatusTag.vue";
import type { ClientStatus } from "@/types/Client";
import DocumentRepackageModal from "@/components/documents/DocumentRepackage.vue";

const breadcrumbStore = useBreadcrumbStore();

export default defineComponent({
  computed: {
    DateTime() {
      return DateTime;
    },
  },
  components: {
    DocumentRepackageModal,
    ClientStatusTag,
    LogModal,
    ImageHover,
    PaymentModal,
    DocumentLabelsModal,
  },
  setup() {
    const loading = ref<boolean>(false);
    const route = useRoute();

    const blankDocument: Document = {
      companyid: "",
      companyname: "",
      orderdate: null,
      payterm: null,
      ordertypeid: "",
      ordertypename: "",
      waybillno: "",
      comment: "",
      vat: 21,
      islocked: false,
      products: [],
      deletedItems: [],
    };
    const documentData = ref({ ...blankDocument });

    const client_status = ref<null | ClientStatus>(null);

    // Define price calculators
    const vatDecimal = computed(() =>
      new Decimal(documentData.value.vat).dividedBy(100).plus(1)
    );
    const useProductWatcher = (product) => {
      product.priceVAT = computed({
        get: () => {
          return new Decimal(product.price ?? 0)
            .times(vatDecimal.value)
            .toDecimalPlaces(2)
            .toNumber();
        },
        set: (newValue) => {
          product.price = new Decimal(newValue)
            .dividedBy(vatDecimal.value)
            .toDecimalPlaces(4)
            .toNumber();
        },
      });

      product.total = computed({
        get: () => {
          return new Decimal(product.price ?? 0)
            .times(vatDecimal.value)
            .times(product.quantity)
            .toDecimalPlaces(2)
            .toNumber();
        },
        set: (newValue) => {
          if (product.quantity !== 0) {
            product.price = new Decimal(newValue)
              .dividedBy(product.quantity ?? 0)
              .dividedBy(vatDecimal.value)
              .toDecimalPlaces(4)
              .toNumber();
          } else {
            product.price = 0;
          }
        },
      });
    };

    // Calculate document totals
    const totalPrice = computed(() =>
      calculateTotalPrice(documentData.value.products)
    );
    const totalPriceVAT = computed(() =>
      calculateTotalPriceVAT(totalPrice.value, vatDecimal.value)
    );
    const totalVAT = computed(() =>
      calculateTotalVAT(totalPriceVAT.value, totalPrice.value)
    );

    // Tooltips for table
    const initializeTooltips = () => {
      nextTick(() => {
        document.querySelectorAll(".tooltip-item").forEach((el) => {
          new Tooltip(el, { html: true });
        });
      });
    };

    // Document load
    const fetchDocument = async () => {
      loading.value = true;
      await ApiService.get("document", String(route.params.documentId))
        .then((response) => {
          const data = response.data;
          documentData.value = data;

          // Add document to viewHistory
          const viewHistoryStore = useViewHistoryStore();
          const comment = data.comment ? ` - ${data.comment}` : "";
          viewHistoryStore.addHistory(
            "documents",
            route.fullPath,
            `[${data.orderid}] ${data.ordertypename}`,
            `${data.companyname}${comment}`
          );

          const products = documentData.value.products;
          products?.forEach((product) => {
            useProductWatcher(product);

            // Add index
            product.index = products.indexOf(product);

            // Skip already processed 00001 products
            if (parseInt(product.productid) === 1 && product.data) {
              return;
            }

            // // Fetch product data
            // ApiService.get("product/find", `id/${product.productid}`).then(
            //   (response) => {
            //     product.data = response.data[0];
            //
            //     // Choose buy price
            //     product.documentBuyPrice = Number(
            //       product.buy_price || product.data?.priceBuy
            //     );
            //
            //     // Add to priceDetails
            //     if (
            //       product.data &&
            //       product.documentBuyPrice !== Number(product.data.priceBuy)
            //     )
            //       product.data.priceDetails =
            //         `Dokumenta iepirkums: ${product.documentBuyPrice} €<br/>` +
            //         product.data.priceDetails;
            //   }
            // );
          });

          // Load client data
          ApiService.get("company", data.companyid).then((response) => {
            client_status.value = response.data[0].status;
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          push.error("Neizdevās ielādēt dokumentu");
        })
        .finally(() => {
          initializeTooltips();
          loading.value = false;
        });
    };

    // Check if any items have repackage_to
    const hasRepackage = computed(() =>
      documentData.value.products.some(
        (product) => product.data?.shop?.repackage_to
      )
    );

    // Watch for changes in id
    const idWatcher = watch(
      () => route.params.documentId,
      (newVal) => {
        if (newVal) fetchDocument();
      }
    );

    onBeforeUnmount(() => {
      idWatcher();
    });

    // Set back button
    const lastBreadcrumb = breadcrumbStore.getLastEntry();

    return {
      loading,
      documentData,
      totalPrice,
      totalPriceVAT,
      totalVAT,
      fetchDocument,
      lastBreadcrumb,
      client_status,
      hasRepackage,
    };
  },
  async mounted() {
    // Load document
    await this.fetchDocument();
  },
  methods: {
    viewProduct(idx) {
      const productStore = useProductStore();
      const data = this.documentData?.products[idx].data;
      if (data) productStore.setProduct([data]);
    },
    printLabels() {
      (this.$refs.modalLabels as any).show();
    },
    repackageDocument() {
      (this.$refs.modalRepackage as any).show();
    },
    showPayments() {
      (this.$refs.modalPayment as any).show();
    },
    indexMethod(index: number) {
      return index + 1;
    },
    async printDocument() {
      await ApiService.pdf(
        "document/print",
        String(this.$route.params.documentId)
      );
    },
    async printPackingList() {
      await ApiService.pdf(
        "document/print/packing",
        String(this.$route.params.documentId)
      );
    },
    lockDocument(isLocked: boolean) {
      removeTooltip();

      // Check permissions
      const auth = useAuthStore();
      if (!auth.user?.permissions?.includes("unlocking")) {
        push.error("Nav atļaujas mainīt dokumenta statusu");
        return;
      }

      const id = this.$route.params.documentId;
      const action = isLocked ? "unlock" : "lock";
      ApiService.get(`document/lock/${id}`, action)
        .then(() => {
          this.documentData.islocked = !isLocked;
          push.success(
            `Dokuments ${isLocked ? "atslēgts" : "slēgts"} veiksmīgi`
          );
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          push.error(`Neizdevās ${isLocked ? "atslēgt" : "slēgt"} dokumentu`);
        });
    },
    toggleButtonState(el, isLoading) {
      if (isLoading) {
        el.innerHTML = `<i class="fa-solid fa-spinner-third fa-spin"></i>`;
      } else {
        el.innerHTML = el.getAttribute("data-original-content");
      }
    },
    toPhone(event) {
      // Format button
      const el = event.target;
      el.setAttribute("data-original-content", el.innerHTML); // Store original content
      this.toggleButtonState(el, true); // Set to loading state

      const id = this.$route.params.documentId;
      if (!id) return;
      ApiService.get(`data`, `cart/${id}?order`)
        .then(() => {
          push.info("Nosūtīts");
        })
        .catch((error) => {
          push.error("Neizdevās nosūtīt");
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          this.toggleButtonState(el, false);
        });
    },
    showLog() {
      (this.$refs.modalLog as any).show();
    },
  },
});
</script>
