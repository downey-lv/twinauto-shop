<template>
  <div
    class="modal modal-xl fade"
    id="document_labels"
    ref="documentRepackageModalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="fw-bold">Izkomplektēt</h2>

          <!--begin::Close-->
          <div
            @click="hide()"
            class="btn btn-icon btn-sm btn-active-icon-primary"
          >
            <KTIcon icon-name="cross" icon-class="fs-1" />
          </div>
          <!--end::Close-->
        </div>

        <div class="modal-body py-10 px-lg-17">
          <div class="row border-bottom mb-2 pb-1 fw-bold">
            <div class="col-2">Kods</div>
            <div class="col-2">Ražotājs</div>
            <div class="col">Nosaukums</div>
            <div class="col-2">Skaits</div>
            <div class="col-1">Jaunais ID</div>
            <div class="col-1">Jaunais daudz.</div>
          </div>
          <template v-for="(product, idx) in products" :key="idx">
            <div class="row mb-1 justify-content-center align-items-center">
              <div class="col-2 align-self-center">
                {{ product.productcode }}
              </div>
              <div class="col-2 align-self-center">
                <span style="height: 32px">{{ product.producer }}</span>
              </div>
              <div class="col align-self-center">
                <template v-if="product.productTitle">
                  {{ product.productTitle }}<br />
                  {{ product.productSubtitle }}
                </template>
                <span
                  v-else
                  v-html="product.productname.replace(/\n/g, `<br/>`)"
                >
                </span>
              </div>
              <div class="col-2">
                <el-input-number
                  v-model="product.quantity"
                  :min="0"
                  :max="product.original_quantity"
                  :disabled="!product.repackage_amount"
                />
                <div
                  v-if="!product.repackage_amount"
                  class="fs-7 fw-semibold text-danger"
                >
                  Nav izkompl. daudz.
                  <i
                    class="fa-solid fa-circle-question text-info"
                    title="Jaunajā ID jānorāda daudzums iepakojumā"
                    v-tooltip
                  ></i>
                </div>
              </div>
              <div class="col-1">
                {{ product.repackage_to }}
              </div>
              <div class="col-1">
                <template v-if="product.repackage_amount">
                  <span>{{
                    product.quantity * (product.repackage_amount || 0)
                  }}</span>
                </template>
                <template v-else></template>
              </div>
            </div>
          </template>

          <div class="text-center mt-5">
            <button
              class="btn btn-primary"
              type="button"
              @click="repackProducts()"
            >
              Izkomplektēt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { Modal } from "bootstrap";
import { cloneDeep } from "lodash";
import type { DocumentProduct } from "@/types/Document";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";

export default defineComponent({
  name: "document-repackage-modal",
  props: {
    pData: {
      type: Object,
      required: true,
    },
    documentId: {
      type: Number,
      required: true,
    },
  },
  emits: ["refresh"],
  setup(props) {
    interface RepackageProduct extends DocumentProduct {
      original_quantity: number;
      repackage_amount: number;
      repackage_to: string | null;
    }

    const formRef = ref<null | HTMLFormElement>(null);
    const documentRepackageModalRef = ref();
    const loading = ref<boolean>(false);
    const products = ref<RepackageProduct[]>([]);
    const showCode = ref(true);
    const showPrice = ref(false);

    // Init modal
    const initModal = () => {
      const modalElement = documentRepackageModalRef.value;
      modal = new Modal(modalElement);
    };

    // Show modal
    let modal;
    const show = () => {
      if (!modal) {
        initModal();
      }
      loadData();
      modal.show();
    };

    // Hide modal
    const hide = () => {
      if (modal) {
        modal.hide();
      }
    };

    // Load data
    const loadData = () => {
      products.value = cloneDeep(props.pData) as RepackageProduct[];

      // Merge products with the same ID
      products.value = products.value.reduce((acc, product) => {
        const existing = acc.find((p) => p.productid === product.productid);
        if (existing) {
          existing.quantity += product.quantity;
        } else {
          acc.push(product);
        }
        return acc;
      }, [] as RepackageProduct[]);

      // Add needed values
      products.value.forEach((product) => {
        product.original_quantity = product.quantity;
        product.repackage_amount = product.data?.shop?.repackage_to_amount || 0;
        product.repackage_to = product.data?.shop?.repackage_to || null;
      });

      // Delete products that don't have repackage_to
      products.value = products.value.filter(
        (product) => product.data?.shop?.repackage_to
      );
    };

    return {
      products,
      formRef,
      loading,
      documentRepackageModalRef,
      show,
      hide,
      showCode,
      showPrice,
    };
  },

  methods: {
    repackProducts() {
      // Send data to server
      ApiService.post(`document/repackage/${this.documentId}`, {
        products: this.products,
      })
        .then((response) => {
          // Show success message
          push.success("Izkomplektēts");

          // Close modal
          this.hide();

          // Reload document
          this.$emit("refresh");
        })
        .catch((error) => {
          // Show error message
          push.error("Kļūda izkomplektējot");
        });
    },
  },
});
</script>
