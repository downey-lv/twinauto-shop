<template>
  <div
    class="modal fade"
    id="cartAdd"
    ref="cartAddModalRef"
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
          <h2 class="fw-bold">Pievienot grozam</h2>
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
          model=""
          :rules="rules"
          ref="formRef"
        >
          <!--begin::Modal body-->
          <div class="modal-body py-10 px-lg-10">
            <el-form
              @submit.prevent="submit()"
              :model="formData"
              :rules="rules"
              @keydown.enter.prevent
              ref="formRef"
              label-width="120px"
            >
              <SelectComponent
                v-model="formData.selectedCart"
                :options="carts"
                label="Grozs"
                allow-create
                grouped
                clearable
                placeholder="Izvēlies, ievadi jaunā nosaukumu vai atstāj tukšu"
              />
              <el-form-item prop="amount" label="Cena">
                <el-tooltip
                  :content="product.priceDetails || ``"
                  raw-content
                  placement="left"
                  :disabled="!product.priceDetails"
                >
                  <template #content>
                    <div
                      v-for="(price, label) in product.priceDetailsList || []"
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
                    v-model="formData.amount"
                    :precision="2"
                    class="w-50"
                    :controls="false"
                  />
                </el-tooltip>
              </el-form-item>
              <el-form-item prop="quantity" label="Daudzums">
                <el-input-number
                  v-model="formData.quantity"
                  :step="1"
                  class="w-50"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="success" @click="submit(true)"
                  >Pievienot un pārdot</el-button
                >
                <el-button type="primary" @click="submit">Pievienot</el-button>
                <el-button @click="hide()">Atcelt</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!--end::Modal body-->
        </el-form>
        <!--end::Form-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref, watch } from "vue";
import SelectComponent from "@/components/core/form/SelectComponent.vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import "@/assets/uploader.css";
import { Modal } from "bootstrap";
import type { FormInstance } from "element-plus";
import type { PropType } from "vue";
import type { Product } from "@/types/Product";
import type { newCartItem } from "@/types/Cart";

export default defineComponent({
  name: "cart-add-modal",
  components: { SelectComponent },
  props: {
    product: {
      type: Object as PropType<Product>,
      required: true,
    },
  },
  setup(props) {
    const formRef = ref<null | HTMLFormElement>(null);
    const cartAddModalRef = ref();
    const loading = ref<boolean>(false);

    const blankForm: newCartItem = {
      selectedCart: "",
      productId: "",
      amount: null,
      quantity: 1,
    };
    const formData = ref({ ...blankForm });

    // Init modal
    const initModal = () => {
      const modalElement = cartAddModalRef.value;
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

    const cartAdd = ref([]);
    function loadData() {
      loadCarts();
      formData.value = { ...blankForm };

      // Set product data
      formData.value.productId = props.product.productid;
      formData.value.amount = Number(props.product.priceSell);
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

    const rules = ref({
      recipient: [
        {
          required: true,
          message: "",
          trigger: "change",
        },
      ],
    });

    const carts = ref([]);
    function loadCarts() {
      ApiService.get("cart", "list")
        .then((response) => {
          const data = response.data;
          carts.value = data.cartList;

          // Get current cart from local storage
          const cartId = localStorage.getItem("cartId");
          if (cartId) {
            // Check if cart exists
            const { cartObj } = data;
            const cartExists = cartObj.some(
              (item) => String(item.cart_id) === String(cartId)
            );

            // Set as selected cart
            if (cartExists) formData.value.selectedCart = cartId;
          }
        })
        .catch(() => {
          push.error("Neizdevās ielādēt grozus");
        });
    }

    return {
      cartAdd,
      rules,
      formRef,
      loading,
      cartAddModalRef,
      show,
      hide,
      loadData,
      formData,
      carts,
    };
  },

  methods: {
    submit(createDocument = false) {
      (this.$refs.formRef as FormInstance).validate((valid: boolean) => {
        if (valid) {
          this.loading = true;
          ApiService.post("cart/", this.formData)
            .then((response) => {
              this.loadData();
              push.success("Pievienots");
              this.$emit("refresh");
              this.hide();

              const { cartId } = response.data;
              // Save cart id to local storage
              localStorage.setItem("cartId", cartId);

              // Create document
              if (createDocument) {
              }
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
    setPrice(price) {
      this.formData.amount = Number(price);
    },
  },
});
</script>
