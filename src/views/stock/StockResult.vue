<template>
  <div class="card mb-5">
    <div class="card-body" v-loading="loading">
      <div class="row">
        <div class="col-lg">
          <div class="row">
            <div class="col-5 fw-bold">Datums</div>
            <div class="col">
              {{ String(documentData.orderdate).split("T")[0] }}
            </div>
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
      <el-table :data="documentData.products" style="width: 100%">
        <el-table-column property="productidstr" label="ID" sortable />
        <el-table-column property="productcode" label="Kods" sortable>
          <template #default="scope">
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ scope.row.productcode }}</span>
              <button
                class="btn btn-icon btn-sm btn-active-primary"
                @click="viewProduct(scope.row.productid)"
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
            <span v-html="scope.row.productname?.replace(/\n/g, '<br/>')"></span>
          </template>
        </el-table-column>
        <el-table-column
          property="quantity"
          label="Daudzums"
          sortable
          width="130"
        />
        <el-table-column
          property="priceVAT"
          label="Cena ar PVN"
          sortable
          width="150"
        >
          <template #default="scope">
            {{ scope.row.priceVAT.toFixed(2) }} €
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

  <ImageHover />
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { useRoute } from "vue-router";
import { useProductStore } from "@/stores/product";
import type { Document } from "@/types/Document";
import { DateTime } from "luxon";
import ImageHover from "@/components/product/ImageHover.vue";
import { Decimal } from "decimal.js";
import {
  calculateTotalPrice,
  calculateTotalPriceVAT,
  calculateTotalVAT,
} from "@/components/documents/calculations";

export default defineComponent({
  computed: {
    DateTime() {
      return DateTime;
    },
  },
  components: {
    ImageHover,
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

    // Document load
    const fetchDocument = async () => {
      loading.value = true;
      await ApiService.get("stocktake/result", String(route.params.stocktakeId))
        .then((response) => {
          documentData.value = response.data;

          const products = documentData.value.products;
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

    onMounted(async () => {
      await fetchDocument();
    });

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

    return {
      loading,
      documentData,
      fetchDocument,
      totalPrice,
      totalPriceVAT,
      totalVAT,
    };
  },
  async mounted() {
    // Load document
    await this.fetchDocument();
  },
  methods: {
    viewProduct(product_id) {
      ApiService.get(`/product/find/id/${product_id}`).then((response) => {
        const data = response.data[0];
        const productStore = useProductStore();
        if (data) productStore.setProduct([data]);
      });
    },
  },
});
</script>
