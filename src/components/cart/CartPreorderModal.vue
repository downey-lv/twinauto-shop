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
          :model="formData"
          :rules="rules"
          @keydown.enter.prevent
          ref="formRef"
          label-width="120px"
        >
          <!--begin::Modal body-->
          <div class="modal-body py-10 px-lg-10">
            <el-table class="mb-5" :data="products" style="width: 100%">
              <el-table-column property="productidstr" label="ID" sortable />
              <el-table-column property="productcode" label="Kods" sortable />
              <el-table-column property="producer" label="Ražotājs" sortable />
              <el-table-column property="quantity" label="Daudzums" sortable />
              <el-table-column property="price" label="Cena" sortable />
            </el-table>

            <SelectComponent
              v-model="formData.selectedCart"
              :options="carts"
              label="Grozs"
              allow-create
              grouped
              clearable
              placeholder="Izvēlies, ievadi jaunā nosaukumu vai atstāj tukšu"
            />
            <el-form-item>
              <el-button type="success" @click="submit(true)"
                >Pievienot un pārdot</el-button
              >
              <el-button type="primary" @click="submit()">Pievienot</el-button>
              <el-button @click="hide()">Atcelt</el-button>
            </el-form-item>
          </div>
          <!--end::Modal body-->
        </el-form>
        <!--end::Form-->
      </div>
    </div>
  </div>
  <CartSellModal ref="cartSellModalRef" :cart-id="formData.selectedCart" />
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import SelectComponent from "@/components/core/form/SelectComponent.vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import "@/assets/uploader.css";
import { Modal } from "bootstrap";
import type { FormInstance } from "element-plus";
import type { PropType } from "vue";
import type { preorderCart } from "@/types/Cart";
import CartSellModal from "@/components/cart/CartSellModal.vue";
import type { PreorderedProduct } from "@/types/PreorderedProducts";

export default defineComponent({
  name: "cart-preorder-modal",
  components: { CartSellModal, SelectComponent },
  props: {
    products: {
      type: Array as PropType<PreorderedProduct[]>,
      required: true,
    },
  },
  emits: ["refresh"],
  setup(props) {
    const formRef = ref<null | HTMLFormElement>(null);
    const cartAddModalRef = ref();
    const loading = ref<boolean>(false);

    const blankForm: preorderCart = {
      selectedCart: "",
      preorders: [],
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

      // Set preorder ids
      formData.value.preorders = props.products;
    }

    // Setup data load
    const idWatcher = watch(
      () => props.products,
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
    submit(sellCart = false) {
      (this.$refs.formRef as FormInstance).validate((valid: boolean) => {
        if (valid) {
          this.loading = true;
          ApiService.post("cart/preorder/", this.formData)
            .then((response) => {
              this.loadData();
              push.success("Pievienots");
              this.$emit("refresh");
              this.hide();

              const { cartId } = response.data;
              // Save cart id to local storage
              localStorage.setItem("cartId", cartId);

              // Create document
              if (sellCart) {
                (this.$refs.cartSellModalRef as any).show();
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
  },
});
</script>
