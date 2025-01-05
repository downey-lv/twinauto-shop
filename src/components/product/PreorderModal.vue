<template>
  <div
    class="modal fade"
    id="preorder"
    ref="preorderModalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <!--begin::Modal dialog-->
    <div class="modal-dialog modal-lg modal-dialog-centered mw-650px">
      <!--begin::Modal content-->
      <div class="modal-content">
        <!--begin::Modal header-->
        <div class="modal-header">
          <!--begin::Modal title-->
          <h2 class="fw-bold">Pasūtītā prece</h2>
          <!--end::Modal title-->

          <!--begin::Close-->
          <div
            @click="hide()"
            class="btn btn-icon btn-sm btn-active-icon-primary"
          >
            <KTIcon icon-name="cross" icon-class="fs-1" />
          </div>
          <!--end::Close-->
        </div>
        <!--end::Modal header-->
        <!--begin::Form-->
        <el-form
          @submit.prevent="submit()"
          :model="formData"
          :rules="rules"
          @keydown.enter.prevent
          ref="formRef"
          label-width="120px"
        >
          <!--begin::Modal body-->
          <div class="modal-body py-10 px-lg-10">
            <template v-if="formData.preorder_id">
              <el-form-item label="Pievienots">
                {{ formData.created_date }}
              </el-form-item>
              <el-form-item label="Lietotājs">
                {{ formData.user_name }}
              </el-form-item>
            </template>

            <el-form-item prop="price" label="Cena" required>
              <el-tooltip
                :content="product?.priceDetails || ``"
                raw-content
                placement="left"
                :disabled="!product?.priceDetails"
              >
                <template #content>
                  <div
                    v-for="(price, label) in product?.priceDetailsList || []"
                    :key="label"
                    class="d-flex"
                  >
                    <div class="flex-grow-1 me-2">{{ label }}</div>
                    <div>
                      <a href="#" @click.prevent="setPrice(price)">{{
                        price
                      }}</a>
                      €
                    </div>
                  </div>
                </template>
                <el-input-number
                  v-model="formData.price"
                  :precision="2"
                  class="w-50"
                  :controls="false"
                />
              </el-tooltip>
            </el-form-item>

            <el-form-item prop="quantity" label="Daudzums" required>
              <el-input-number
                v-model="formData.quantity"
                :step="1"
                class="w-50"
              />
            </el-form-item>

            <el-form-item prop="supplier_id" label="Piegādātājs">
              <SelectComponentVirtualized
                v-loading="loadingClients"
                class="w-100"
                element-class="mb-0"
                :options="clients"
                v-model="formData.supplier_id"
                clearable
              />
            </el-form-item>

            <el-collapse
              v-model="activeCollapse"
              v-if="productSuppliers"
              style="margin-bottom: 18px"
            >
              <el-collapse-item title="Cenas" name="1">
                <ProductSuppliers
                  :suppliers="productSuppliers"
                  enable-select
                  @select-supplier="setSupplier"
                />
              </el-collapse-item>
            </el-collapse>

            <el-form-item prop="customer_id" label="Klients">
              <SelectComponentVirtualized
                v-loading="loadingClients"
                class="w-100"
                element-class="mb-0"
                :options="clients"
                v-model="formData.customer_id"
                clearable
              />
            </el-form-item>

            <el-form-item prop="comment" label="Komentārs">
              <el-input
                v-model="formData.comment"
                type="textarea"
                class="w-100"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                v-if="formData.preorder_id"
                type="danger"
                @click="deletePreorder()"
                >Dzēst</el-button
              >
              <el-button type="primary" @click="submit()">
                <span v-if="formData.preorder_id">Saglabāt</span>
                <span v-else>Pievienot</span>
              </el-button>
              <el-button @click="hide()">Atcelt</el-button>
            </el-form-item>
          </div>
          <!--end::Modal body-->
        </el-form>
        <!--end::Form-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Modal } from "bootstrap";
import type { FormInstance } from "element-plus";
import type { Product, Supplier } from "@/types/Product";
import type {
  newPreorderedProduct,
  PreorderedProduct,
} from "@/types/PreorderedProducts";
import SelectComponentVirtualized from "@/components/core/form/SelectComponentVirtualized.vue";
import type { Company } from "@/types/Document";
import ProductSuppliers from "@/components/product/ProductSuppliers.vue";
import Swal from "sweetalert2";

export default defineComponent({
  name: "preorder-modal",
  components: { ProductSuppliers, SelectComponentVirtualized },
  props: {
    product: {
      type: Object as PropType<Product>,
      required: false,
    },
    preorder: {
      type: Object as PropType<PreorderedProduct>,
      required: false,
    },
    productSuppliers: {
      type: Object as PropType<Supplier[]>,
      required: false,
    },
  },
  emits: ["refresh"],
  setup(props) {
    const formRef = ref<null | HTMLFormElement>(null);
    const preorderModalRef = ref();
    const loading = ref<boolean>(false);
    const activeCollapse = ref<String[]>([]);

    const blankForm: newPreorderedProduct = {
      preorder_id: null,
      product_id: null,
      quantity: 1,
      price: null,
      supplier_id: null,
      customer_id: null,
      comment: "",
      user_name: "",
      created_date: "",
    };
    const formData = ref({ ...blankForm });

    // Init modal
    const initModal = () => {
      const modalElement = preorderModalRef.value;
      modal = new Modal(modalElement);
      fetchClients();
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

    function loadData() {
      formData.value = { ...blankForm };

      // Set product data
      if (props.preorder) {
        const p = props.preorder;
        formData.value = {
          preorder_id: p.preorder_id,
          product_id: p.product_id,
          supplier_id: p.supplier_id ? String(p.supplier_id) : null,
          customer_id: p.customer_id ? String(p.customer_id) : null,
          quantity: Number(p.quantity),
          price: Number(p.price),
          comment: p.comment,
          user_name: p.user_name,
          created_date: p.created_date,
        };
        activeCollapse.value = [];
      } else if (props.product) {
        formData.value.product_id = Number(props.product.productid);
        formData.value.price = Number(props.product.priceSell);
        activeCollapse.value = ["1"];
      }
    }

    // Setup data load
    const idWatcher = watch(
      () => props.product,
      (newVal) => {
        if (newVal) loadData();
      }
    );

    onBeforeUnmount(() => {
      idWatcher();
    });

    const rules = ref({});

    // Client selection
    const loadingClients = ref(false);
    const clients = ref<Company[]>([]);
    const fetchClients = async () => {
      loadingClients.value = true;
      await ApiService.get("company/")
        .then((response) => {
          clients.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching clients`, error);
        })
        .finally(() => {
          loadingClients.value = false;
        });
    };

    return {
      rules,
      formRef,
      loading,
      preorderModalRef,
      show,
      hide,
      loadData,
      formData,
      loadingClients,
      clients,
      activeCollapse,
    };
  },

  methods: {
    submit() {
      (this.$refs.formRef as FormInstance).validate((valid: boolean) => {
        if (valid) {
          this.loading = true;
          ApiService.post("preorder/", this.formData)
            .then(() => {
              push.success("Pievienots");
              this.$emit("refresh");
              this.hide();
            })
            .catch(() => {
              push.error("Neizdevās pievienot");
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    },
    async deletePreorder() {
      const result = await Swal.fire({
        title: "Vai esi pārliecināts?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "var(--el-color-danger)",
        confirmButtonText: "Dzēst",
        cancelButtonText: "Atcelt",
      });

      if (result.isConfirmed) {
        this.loading = true;
        ApiService.delete(`preorder/${this.formData.preorder_id}`)
          .then(() => {
            push.success("Dzēsts");
            this.$emit("refresh");
            this.hide();
          })
          .catch(() => {
            push.error("Neizdevās dzēst");
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    setPrice(price) {
      this.formData.price = Number(price);
    },
    setSupplier(supplierId) {
      this.formData.supplier_id = String(supplierId);
      this.activeCollapse = [];
    },
  },
});
</script>
