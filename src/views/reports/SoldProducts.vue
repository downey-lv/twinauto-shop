<template>
  <DocumentHeader />
  <DailyFilter
    v-if="documentType"
    @updateFilters="updateFilters"
    :show-recipient-filter="documentType == `daily`"
  />

  <div class="card mb-5" v-loading="loading" v-if="searchReady">
    <div class="card-body">
      <el-table
        :data="products"
        style="width: 100%"
        :default-sort="{ prop: 'entryid', order: 'descending' }"
        @row-dblclick="openDocument"
      >
        <el-table-column property="orderid" label="Dokuments" sortable />
        <el-table-column property="companyname" label="Klients" sortable />
        <el-table-column property="productidstr" label="ID" sortable />
        <el-table-column property="productcode" label="Kods" sortable>
          <template #default="scope">
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ scope.row.productcode }}</span>
              <button
                class="btn btn-icon btn-sm btn-active-primary"
                @click="viewProduct(scope.row.idx)"
                :onmouseover="`showImage('${scope.row.data.images?.[0]}')`"
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
        />

        <el-table-column property="comment" label="Komentārs" sortable />
        <el-table-column property="updatedat" label="Atjaunināts" sortable />
        <el-table-column property="entryid" label="Kārtas nr." sortable />
      </el-table>
    </div>
  </div>

  <ImageHover />
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute } from "vue-router";
import DocumentHeader from "@/components/documents/DocumentHeader.vue";
import DailyFilter from "@/components/documents/DailyFilter.vue";
import { useProductStore } from "@/stores/product";
import type { DocumentProduct } from "@/types/Document";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Tooltip } from "bootstrap";
import ImageHover from "@/components/product/ImageHover.vue";

export default defineComponent({
  components: {
    ImageHover,
    DocumentHeader,
    DailyFilter,
  },
  setup() {
    const route = useRoute();

    // Tooltips for table
    const initializeTooltips = () => {
      nextTick(() => {
        document.querySelectorAll(".tooltip-item").forEach((el) => {
          new Tooltip(el, { html: true });
        });
      });
    };

    // Input check
    const searchReady = computed(() => {
      return documentType.value && filterDate.value;
    });

    // Data load
    const loading = ref(false);
    const products = ref<DocumentProduct[]>([]);
    const loadProducts = async () => {
      if (!searchReady.value) return;

      loading.value = true;
      await ApiService.get("document", "filtered", {
        type: documentType.value,
        date: filterDate.value,
        user: filterUser.value,
        recipient: filterRecipient.value,
      })
        .then((response) => {
          let data = response.data;

          // Add index as key
          products.value = data.map((obj, index) => ({ idx: index, ...obj }));

          // Load product data
          products.value.forEach((product) => {
            ApiService.get("product/find", `id/${product.productid}`).then(
              (response) => {
                product.data = response.data[0];
              }
            );
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          push.error("Neizdevās ielādēt produktus");
        })
        .finally(() => {
          initializeTooltips();
          loading.value = false;
        });
    };

    // Set search params
    const documentType = computed(() => {
      if (route.params.type) {
        return String(route.params.type);
      }
      return null;
    });

    const filterDate = ref("");
    const filterUser = ref("");
    const filterRecipient = ref("");
    const updateFilters = (newData) => {
      const oldData = {
        date: filterDate.value,
        user: filterUser.value,
        recipient: filterRecipient.value,
      };

      filterDate.value = newData.date;
      filterUser.value = newData.user;
      filterRecipient.value = newData.recipient;

      if (
        oldData.date !== newData.date ||
        oldData.user !== newData.user ||
        oldData.recipient !== newData.recipient
      )
        loadProducts();
    };

    // Watch documentType
    const dtWatcher = watch(documentType, () => {
      loadProducts();
    });

    onBeforeUnmount(() => {
      dtWatcher();
    });

    return {
      documentType,
      searchReady,
      updateFilters,
      loading,
      products,
    };
  },
  methods: {
    viewProduct(idx) {
      const productStore = useProductStore();
      const data = this.products[idx].data;
      if (data) productStore.setProduct([data]);
    },
    openDocument(row) {
      console.log(row);
      const router = this.$router;

      router.push({
        name: "document-view",
        params: {
          documentId: row.orderid,
        },
        query: { enableBack: 1 },
      });
    },
  },
});
</script>
