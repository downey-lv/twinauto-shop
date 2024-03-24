<template>
  <div
    class="modal fade"
    id="cartView"
    ref="cartViewModalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <!--begin::Modal dialog-->
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <!--begin::Modal content-->
      <div class="modal-content">
        <!--begin::Modal header-->
        <div class="modal-header">
          <!--begin::Modal title-->
          <h2 class="fw-bold">Grozs</h2>
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
        <!--begin::Modal body-->
        <div class="modal-body py-10 px-lg-10" v-loading="loading">
          <div class="row">
            <div class="col-5 fw-bold">Nosaukums</div>
            <div class="col">
              {{ cartData.title }}
            </div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">Lietotājs</div>
            <div class="col">
              {{ cartData.owner_name }}
            </div>
          </div>
          <div class="row">
            <div class="col-5 fw-bold">Izveidots</div>
            <div class="col">
              {{ cartData.created_timestamp }}
            </div>
          </div>
          <div class="separator separator-dashed my-6"></div>
          <CartProducts :cart-data="cartData" @refresh="loadData" />
        </div>
        <!--end::Modal body-->
        <div class="modal-footer flex-center">
          <el-form-item>
            <el-popconfirm
              confirm-button-text="Dzēst"
              cancel-button-text="Atcelt"
              confirm-button-type="danger"
              :title="`Izdzēst grozu?`"
              :width="300"
              @confirm="
                hide();
                this.$emit(`delete`);
              "
            >
              <template #reference>
                <el-button type="danger">Dzēst</el-button>
              </template>
            </el-popconfirm>

            <el-button
              type="success"
              @click="
                hide();
                this.$emit(`sell`);
              "
              >Pārdot</el-button
            >
            <el-button @click="hide()">Aizvērt</el-button>
          </el-form-item>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import "@/assets/uploader.css";
import { Modal } from "bootstrap";
import type { Cart } from "@/types/Cart";
import CartProducts from "@/components/cart/CartProducts.vue";

export default defineComponent({
  name: "cart-view-modal",
  components: { CartProducts },
  emits: ["delete", "sell"],
  props: {
    cartId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const formRef = ref<null | HTMLFormElement>(null);
    const cartViewModalRef = ref();
    const loading = ref<boolean>(false);

    const blankCart: Cart = {
      cart_id: "",
      title: "",
      owner_name: "",
      products: [],
    };
    const cartData = ref({ ...blankCart });

    // Init modal
    const initModal = () => {
      const modalElement = cartViewModalRef.value;
      modal = new Modal(modalElement);
    };

    // Show modal
    let modal;
    const show = () => {
      if (!modal) {
        initModal();
      }
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
      cartData.value = { ...blankCart };

      if (!props.cartId) return;

      // Load cart data
      loading.value = true;
      ApiService.get(`cart/${props.cartId}`)
        .then((response) => {
          cartData.value = response.data;
        })
        .catch(() => {
          push.error("Neizdevās ielādēt grozu");
        })
        .finally(() => {
          loading.value = false;
        });
    }

    // Setup data load
    const idWatcher = watch(
      () => props.cartId,
      (newVal) => {
        if (newVal) loadData();
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      idWatcher();
    });

    return {
      cartAdd,
      formRef,
      loading,
      cartViewModalRef,
      show,
      hide,
      loadData,
      cartData,
    };
  },
});
</script>
