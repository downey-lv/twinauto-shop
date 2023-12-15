<template>
  <div class="card mb-5">
    <div class="card-header border-0 pt-5">
      <h3 class="card-title">Dokuments: {{ $route.params.documentId }}</h3>
      <div class="card-toolbar">
        <a
          v-if="document.links?.repair"
          :href="`https://vide.twinauto.lv/service/repair/info/${document.links.repair}`"
          target="_blank"
          class="btn btn-sm btn-light me-2"
        >
          <i class="fa-solid fa-car-wrench"></i> Atvērt remontu
        </a>
        <template v-else>
          <a
            v-if="document.links?.invoice"
            :href="`https://vide.twinauto.lv/shop/invoice/${document.links.invoice}`"
            target="_blank"
            class="btn btn-sm btn-light me-2"
          >
            <i class="fa-solid fa-file-invoice"></i> Atvērt pavadzīmi
          </a>
          <a
            v-else-if="
              [2, 3, 7, 9, 10, 11].includes(Number(document.ordertypeid))
            "
            :href="`https://vide.twinauto.lv/shop/invoice/new_${$route.params.documentId}`"
            target="_blank"
            class="btn btn-sm btn-light me-2"
          >
            <i class="fa-solid fa-file-invoice"></i> Sagatavot pavadzīmi
          </a>
        </template>

        <div class="btn-group me-2" role="group">
          <button
            type="button"
            class="btn btn-sm"
            :class="document.islocked ? 'btn-warning' : 'btn-light'"
            :title="document.islocked ? 'Atslēgt dokumentu' : 'Slēgt dokumentu'"
            v-tooltip
            @click="lockDocument(document.islocked)"
          >
            <i
              class="fa-solid fa-fw"
              :class="document.islocked ? 'fa-lock' : 'fa-lock-open'"
            ></i>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-light"
            title="Drukāt dokumentu"
            v-tooltip
            @click="printDocument"
          >
            <i class="fa-solid fa-fw fa-print"></i>
          </button>
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
          v-if="document.grouping && !document.islocked"
          class="btn btn-sm btn-info me-2"
          type="button"
          :to="{
            name: `document-edit`,
            params: {
              editId: $route.params.documentId,
              type: document.grouping,
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
            <div class="col">{{ document.ordertypename }}</div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">Klients</div>
            <div class="col">{{ document.companyname }}</div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">Dokumenta numurs</div>
            <div class="col">{{ document.waybillno }}</div>
          </div>
        </div>
        <div class="col-lg">
          <div class="row">
            <div class="col-5 fw-bold">Datums</div>
            <div class="col">{{ document.orderdate.split("T")[0] }}</div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">Apmaksas termiņš</div>
            <div class="col">{{ document.payterm.split("T")[0] }}</div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">Apmaksāts</div>
            <div class="col">
              <span
                class="badge"
                :class="{
                  'badge-success': document.paid,
                  'badge-danger': !document.paid,
                }"
              >
                {{ document.paid ? "Jā" : "Nē" }}
              </span>
            </div>
          </div>
        </div>
        <div class="col-lg">
          <div class="row">
            <div class="col-5 fw-bold">Komentārs</div>
            <div class="col">{{ document.comment }}</div>
          </div>
        </div>
        <div class="col-lg">
          <div class="row">
            <div class="col-5 fw-bold">Summa bez PVN</div>
            <div class="col">{{ totalPrice.toNumber() }} €</div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">PVN, {{ document.vat }}%</div>
            <div class="col">{{ totalVAT.toNumber().toFixed(2) }} €</div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">Summa ar PVN</div>
            <div class="col">{{ totalPriceVAT }} €</div>
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
      <el-table
        :data="document.products"
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
                @click="viewProduct(scope.$index)"
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
        <el-table-column property="quantity" label="Daudzums" sortable />
        <el-table-column property="priceVAT" label="Cena ar PVN" sortable>
          <template #default="scope">
            {{ scope.row.priceVAT.toFixed(2) }} €
          </template>
        </el-table-column>
        <el-table-column property="total" label="Summa" sortable>
          <template #default="scope">
            {{ scope.row.total.toFixed(2) }} €
          </template>
        </el-table-column>
        <el-table-column property="comment" label="Komentārs" sortable />
      </el-table>
    </div>
  </div>

  <DocumentLabelsModal ref="modalComponent" :pData="document.products" />
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, onBeforeUnmount } from "vue";
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

const breadcrumbStore = useBreadcrumbStore();

export default defineComponent({
  computed: {
    DateTime() {
      return DateTime;
    },
  },
  components: { DocumentLabelsModal },
  setup() {
    const loading = ref<boolean>(false);
    const route = useRoute();

    const blankDocument: Document = {
      companyid: "",
      companyname: "",
      orderdate: "",
      payterm: "",
      ordertypeid: "",
      ordertypename: "",
      waybillno: "",
      comment: "",
      vat: 21,
      islocked: false,
      products: [],
      deletedItems: [],
    };
    const document = ref({ ...blankDocument });

    // Define price calculators
    const vatDecimal = computed(() =>
      new Decimal(document.value.vat).dividedBy(100).plus(1)
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
      calculateTotalPrice(document.value.products)
    );
    const totalPriceVAT = computed(() =>
      calculateTotalPriceVAT(totalPrice.value, vatDecimal.value)
    );
    const totalVAT = computed(() =>
      calculateTotalVAT(totalPriceVAT.value, totalPrice.value)
    );

    // Document load
    const fetchDocument = async () => {
      loading.value = true;
      await ApiService.get("document", String(route.params.documentId))
        .then((response) => {
          document.value = response.data;

          const products = document.value.products;
          products?.forEach((product) => {
            useProductWatcher(product);
          });
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
      document,
      totalPrice,
      totalPriceVAT,
      totalVAT,
      fetchDocument,
      lastBreadcrumb,
    };
  },
  async mounted() {
    // Load document
    await this.fetchDocument();
  },
  methods: {
    viewProduct(idx) {
      const productStore = useProductStore();
      const data = this.document?.products[idx].data;
      if (data) productStore.setProduct([data]);
    },
    printLabels() {
      (this.$refs.modalComponent as any).show();
    },
    indexMethod(index: number) {
      return index + 1;
    },
    async printDocument() {
      await ApiService.get(
        "document/print",
        String(this.$route.params.documentId),
        {},
        { responseType: "blob" }
      )
        .then((response) => {
          // Create PDF
          const file = new Blob([response.data], { type: "application/pdf" });
          // Create URL
          const fileURL = URL.createObjectURL(file);
          // Open URL
          window.open(fileURL);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          push.error("Neizdevās izdrukāt");
        })
        .finally(() => {});
    },
    lockDocument(isLocked: boolean) {
      removeTooltip();

      const id = this.$route.params.documentId;
      const action = isLocked ? "unlock" : "lock";
      ApiService.get(`document/lock/${id}`, action)
        .then(() => {
          this.document.islocked = !isLocked;
          push.success(
            `Dokuments ${isLocked ? "atslēgts" : "slēgts"} veiksmīgi`
          );
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          push.error(`Neizdevās ${isLocked ? "atslēgt" : "slēgt"} dokumentu`);
        });
    },
  },
});
</script>
