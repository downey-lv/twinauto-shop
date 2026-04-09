<template>
  <div
    class="modal fade"
    id="product_remap_supplier"
    ref="modalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="fw-bold">Pārsaitīt piegādātāja preci</h2>
          <div
            @click="hide()"
            class="btn btn-icon btn-sm btn-active-icon-primary"
          >
            <KTIcon icon-name="cross" icon-class="fs-1" />
          </div>
        </div>

        <div
          class="modal-body py-10 px-lg-10"
          v-loading="loading || submitting"
        >
          <div class="input-group mb-4">
            <select
              class="form-select"
              style="max-width: 130px"
              v-model="searchType"
            >
              <option value="code">Kods</option>
              <option value="text">Teksts</option>
              <option value="id">ID</option>
            </select>
            <input
              type="text"
              class="form-control"
              v-model="searchQuery"
              placeholder="Meklēt pareizo produktu"
              @keyup.enter="searchProducts"
              autocomplete="off"
            />
            <button
              class="btn btn-primary"
              type="button"
              @click="searchProducts"
            >
              Meklēt
            </button>
          </div>

          <div class="table-responsive" v-if="results.length > 0">
            <table class="table table-row-bordered table-sm align-middle">
              <thead>
                <tr class="fw-bolder text-dark">
                  <th style="width: 40px"></th>
                  <th style="width: 100px">ID</th>
                  <th>Kods</th>
                  <th>Ražotājs</th>
                  <th>Nosaukums</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in results"
                  :key="`${item.masterId || 'none'}-${index}`"
                  :class="{ 'table-light': isCurrentProduct(item) }"
                >
                  <td>
                    <input
                      class="form-check-input"
                      type="radio"
                      name="remap-target"
                      :value="String(item.masterId || '')"
                      v-model="selectedMasterId"
                      :disabled="
                        !item.masterId ||
                        isCurrentProduct(item) ||
                        !isSameTecdocId(item)
                      "
                    />
                  </td>
                  <td>{{ displayId(item) }}</td>
                  <td>{{ displayCode(item) }}</td>
                  <td>{{ displayProducer(item) }}</td>
                  <td v-html="displayName(item)"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="text-muted" v-else-if="searched">
            Nekas netika atrasts.
          </div>

          <div v-if="selectedProduct" class="border rounded p-4 mt-6">
            <h5 class="fw-bold mb-3">Salīdzinājums</h5>
            <div class="table-responsive">
              <table class="table table-row-dashed table-sm align-middle mb-0">
                <thead>
                  <tr class="fw-bolder text-dark">
                    <th style="width: 180px">Lauks</th>
                    <th>Pašreizējais</th>
                    <th>Izvēlētais</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Kods</td>
                    <td>{{ currentCode }}</td>
                    <td>{{ selectedCode }}</td>
                  </tr>
                  <tr>
                    <td>Ražotājs</td>
                    <td>{{ currentProducer }}</td>
                    <td>{{ selectedProducer }}</td>
                  </tr>
                  <tr>
                    <td>Nosaukums</td>
                    <td v-html="currentName"></td>
                    <td v-html="selectedName"></td>
                  </tr>
                  <tr>
                    <td>Piegādātāji</td>
                    <td>{{ currentSuppliers }}</td>
                    <td>{{ selectedSuppliers }}</td>
                  </tr>
                  <tr>
                    <td>Ir TecDoc</td>
                    <td v-html="currentHasTecdoc"></td>
                    <td v-html="selectedHasTecdoc"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-light" @click="hide()">Atcelt</button>
          <button
            class="btn btn-primary"
            :disabled="!canRemap || saveLoading"
            @click="submitRemap"
          >
            <span v-if="saveLoading">
              <i class="fa-solid fa-spinner-third fa-spin me-2"></i>
              Saglabā...
            </span>
            <span v-else>Pārsaitīt</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from "vue";
import { Modal } from "bootstrap";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import type { Product } from "@/types/Product";
import { useRouter } from "vue-router";

type ProductSearchResult = {
  tecdocId?: string;
  tecdoc?: unknown;
  productid?: string;
  code?: string;
  producer?: string;
  name?: string;
  masterId?: string | number;
  suppliers?: { supplier_name?: string }[];
  vide?: {
    suppliers?: { supplier_name?: string }[];
  };
  shop?: {
    productid?: string;
    productcode?: string;
    producer?: string;
    productname?: string;
    lastsuppliername?: string;
  };
};

export default defineComponent({
  name: "product-remap-modal",
  props: {
    product: {
      type: Object as PropType<Product | null>,
      required: false,
    },
  },
  emits: ["remapped"],
  setup(props, { emit }) {
    const router = useRouter();
    const modalRef = ref();
    const loading = ref(false);
    const submitting = ref(false);
    const saveLoading = ref(false);
    const searchQuery = ref("");
    const searchType = ref("code");
    const searched = ref(false);
    const selectedMasterId = ref("");
    const results = ref<ProductSearchResult[]>([]);

    let modal: Modal | null = null;

    const initModal = () => {
      if (!modal && modalRef.value) {
        modal = new Modal(modalRef.value);
      }
    };

    const show = () => {
      initModal();
      searchQuery.value = "";
      searchType.value = "code";
      selectedMasterId.value = "";
      results.value = [];
      searched.value = false;
      modal?.show();
    };

    const hide = () => {
      modal?.hide();
    };

    const selectedProduct = computed(() => {
      return results.value.find(
        (item) => String(item.masterId || "") === selectedMasterId.value
      );
    });

    const canRemap = computed(() => {
      const currentMasterId = String(props.product?.masterId || "");
      const targetMasterId = String(selectedProduct.value?.masterId || "");
      return (
        !!currentMasterId &&
        !!targetMasterId &&
        currentMasterId !== targetMasterId
      );
    });

    const isCurrentProduct = (item: ProductSearchResult) => {
      return (
        String(item.masterId || "") === String(props.product?.masterId || "")
      );
    };

    const isSameTecdocId = (item: ProductSearchResult) => {
      return (
        String(item.tecdocId || "") === String(props.product?.tecdocId || "")
      );
    };

    const displayId = (item: ProductSearchResult) => {
      return item.productid || item.shop?.productid || "-";
    };

    const displayCode = (item: ProductSearchResult) => {
      return item.code || item.shop?.productcode || "-";
    };

    const displayProducer = (item: ProductSearchResult) => {
      return item.producer || item.shop?.producer || "-";
    };

    const displayName = (item: ProductSearchResult) => {
      return item.name || item.shop?.productname || "-";
    };

    const getSupplierNames = (
      item: ProductSearchResult | Product | null | undefined
    ) => {
      if (!item) return "-";
      const names = new Set<string>();

      const rootSuppliers =
        ((item as ProductSearchResult).suppliers as
          | { supplier_name?: string }[]
          | undefined) || [];
      rootSuppliers.forEach((supplier) => {
        if (supplier?.supplier_name) names.add(String(supplier.supplier_name));
      });

      const videSuppliers =
        ((item as ProductSearchResult).vide?.suppliers as
          | { supplier_name?: string }[]
          | undefined) || [];
      videSuppliers.forEach((supplier) => {
        if (supplier?.supplier_name) names.add(String(supplier.supplier_name));
      });

      const shopSupplier = (item as ProductSearchResult).shop?.lastsuppliername;
      if (shopSupplier) names.add(String(shopSupplier));

      return names.size > 0 ? Array.from(names).join(", ") : "-";
    };

    const boolBadge = (item) => {
      if (item) {
        return '<span class="badge badge-success">Jā</span>';
      }
      return '<span class="badge badge-danger">Nē</span>';
    }

    const currentCode = computed(() => {
      return props.product?.code || props.product?.shop?.productcode || "-";
    });
    const currentProducer = computed(() => {
      return props.product?.producer || props.product?.shop?.producer || "-";
    });
    const currentName = computed(() => {
      return props.product?.name || props.product?.shop?.productname || "-";
    });
    const currentSuppliers = computed(() => {
      return getSupplierNames(props.product);
    });
    const currentHasTecdoc = computed(() => {
      const hasTecdoc = props.product?.tecdoc !== null;
      return boolBadge(hasTecdoc);
    });

    const selectedCode = computed(() => {
      return selectedProduct.value ? displayCode(selectedProduct.value) : "-";
    });
    const selectedProducer = computed(() => {
      return selectedProduct.value
        ? displayProducer(selectedProduct.value)
        : "-";
    });
    const selectedName = computed(() => {
      return selectedProduct.value ? displayName(selectedProduct.value) : "-";
    });
    const selectedSuppliers = computed(() => {
      return getSupplierNames(selectedProduct.value);
    });
    const selectedHasTecdoc = computed(() => {
      const hasTecdoc = selectedProduct.value?.tecdoc !== null;
      return boolBadge(hasTecdoc);
    });

    const searchProducts = async () => {
      const q = searchQuery.value.trim();
      if (!q) return;

      loading.value = true;
      searched.value = true;
      selectedMasterId.value = "";

      try {
        const response = await ApiService.get(
          `/product/find/${searchType.value}/${encodeURIComponent(
            q
          )}?exact=1&tecdocId=${props.product?.tecdocId}`
        );
        const data = Array.isArray(response.data) ? response.data : [];
        results.value = data.filter((item) => !!item?.masterId);
      } catch (error) {
        console.error("Error searching products:", error);
        push.error("Neizdevās atrast produktus");
        results.value = [];
      } finally {
        loading.value = false;
      }
    };

    const submitRemap = async () => {
      const currentMasterId = String(props.product?.masterId || "");
      const targetMasterId = String(selectedProduct.value?.masterId || "");
      if (
        !currentMasterId ||
        !targetMasterId ||
        currentMasterId === targetMasterId
      ) {
        return;
      }

      submitting.value = true;
      saveLoading.value = true;
      try {
        await ApiService.post(`/product/remap/supplier/`, {
          currentMasterId,
          targetMasterId,
        });
        const currentRoute = router.currentRoute.value;
        await router.push({
          path: currentRoute.path,
          query: {
            ...currentRoute.query,
            _refresh: String(Date.now()),
          },
          hash: currentRoute.hash,
        });
        emit("remapped", selectedProduct.value);
        push.success("Pārsaiste saglabāta");
        hide();
      } catch (error) {
        console.error("Error remapping supplier product:", error);
        push.error("Neizdevās pārsaitīt produktu");
      } finally {
        submitting.value = false;
        saveLoading.value = false;
      }
    };

    return {
      modalRef,
      loading,
      submitting,
      saveLoading,
      searchQuery,
      searchType,
      searched,
      results,
      selectedMasterId,
      selectedProduct,
      canRemap,
      currentCode,
      currentProducer,
      currentName,
      currentSuppliers,
      currentHasTecdoc,
      selectedCode,
      selectedProducer,
      selectedName,
      selectedSuppliers,
      selectedHasTecdoc,
      show,
      hide,
      searchProducts,
      submitRemap,
      isCurrentProduct,
      isSameTecdocId,
      displayId,
      displayCode,
      displayProducer,
      displayName,
    };
  },
});
</script>
