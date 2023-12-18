<template>
  <div
    class="modal fade"
    id="csdd"
    ref="csddModalRef"
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
          <h2 class="fw-bold">Atrastā automašīna</h2>
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

        <div class="modal-body py-10 px-lg-10">
          <csddDetails />
        </div>
        <!--end::Modal body-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Modal } from "bootstrap";
import CsddDetails from "@/components/tecdoc/CsddDetails.vue";

export default defineComponent({
  name: "csdd-modal",
  components: { CsddDetails },
  setup() {
    const csddModalRef = ref();

    // Init modal
    const initModal = () => {
      const modalElement = csddModalRef.value;
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
      csddModalRef,
      show,
      hide,
    };
  },
});
</script>
