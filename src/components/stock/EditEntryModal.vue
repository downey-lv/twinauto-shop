<template>
  <div
    class="modal fade"
    id="edit_entry"
    ref="editEntryModalRef"
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
          <h2 class="fw-bold">Labot ierakstu</h2>
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
        <el-form @submit.prevent="submit()" :model="formData" ref="formRef" v-if="formData">
          <!--begin::Modal body-->
          <div class="modal-body py-10 px-lg-17">
            <div class="fv-row mb-7">
              <label class="fs-6 fw-semibold me-2">ID</label>
              <div>{{ formData.productidstr }}</div>
            </div>

            <div class="fv-row mb-7">
              <label class="fs-6 fw-semibold me-2">Prece</label>
              <div>{{ formData.producer }} {{ formData.productcode }}</div>
            </div>

            <div class="fv-row mb-7" v-if="formData.productname">
              <label class="fs-6 fw-semibold me-2">Nosaukums</label>
              <div v-html="formData.productname.replace(/\n/g, '<br/>')"></div>
            </div>

            <div class="fv-row mb-7">
              <label class="fs-6 fw-semibold mb-2">Daudzums</label>
              <el-form-item prop="quantity">
                <el-input-number
                  v-model="formData.quantity"
                  :step="1"
                  :min="1"
                  class="w-50"
                />
              </el-form-item>
            </div>
          </div>
          <!--end::Modal body-->

          <!--begin::Modal footer-->
          <div class="modal-footer flex-center">
            <button type="button" class="btn btn-light" @click="hide()">
              Aizvērt
            </button>

            <button
              type="button"
              class="btn btn-light-danger"
              @click="deleteItem()"
            >
              Dzēst
            </button>

            <!--begin::Button-->
            <button
              :data-kt-indicator="loading ? 'on' : null"
              class="btn btn-primary"
              type="submit"
            >
              <span v-if="!loading" class="indicator-label"> Saglabāt </span>
              <span v-if="loading" class="indicator-progress">
                Gaidu datus...
                <span
                  class="spinner-border spinner-border-sm align-middle ms-2"
                ></span>
              </span>
            </button>
            <!--end::Button-->
          </div>
          <!--end::Modal footer-->
        </el-form>
        <!--end::Form-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import SelectComponent from "@/components/core/form/SelectComponent.vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Plus } from "@element-plus/icons-vue";
import "@/assets/uploader.css";
import { Modal } from "bootstrap";
import type { StockEntry } from "@/types/Stock";

export default defineComponent({
  name: "edit-entry-modal",
  components: { Plus, SelectComponent },
  props: {
    entryId: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const formRef = ref<null | HTMLFormElement>(null);
    const editEntryModalRef = ref();
    const loading = ref<boolean>(false);

    // Init modal
    const initModal = () => {
      const modalElement = editEntryModalRef.value;
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

    const formData = ref<null | StockEntry>(null);
    function loadData(entryId) {
      if (!entryId) {
        hide();
        return;
      }

      loading.value = true;
      ApiService.get(`/stocktake/entry/${entryId}`)
        .then((response) => {
          formData.value = response.data;
        })
        .catch(() => {
          push.error("Neizdevās ielādēt datus");
          hide();
        })
        .finally(() => {
          loading.value = false;
        });
    }

    // Watch entryId change
    watch(
      () => props.entryId,
      (newVal) => {
        loadData(newVal);
      }
    );

    return {
      formData,
      formRef,
      loading,
      editEntryModalRef,
      show,
      hide,
      loadData,
    };
  },

  methods: {
    submit() {
      if (!this.formData) return;

      this.loading = true;
      ApiService.post(
        `/stocktake/entry/${this.formData.entry_id}`,
        this.formData
      )
        .then(() => {
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
    },
    deleteItem() {
      if (!this.formData) return;

      ApiService.delete(`/stocktake/entry/${this.formData.entry_id}`)
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
