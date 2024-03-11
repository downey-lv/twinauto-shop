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
              <el-form-item prop="amount" label="Cena">
                <el-input-number
                  v-model="formData.amount"
                  :step="1"
                  class="w-75"
                />
              </el-form-item>
              <el-form-item prop="quantity" label="Daudzums">
                <el-input-number
                  v-model="formData.quantity"
                  :step="1"
                  class="w-75"
                />
              </el-form-item>
              <el-form-item>
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
import { Plus } from "@element-plus/icons-vue";
import "@/assets/uploader.css";
import { Modal } from "bootstrap";
import type { FormInstance } from "element-plus";
import { removeTooltip } from "@/core/helpers/dom";

export default defineComponent({
  name: "cart-add-modal",
  components: { SelectComponent },
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const formRef = ref<null | HTMLFormElement>(null);
    const cartAddModalRef = ref();
    const loading = ref<boolean>(false);

    const blankForm = {
      amount: "",
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
      formData.value = { ...blankForm };
      console.log(props.product);
      formData.value.amount = props.product.priceSell;
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
    };
  },

  methods: {
    submit() {
      if (!this.formData || !this.formData.orderid) {
        return;
      }

      (this.$refs.formRef as FormInstance).validate((valid: boolean) => {
        if (valid) {
          this.loading = true;
          ApiService.post("payment/", this.formData)
            .then(() => {
              this.loadData();
              push.success("Saglabāts");
              this.$emit("refresh");
              this.hide();
            })
            .catch(() => {
              push.error("Neizdevās saglabāt");
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
