<template>
  <div
    class="modal fade"
    id="clientEdit"
    ref="clientEditModalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <!--begin::Modal dialog-->
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <!--begin::Modal content-->
      <div class="modal-content">
        <!--begin::Modal header-->
        <div class="modal-header">
          <!--begin::Modal title-->
          <h2 class="fw-bold">
            {{ companyId ? `Labot klientu` : `Jauns klients` }}
          </h2>
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
              <div class="row gx-10">
                <div class="col-lg">
                  <el-form-item label="Tips" prop="is_supplier">
                    <el-radio-group v-model="formData.is_supplier">
                      <el-radio-button :value="false">Pircējs</el-radio-button>
                      <el-radio-button :value="true"
                        >Piegādātājs</el-radio-button
                      >
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item prop="companyname" label="Nosaukums">
                    <el-input v-model="formData.companyname" />
                  </el-form-item>
                  <el-form-item prop="nmrno" label="Reģ. nr">
                    <el-input v-model="formData.nmrno" />
                  </el-form-item>
                  <el-form-item prop="pvnno" label="PVN nr.">
                    <el-input v-model="formData.pvnno" @change="invalidateVAT">
                      <template #append>
                        <el-button @click="searchVAT"
                          ><i class="fa-solid fa-magnifying-glass"></i
                        ></el-button>
                      </template>
                    </el-input>
                    <div
                      class="fs-7 fw-semibold text-muted"
                      v-html="vatComment"
                    ></div>
                  </el-form-item>

                  <div class="separator separator-dashed my-6"></div>

                  <el-form-item prop="address" label="Adrese">
                    <el-input
                      v-model="formData.address"
                      type="textarea"
                      :autosize="{ minRows: 2 }"
                    />
                  </el-form-item>
                  <SelectComponent
                    :model-value="formData.country"
                    :options="countries"
                    prop="country"
                    label="Valsts"
                  />
                  <el-form-item prop="account" label="Bankas konts">
                    <el-input v-model="formData.account" />
                  </el-form-item>
                </div>
                <div class="col-lg">
                  <el-form-item prop="person" label="Kontaktpersona">
                    <el-input v-model="formData.person" />
                  </el-form-item>
                  <el-form-item prop="telno" label="Telefons">
                    <el-input v-model="formData.telno" />
                  </el-form-item>
                  <el-form-item prop="email" label="E-pasts">
                    <el-input v-model="formData.email" />
                  </el-form-item>

                  <div class="separator separator-dashed my-6"></div>

                  <el-form-item prop="comment" label="Komentārs">
                    <el-input
                      v-model="formData.comment"
                      type="textarea"
                      :autosize="{ minRows: 2 }"
                    />
                  </el-form-item>

                  <div class="separator separator-dashed my-6"></div>

                  <el-form-item
                    prop="default_payterm"
                    label="Apmaksas termiņš, dienas"
                    label-width="200px"
                  >
                    <el-input-number v-model="formData.default_payterm" />
                  </el-form-item>

                  <el-form-item
                    prop="credit"
                    label="Kredītlimits, €"
                    label-width="200px"
                  >
                    <el-input-number
                      v-model="formData.credit"
                      :controls="false"
                    />
                  </el-form-item>
                </div>
              </div>
            </el-form>
          </div>
          <!--end::Modal body-->
          <div class="modal-footer flex-center">
            <el-form-item>
              <el-button type="primary" @click="submit">Saglabāt</el-button>
              <el-button @click="hide()">Atcelt</el-button>
            </el-form-item>
          </div>
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
import { Modal } from "bootstrap";
import type { FormInstance } from "element-plus";
import type { Client } from "@/types/Client";

export default defineComponent({
  name: "payment-modal",
  components: { SelectComponent },
  props: {
    companyId: {
      type: String,
      required: false,
    },
    noRedirect: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const formRef = ref<null | HTMLFormElement>(null);
    const clientEditModalRef = ref();
    const loading = ref<boolean>(false);
    const vatComment = ref<string>("");

    const blankForm: Client = {
      companyid: "",
      companyname: "",
      address: "",
      person: "",
      telno: "",
      email: "",
      pvnno: "",
      nmrno: "",
      account: "",
      comment: "",
      country: "LV",
      default_payterm: 10,
      vat_validated: null,
      vat_excluded: false,
      is_supplier: false,
      credit: null,
    };
    const formData = ref({ ...blankForm });

    // Init modal
    const initModal = () => {
      const modalElement = clientEditModalRef.value;
      modal = new Modal(modalElement);
      loadHelpers();
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

    const countries = ref([]);
    function loadHelpers() {
      // Load countries
      ApiService.get("data", "countries")
        .then((response) => {
          countries.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching countries:`, error);
          push.error(`Neizdevās ielādēt valstis`);
        })
        .finally(() => {
          loading.value = false;
        });
    }

    function loadData() {
      vatComment.value = "";
      formData.value = { ...blankForm };

      if (!props.companyId) {
        return;
      }

      loading.value = true;
      // Load company
      ApiService.get("company", props.companyId)
        .then((response) => {
          formData.value = response.data[0];

          if (formData.value.vat_validated) {
            const valid = String(formData.value.vat_validated).split("T")[0];
            vatComment.value = `<span class='text-success'>Derīgs</span> ${valid}`;
          } else if (formData.value.pvnno) {
            invalidateVAT();
          } else {
            vatComment.value = "Nav norādīts";
          }
        })
        .catch((error) => {
          console.error(`Error fetching data from company:`, error);
          push.error(`Neizdevās ielādēt datus`);
        })
        .finally(() => {
          loading.value = false;
        });
    }

    // Setup data load
    const idWatcher = watch(
      () => props.companyId,
      (newVal) => {
        if (newVal) loadData();
      }
    );

    onBeforeUnmount(() => {
      idWatcher();
    });

    const rules = ref({
      companyname: [
        {
          required: true,
          message: "Jānorāda nosaukums",
          trigger: "change",
        },
      ],
      is_supplier: [
        {
          required: true,
          message: "Jānorāda tips",
          trigger: "change",
        },
      ],
    });

    // Remove VAT values
    function invalidateVAT() {
      formData.value.vat_validated = null;
      formData.value.vat_excluded = false;
      vatComment.value = "<span class='text-warning'>Nav pārbaudīts</span>";
    }

    return {
      rules,
      formRef,
      loading,
      clientEditModalRef,
      show,
      hide,
      loadData,
      formData,
      countries,
      vatComment,
      invalidateVAT,
    };
  },

  methods: {
    submit() {
      (this.$refs.formRef as FormInstance).validate((valid: boolean) => {
        if (valid) {
          this.loading = true;
          ApiService.post("company/", this.formData)
            .then((response) => {
              this.loadData();
              push.success("Saglabāts");
              this.hide();

              if (this.noRedirect || this.companyId) {
                // Emit refresh for current company
                this.$emit("refresh", response.data.companyId);
              } else {
                // Redirect to new company
                this.$router.push({
                  name: "client-view",
                  params: { clientId: response.data.companyId },
                });
              }
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
    searchVAT() {
      if (!this.formData.pvnno) {
        return;
      }

      this.loading = true;
      this.vatComment = "Gaidu datus...";

      ApiService.get("api/vat", this.formData.pvnno)
        .then((response) => {
          const data = response.data;

          if (data.isValid) {
            this.vatComment = "<span class='text-success'>Derīgs</span>";
            this.formData.vat_validated = data.requestDate;
            this.formData.country = data.country;

            if (data.address) this.formData.address = data.address;
            if (data.name) this.formData.companyname = data.name;

            if (data.country === "LV") {
              this.formData.vat_excluded = false;
              this.formData.nmrno = data.originalVatNumber;
            } else {
              this.formData.vat_excluded = true;
            }
          } else {
            this.vatComment = "<span class='text-danger'>Nav atrasts</span>";
            this.formData.vat_validated = null;
            this.formData.vat_excluded = false;
          }
        })
        .catch((error) => {
          console.error(`Error fetching VAT data:`, error);
          push.error(`Neizdevās atrast PVN numuru`);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
});
</script>
