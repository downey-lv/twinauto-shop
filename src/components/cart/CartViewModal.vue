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
        <div class="modal-body py-10 px-lg-10">
          <CartView :cart-id="cartId" />
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
              @confirm="emitAction(`delete`)"
            >
              <template #reference>
                <el-button type="danger">Dzēst</el-button>
              </template>
            </el-popconfirm>

            <el-button type="success" @click="emitAction(`sell`)"
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
import { defineComponent, ref } from "vue";
import "@/assets/uploader.css";
import { Modal } from "bootstrap";
import CartView from "@/components/cart/CartView.vue";

export default defineComponent({
  name: "cart-view-modal",
  components: { CartView },
  emits: ["delete", "sell"],
  props: {
    cartId: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const cartViewModalRef = ref();

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

    return {
      cartViewModalRef,
      show,
      hide,
    };
  },
  methods: {
    emitAction(event) {
      this.hide();
      this.$emit(event);
    },
  },
});
</script>
