<template>
  <div
    class="modal fade"
    id="document_labels"
    ref="documentLabelsModalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered mw-650px">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="fw-bold">Drukāt uzlīmes</h2>

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
            <div class="col">Kods</div>
            <div class="col">Ražotājs</div>
            <div class="col">Skaits</div>
          </div>
          <template v-for="(product, idx) in products" :key="idx">
            <div class="row mb-1 justify-content-center align-items-center">
              <div class="col align-self-center">
                {{ product.productcode }}
              </div>
              <div class="col align-self-center">
                <span style="height: 32px">{{ product.producer }}</span>
              </div>
              <div class="col">
                <el-input-number v-model="product.quantity" :min="0" />
              </div>
            </div>
          </template>

          <div class="d-flex flex-row justify-content-center mt-5">
            <div class="form-check form-switch me-5">
              <input
                class="form-check-input"
                type="checkbox"
                v-model="showCode"
              />
              <label class="form-check-label"> Rādīt kodu </label>
            </div>
            <div class="form-check form-switch me-5">
              <input
                class="form-check-input"
                type="checkbox"
                v-model="showPrice"
              />
              <label class="form-check-label"> Rādīt cenu </label>
            </div>
          </div>

          <div class="text-center mt-5">
            <button
              class="btn btn-primary"
              type="button"
              @click="printLabel($event, !showPrice, !showCode)"
            >
              Drukāt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { push } from "@/main";
import { Modal } from "bootstrap";
import { labelService } from "@/core/services/LabelService";
import { cloneDeep } from "lodash";
import type { DocumentProduct } from "@/types/Document";

export default defineComponent({
  name: "document-labels-modal",
  props: {
    pData: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const formRef = ref<null | HTMLFormElement>(null);
    const documentLabelsModalRef = ref();
    const loading = ref<boolean>(false);
    const products = ref<DocumentProduct[]>([]);
    const showCode = ref(true);
    const showPrice = ref(false);

    // Init modal
    const initModal = () => {
      const modalElement = documentLabelsModalRef.value;
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
      products.value = cloneDeep(props.pData) as DocumentProduct[];

      // Check if rest is lower than quantity
      // products.value.forEach((product) => {
      //   if (
      //     product.data &&
      //     Number(product.data.rest ?? 0) < Number(product.quantity)
      //   ) {
      //     product.quantity = Math.max(Number(product.data.rest), 0);
      //   }
      // });
    };

    return {
      products,
      formRef,
      loading,
      documentLabelsModalRef,
      show,
      hide,
      showCode,
      showPrice,
    };
  },

  methods: {
    async printLabel(event, hidePrice = true, hideCode = false) {
      // Format button
      const el = event.target;
      const value = el.innerHTML;
      el.innerHTML = `<i class="fa-solid fa-spinner-third fa-spin"></i>`;
      try {
        // Set params
        let params = {
          hidePrice: hidePrice,
          hideCode: hideCode,
        };

        // Set label data
        let products = [] as any[];
        this.products.forEach((product) => {
          for (let i = 0; i < product.quantity; i++) {
            if (product.data?.shop) products.push(product.data);
          }
        });

        if (products.length === 0) {
          push.error("Nav atzīmētas uzlīmes");
          return;
        }

        await labelService.print("product", products, params);
        this.hide();
      } catch (e) {
        console.error(e);
        push.error("Neizdevās izdrukāt uzlīmes");
      } finally {
        el.innerHTML = value;
      }
    },
  },
});
</script>
