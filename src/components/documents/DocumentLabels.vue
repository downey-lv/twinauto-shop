<template>
  <div
    class="modal modal-xl fade"
    id="document_labels"
    ref="documentLabelsModalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
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

        <div class="modal-body py-10 px-lg-17" v-loading="loading">
          <div class="row border-bottom mb-2 pb-1 fw-bold">
            <div class="col-2">Kods</div>
            <div class="col-2">Ražotājs</div>
            <div class="col">Nosaukums</div>
            <div class="col-2">Skaits</div>
          </div>
          <template v-for="(product, idx) in products" :key="idx">
            <div class="row mb-1 justify-content-center align-items-center">
              <div class="col-2 align-self-center">
                {{ product.productcode }}
              </div>
              <div class="col-2 align-self-center">
                <span style="height: 32px">{{ product.producer }}</span>
              </div>
              <div class="col align-self-center row">
                <div class="col fs-8">
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
                <div class="col-2 text-end" v-if="product.eshopQuantity && product.eshopQuantity > 0">
                  <span class="badge badge-info">
                    {{ product.eshopQuantity }}
                  </span>
                </div>
              </div>
              <div class="col-2">
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
import ApiService from "@/core/services/ApiService";

export default defineComponent({
  name: "document-labels-modal",
  props: {
    pData: {
      type: Object,
      required: true,
    },
    stockBased: {
      type: Boolean,
      default: false,
    },
    supplierId: {
      type: Number,
      default: 0,
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
      checkOrders();
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

      // Merge products with the same ID
      products.value = products.value.reduce((acc, product) => {
        const existing = acc.find((p) => p.productid === product.productid);
        if (existing) {
          existing.quantity += product.quantity;
        } else {
          acc.push(product);
        }
        return acc;
      }, [] as DocumentProduct[]);

      // Add eshopQuantity to each product
      products.value.forEach((product) => {
        product.eshopQuantity = 0;
      });

      // Stock based processing
      if (props.stockBased) {
        // Delete products with 0 rest
        products.value = products.value.filter((product) => {
          return Number(product.data?.rest ?? 0) > 0;
        });

        // Sort by producer
        products.value.sort((a, b) => {
          return a.producer.localeCompare(b.producer);
        });
      }
    };

    const checkOrders = () => {
      // Check if supplierId is set
      if (!props.supplierId) {
        push.error("Nav informācija par piegādātāju");
        return;
      }

      // Send API request
      loading.value = true;
      ApiService.get(`/api/eshop/supplier/${props.supplierId}`)
        .then((response) => {
          // Loop through products and set eshopQuantity
          products.value.forEach((product) => {
            // Find product by ID
            let eshopProduct = response.data.find(
              (p) => parseInt(p.id) === parseInt(product.productid)
            );

            // Find by code_alphanum and tecdoc_id
            if (!eshopProduct) {
              eshopProduct = response.data.find(
                (p) =>
                  String(p.code_alphanum) ===
                  String(product.data?.codeAlphanum) &&
                  Number(p.tecdoc_id) === product.data?.tecdocId
              );
            }

            // If product is found, set eshopQuantity
            if (eshopProduct) {
              product.eshopQuantity += eshopProduct.quantity;
            }
          });
        })
        .catch((error) => {
          console.error(error);
          push.error("Neizdevās pārbaudīt internetu");
        })
        .finally(() => {
          loading.value = false;
        });
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
      checkOrders,
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

        // Format e-shop quantity
        let eshopQuantityUsed = false;
        this.products.forEach((product) => {
          // Skip if no shop data
          if (!product.data?.shop) return;

          const eshopQuantity = product.eshopQuantity || 0;

          // Check if eshopQuantity is greater than 0
          if (eshopQuantity > 0) {
            eshopQuantityUsed = true;

            const formatted_code = `* ${product.data.shop.productcode}`;

            // If eshop quantity is greater or equal to quantity, prepend star to code
            if (eshopQuantity >= product.quantity) {
              product.data.shop.productcode = formatted_code;
            } else {
              // Else clone product
              const newProduct = cloneDeep(product);

              // Check if product has shop data
              if (!newProduct.data?.shop) return;

              // Format code
              newProduct.data.shop.productcode = formatted_code;

              // Adjust quantities
              newProduct.quantity = eshopQuantity;
              product.quantity = product.quantity - eshopQuantity;

              // Push new product to array
              this.products.push(newProduct);
            }
          }
        });

        // If eshopQuantityUsed sort by productcode
        if (eshopQuantityUsed) {
          this.products.sort((a, b) => {
            // Skip if no shop data
            if (!a.data?.shop || !b.data?.shop) return 0;

            return a.data.shop.productcode.localeCompare(b.data.shop.productcode);
          });
        }

        // Set label data
        let products = [] as any[];
        this.products.forEach((product) => {
          // Skip if no shop data
          if (!product.data?.shop) return;

          // Add product to array based on quantity
          for (let i = 0; i < product.quantity; i++) {
            products.push(product.data);
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
