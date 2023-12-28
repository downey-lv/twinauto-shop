<template>
  <div
    class="modal fade"
    id="payments"
    ref="paymentsModalRef"
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
          <h2 class="fw-bold">Maksājumi</h2>
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
            <el-table :data="payments" style="width: 100%">
              <el-table-column label="Datums">
                <template #default="scope">
                  <span>{{
                    String(scope.row.payment_date).split("T")[0]
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column property="recipient_name" label="Saņēmējs" />
              <el-table-column property="payment_type" label="Veids" />
              <el-table-column property="amount" label="Summa" />
              <el-table-column label="">
                <template #default="scope">
                  <span v-if="scope.row.from_vide">
                    <span class="badge badge-dark">VIDe</span>
                  </span>
                  <el-popconfirm
                    v-else
                    confirm-button-text="Jā"
                    cancel-button-text="Nē"
                    :title="`Vai dzēst?`"
                    @confirm="deleteItem(scope.row.payment_id)"
                  >
                    <template #reference>
                      <button
                        type="button"
                        class="btn btn-sm btn-icon btn-light-danger me-1"
                        title="Dzēst"
                        v-tooltip
                      >
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>

            <div class="separator separator-dashed my-6"></div>
            <h4 class="mb-5">Pievienot maksājumu</h4>
            <el-form
              @submit.prevent="submit()"
              :model="formData"
              :rules="rules"
              @keydown.enter.prevent
              ref="formRef"
              label-width="120px"
            >
              <el-form-item prop="amount" label="Maksājums, €">
                <el-input-number
                  v-model="formData.amount"
                  :step="0.01"
                  class="w-75"
                />
              </el-form-item>
              <el-form-item prop="amount" label="Apmaksas veids">
                <SelectComponent
                  :options="paymentTypes"
                  v-model="formData.type"
                  prop="type"
                  class="w-75"
                />
              </el-form-item>
              <el-form-item prop="amount" label="Darba vieta">
                <SelectComponent
                  :options="paymentRecipients"
                  v-model="formData.recipient"
                  prop="recipient"
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
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import SelectComponent from "@/components/core/form/SelectComponent.vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Plus } from "@element-plus/icons-vue";
import "@/assets/uploader.css";
import { Modal } from "bootstrap";
import type { FormInstance } from "element-plus";
import { removeTooltip } from "@/core/helpers/dom";

export default defineComponent({
  name: "payment-modal",
  components: { SelectComponent },
  props: {
    pData: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const formRef = ref<null | HTMLFormElement>(null);
    const paymentsModalRef = ref();
    const loading = ref<boolean>(false);
    const paymentTypes = ref<any>([]);
    const paymentRecipients = ref<any>([]);

    const blankForm = {
      amount: "",
      type: "",
      recipient: "",
      orderid: "",
    };
    const formData = ref({ ...blankForm });

    // Init modal
    const initModal = () => {
      loadHelpers();
      const modalElement = paymentsModalRef.value;
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

    const payments = ref([]);
    function loadData() {
      formData.value = { ...blankForm };

      // Load payments
      ApiService.get("payment", props.pData.orderid)
        .then((response) => {
          payments.value = response.data;
          formData.value.orderid = props.pData.orderid;
        })
        .catch((error) => {
          console.error(`Error fetching data from payments:`, error);
          push.error(`Neizdevās ielādēt maksājumus`);
        });

      // Load balance
      ApiService.get("payment/balance", props.pData.orderid)
        .then((response) => {
          formData.value.amount = response.data[0]?.balance_due ?? 0;
        })
        .catch((error) => {
          console.error(`Error fetching data from balance:`, error);
          push.error(`Neizdevās ielādēt atlikumu`);
        });
    }

    function loadHelpers() {
      // Load types
      ApiService.get("payment", "types")
        .then((response) => {
          paymentTypes.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from types:`, error);
          push.error(`Neizdevās maksājumu veidus`);
        });

      // Load recipients
      ApiService.get("payment", "recipients")
        .then((response) => {
          paymentRecipients.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from recipients:`, error);
          push.error(`Neizdevās maksājumu veidus`);
        });
    }

    // Setup data load
    const idWatcher = watch(
      () => props.pData.orderid,
      (newVal) => {
        if (newVal) loadData();
      }
    );

    onBeforeUnmount(() => {
      idWatcher();
    });

    const rules = ref({
      type: [
        {
          required: true,
          message: "",
          trigger: "change",
        },
      ],
      recipient: [
        {
          required: true,
          message: "",
          trigger: "change",
        },
      ],
    });

    return {
      payments,
      rules,
      formRef,
      loading,
      paymentsModalRef,
      show,
      hide,
      loadData,
      formData,
      paymentTypes,
      paymentRecipients,
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
    deleteItem(paymentId) {
      ApiService.delete(`payment/${paymentId}`)
        .then(() => {
          push.success("Dzēsts");
          removeTooltip();
          this.loadData();
          this.$emit("refresh");
        })
        .catch(() => {
          push.error("Neizdevās dzēst");
        });
    },
  },
});
</script>
