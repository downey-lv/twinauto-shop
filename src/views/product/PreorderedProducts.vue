<template>
  <DailyFilter
    @updateFilters="updateFilters"
    :show-date-filter="false"
    :show-recipient-filter="false"
    show-client-filter
    show-ordered-product-filter
    show-text-filter
  />

  <div class="card mb-5" v-loading="loading">
    <div class="card-body">
      <p class="text-muted">Divreiz uzklikšķini uz rindas, lai labotu</p>
      <button
        class="btn btn-sm btn-info mb-2"
        @click="openCartModal"
        :disabled="!enableCartButton"
      >
        Uz grozu
      </button>
      <el-table
        :data="products"
        style="width: 100%"
        :default-sort="{ prop: 'preorder_id', order: 'descending' }"
        @row-dblclick="openPreorderModal"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column property="productidstr" label="ID" width="80" />
        <el-table-column property="productcode" label="Kods">
          <template #default="scope">
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ scope.row.productcode }}</span>
              <button
                class="btn btn-icon btn-sm btn-active-primary"
                @click="viewProduct(scope.row.productid, scope.row.product_data)"
              >
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </template>
        </el-table-column>
        <el-table-column property="producer" label="Ražotājs" />
        <el-table-column property="productname" label="Nosaukums" width="350">
          <template #default="scope">
            <span
              v-html="(scope.row.productname ?? '').replace(/\n/g, '<br/>')"
            ></span>
          </template>
        </el-table-column>
        <el-table-column property="quantity" label="Daudz." width="80" />
        <el-table-column property="price" label="Cena" width="80" />
        <el-table-column property="supplier_name" label="Piegādātājs" />
        <el-table-column property="customer_name" label="Saņēmējs" />
        <el-table-column property="comment" label="Komentārs" />
        <el-table-column property="created_date" label="Pievienots" />
        <el-table-column property="user_name" label="Lietotājs" width="130" />
        <el-table-column property="delivered" label="" width="50">
          <template #default="scope">
            <i
              v-if="scope.row.delivered"
              class="fa-duotone fa-solid fa-fw fa-circle-check text-success"
              title="Piegādāts"
              v-tooltip
            ></i>
            <i
              v-else
              class="fa-duotone fa-solid fa-fw fa-hourglass-start text-warning"
              title="Gaida"
              v-tooltip
            ></i>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

  <PreorderModal
    ref="preorderModalRef"
    :preorder="selectedPreorder"
    @refresh="loadProducts()"
  />
  <CartPreorderModal
    ref="cardPreorderModalRef"
    :products="checkedPreorders"
    @refresh="loadProducts()"
  ></CartPreorderModal>
</template>

<script lang="ts">
import { defineComponent, nextTick, ref } from "vue";
import DailyFilter from "@/components/documents/DailyFilter.vue";
import { useProductStore } from "@/stores/product";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Tooltip } from "bootstrap";
import type { PreorderedProduct } from "@/types/PreorderedProducts";
import PreorderModal from "@/components/product/PreorderModal.vue";
import CartPreorderModal from "@/components/cart/CartPreorderModal.vue";

export default defineComponent({
  components: {
    CartPreorderModal,
    PreorderModal,
    DailyFilter,
  },
  setup() {
    const checkedPreorders = ref<PreorderedProduct[]>([]);
    const enableCartButton = ref(false);

    // Modal
    const selectedPreorder = ref<PreorderedProduct | null>(null);

    // Tooltips for table
    const initializeTooltips = () => {
      nextTick(() => {
        document.querySelectorAll(".tooltip-item").forEach((el) => {
          new Tooltip(el, { html: true });
        });
      });
    };

    // Data load
    const loading = ref(false);
    const products = ref<PreorderedProduct[]>([]);
    const loadProducts = async () => {
      loading.value = true;
      await ApiService.get("preorder", "", {
        client_id: filterClient.value,
        user_id: filterUser.value,
        delivered: filterDelivered.value,
        text: filterText.value,
      })
        .then((response) => {
          products.value = response.data;
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

    // Filters
    const filterUser = ref("");
    const filterClient = ref("");
    const filterDelivered = ref("");
    const filterText = ref("");

    const updateFilters = (newData) => {
      const oldData = {
        client: filterClient.value,
        user: filterUser.value,
        delivered: filterDelivered.value,
        text: filterText.value,
      };

      filterClient.value = newData.client;
      filterUser.value = newData.user;
      filterDelivered.value = newData.delivered;
      filterText.value = newData.text;

      if (
        oldData.client !== newData.client ||
        oldData.user !== newData.user ||
        oldData.delivered !== newData.delivered ||
        oldData.text !== newData.text
      )
        loadProducts();
    };

    return {
      updateFilters,
      loadProducts,
      loading,
      products,
      selectedPreorder,
      checkedPreorders,
      enableCartButton,
    };
  },
  methods: {
    viewProduct(product_id, product_data) {
      const productStore = useProductStore();

      if (product_id) {
        ApiService.get(`/product/find/id/${product_id}`).then((response) => {
          const data = response.data[0];
          if (data) productStore.setProduct([data]);
        });
      } else {
        if (product_data) productStore.setProduct([product_data]);
      }
    },
    openPreorderModal(preorder: PreorderedProduct) {
      this.selectedPreorder = preorder;
      this.$nextTick(() => {
        (this.$refs.preorderModalRef as any).show();
      });
    },
    handleSelectionChange(val) {
      this.checkedPreorders = val;

      // Check if cart button should be enabled
      let enable_cart = false;
      if (val.length > 0) {
        enable_cart = true;

        // Check if all products have product_id
        val.forEach((item) => {
          if (!item.productid) {
            enable_cart = false;
            return;
          }
        });
      }
      this.enableCartButton = enable_cart;
    },
    openCartModal() {
      this.$nextTick(() => {
        (this.$refs.cardPreorderModalRef as any).show();
      });
    },
  },
});
</script>
