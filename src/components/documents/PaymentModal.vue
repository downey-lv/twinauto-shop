<template>
  <div
    class="modal fade"
    id="payments"
    ref="paymentsModalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <!--begin::Modal dialog-->
    <div class="modal-dialog modal-dialog-centered mw-650px">
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
          <div class="modal-body py-10 px-lg-17">
            <el-table :data="payments" style="width: 100%">
              <el-table-column label="Datums">
                <template #default="scope">
                  <span>{{
                    String(scope.row.payment_date).split("T")[0]
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column property="payment_type" label="Apmaksas veids" />
              <el-table-column property="amount" label="Summa" />
              <el-table-column label="">
                <template #default="scope">
                  <span v-if="scope.row.from_vide">
                    <span class="badge badge-dark">VIDe</span>
                  </span>
                  <span v-else> DELETE BUTTON </span>
                </template>
              </el-table-column>
            </el-table>
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

export default defineComponent({
  name: "payment-modal",
  components: { Plus, SelectComponent },
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

    // Init modal
    const initModal = () => {
      loadData();
      const modalElement = paymentsModalRef.value;
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

    const payments = ref([]);
    function loadData() {
      // Load TecDoc producers
      ApiService.get("payment", props.pData.orderid)
        .then((response) => {
          payments.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from payments:`, error);
          push.error(`Neizdevās ielādēt maksājumus`);
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
      name: [
        {
          required: true,
          message: "Jānorāda nosaukums",
          trigger: "blur",
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
    };
  },

  methods: {
    submit() {
      if (!this.formData) {
        return;
      }

      (this.$refs.formRef as any).validate((valid: boolean) => {
        if (valid) {
          this.loading = true;
          ApiService.post(this.type + "/", this.formData)
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
    deleteItem() {
      ApiService.delete("payment/", this.formData)
        .then(() => {
          push.success("Dzēsts");
          this.$emit("refresh");
          this.hide();
        })
        .catch(() => {
          push.error("Neizdevās dzēst");
        });
    },
  },
});
</script>
