<template>
  <div
    class="modal fade"
    id="cartSell"
    ref="cartSellModalRef"
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
          <h2 class="fw-bold">Pārdot grozu</h2>
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
          @openDocument.prevent="openDocument()"
          :model="formData"
          :rules="rules"
          @keydown.enter.prevent
          ref="formRef"
          label-width="120px"
        >
          <!--begin::Modal body-->
          <div class="modal-body py-10 px-lg-10">
            <div class="mb-5">
              <CartView :cart-id="cartId" />
            </div>
            <el-form-item>
              <el-radio-group v-model="formData.existingDocument">
                <el-radio :value="false" size="large" border
                  >Jauns dokuments</el-radio
                >
                <el-radio :value="true" size="large" border
                  >Esošs dokuments</el-radio
                >
              </el-radio-group>
            </el-form-item>
            <div v-if="formData.existingDocument" v-loading="loading">
              <SelectComponent
                label="Klients"
                :options="companies"
                v-model="formData.companyId"
                prop="companyId"
              />
              <SelectComponent
                label="Dokuments"
                :options="documents"
                v-model="formData.documentId"
                prop="documentId"
              />
            </div>
          </div>
          <div class="modal-footer flex-center">
            <el-form-item>
              <el-button type="success" @click="openDocument()"
                >Pārdot</el-button
              >
              <el-button @click="hide()">Atcelt</el-button>
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
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import SelectComponent from "@/components/core/form/SelectComponent.vue";
import ApiService from "@/core/services/ApiService";
import "@/assets/uploader.css";
import { Modal } from "bootstrap";
import type { FormInstance } from "element-plus";
import type { Company } from "@/types/Document";
import type { CartDocument } from "@/types/Cart";
import CartView from "@/components/cart/CartView.vue";

export default defineComponent({
  name: "cart-sell-modal",
  components: { CartView, SelectComponent },
  props: {
    cartId: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const formRef = ref<null | HTMLFormElement>(null);
    const cartSellModalRef = ref();
    const loading = ref<boolean>(false);

    const blankForm = {
      existingDocument: false,
      companyId: null,
      documentId: null,
    };
    const formData = ref({ ...blankForm });

    const initModal = () => {
      const modalElement = cartSellModalRef.value;
      modal = new Modal(modalElement);
    };

    // Show modal
    let modal;
    const show = () => {
      if (!modal) {
        initModal();
      }
      formData.value = { ...blankForm };
      loadCompanies();
      modal.show();
    };

    // Hide modal
    const hide = () => {
      if (modal) {
        modal.hide();
      }
    };

    const documents = ref([]);
    const documentsObj = ref<CartDocument[]>([]);
    const companies = ref<Company[]>([]);
    function loadCompanies() {
      documents.value = [];
      loading.value = true;
      ApiService.get("company")
        .then((response) => {
          companies.value = response.data;
        })
        .catch((error) => {
          console.error("Error fetching companies:", error);
        })
        .finally(() => {
          loading.value = false;
        });
    }

    function loadDocuments() {
      documents.value = [];
      documentsObj.value = [];

      if (!formData.value.companyId) return;

      loading.value = true;
      ApiService.get("cart", `documents/${formData.value.companyId}`)
        .then((response) => {
          const data = response.data;
          documents.value = data.dropdownData;
          documentsObj.value = data.orders;
        })
        .catch((error) => {
          console.error("Error fetching documents:", error);
        })
        .finally(() => {
          loading.value = false;
        });
    }

    const cWatcher = watch(
      () => formData.value.companyId,
      (newVal) => {
        if (newVal) loadDocuments();
      }
    );

    onBeforeUnmount(() => {
      cWatcher();
    });

    const rules = ref({
      companyId: [
        {
          required: true,
          message: "",
          trigger: "change",
        },
      ],
      documentId: [
        {
          required: true,
          message: "",
          trigger: "change",
        },
      ],
    });

    return {
      formData,
      companies,
      documents,
      documentsObj,
      rules,
      formRef,
      loading,
      cartSellModalRef,
      show,
      hide,
    };
  },

  methods: {
    openDocument() {
      (this.$refs.formRef as FormInstance).validate((valid: boolean) => {
        if (valid) {
          this.hide();
          if (this.formData.existingDocument) {
            if (!this.formData.documentId) return;
            // Route to existing document
            const document = this.documentsObj[this.formData.documentId];
            this.$router.push({
              name: "document-edit",
              params: {
                editId: this.formData.documentId,
                type: document.grouping,
              },
              query: {
                cart: this.cartId,
              },
            });
          } else {
            // Route to new document
            this.$router.push({
              name: "document-edit",
              params: { editId: "new", type: "daily" },
              query: {
                cart: this.cartId,
              },
            });
          }
        } else {
          return false;
        }
      });
    },
  },
});
</script>
