<template>
  <div
    class="modal fade"
    id="issue"
    ref="issueModalRef"
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
          <h2 class="fw-bold">Paziņot par problēmu</h2>
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
          ref="formRef"
        >
          <!--begin::Modal body-->
          <div class="modal-body py-10 px-lg-10" v-loading="loading">
            <h3>ID: {{ productId }}</h3>
            <div class="d-flex flex-column mb-8">
              <label class="fs-6 fw-semobold mb-2">Problēmas apraksts</label>

              <el-form-item prop="description">
                <el-input
                  v-model="formData.description"
                  type="textarea"
                  rows="3"
                />
              </el-form-item>
            </div>
            <el-form-item>
              <el-button type="primary" @click="submit">Pievienot</el-button>
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
import { defineComponent, ref } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Modal } from "bootstrap";
import type { FormInstance } from "element-plus";

export default defineComponent({
  name: "issue-modal",
  props: {
    productId: {
      type: String,
      required: true,
    },
  },
  setup() {
    const formRef = ref<null | HTMLFormElement>(null);
    const issueModalRef = ref();
    const loading = ref(false);

    const formData = ref({
      description: "",
    });

    // Init modal
    const initModal = () => {
      const modalElement = issueModalRef.value;
      modal = new Modal(modalElement);
    };

    // Show modal
    let modal;
    const show = () => {
      if (!modal) {
        initModal();
      }
      formData.value.description = "";
      modal.show();
    };

    // Hide modal
    const hide = () => {
      if (modal) {
        modal.hide();
      }
    };

    const rules = ref({
      description: [
        {
          required: true,
          message: "Jāaizpilda apraksts",
          trigger: "blur",
        },
      ],
    });

    return {
      rules,
      formRef,
      issueModalRef,
      show,
      hide,
      formData,
      loading,
    };
  },

  methods: {
    submit() {
      (this.$refs.formRef as FormInstance).validate((valid: boolean) => {
        console.log(valid);
        if (valid) {
          this.loading = true;
          ApiService.post("product/issue", {
            description: this.formData.description,
            id: this.productId,
          })
            .then(() => {
              push.success("Saglabāts");
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
