<template>
  <div
    class="modal fade"
    id="edit_settings"
    ref="editSettingsModalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <!--begin::Modal dialog-->
    <div class="modal-dialog modal-dialog-centered mw-650px">
      <!--begin::Modal content-->
      <div class="modal-content">
        <!--begin::Modal header-->
        <div class="modal-header" id="kt_modal_add_customer_header">
          <!--begin::Modal title-->
          <h2 class="fw-bold">{{ title }}</h2>
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
          <div class="modal-body py-10 px-lg-17">
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semobold mb-2">Nosaukums</label>
              <el-form-item prop="name">
                <el-input v-model="formData.name" type="text" placeholder="" />
              </el-form-item>
            </div>

            <template v-if="type === 'producer'">
              <div class="fv-row mb-2">
                <label class="fs-6 mb-2">E-veikala / TecDoc ražotājs</label>
                <SelectComponent
                  :options="producerTecDoc"
                  v-model="formData.tecdocid"
                  key-column="tecdoc_id"
                  label-column="name"
                  :clearable="true"
                />
              </div>

              <div class="d-flex flex-stack mb-8">
                <div class="me-5">
                  <label class="fs-6">Rādīt e-veikalā</label>
                </div>
                <label
                  class="form-check form-switch form-check-custom form-check-solid"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    value="1"
                    v-model="formData.enabled_in_web"
                  />
                </label>
                <!--end::Switch-->
              </div>

              <div class="d-flex flex-column align-items-center">
                <el-upload
                  accept="image/*"
                  class="avatar-uploader p-2"
                  :show-file-list="false"
                  :http-request="uploadImage()"
                  title="Ielādēt no faila"
                  v-tooltip
                >
                  <div class="avatar" v-if="formData.image">
                    <img :src="formData.image" />
                  </div>
                  <el-icon v-else class="avatar-uploader-icon"
                    ><Plus
                  /></el-icon>
                </el-upload>

                <div class="d-flex ps-2 pe-2">
                  <button
                    v-if="formData.imageid"
                    type="button"
                    @click="deleteImage()"
                    class="btn btn-sm btn-icon btn-light-danger me-1"
                    title="Dzēst"
                    v-tooltip
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                  <button
                    type="button"
                    @click="pasteImage()"
                    class="btn btn-sm btn-icon btn-light"
                    title="Ielīmēt"
                    v-tooltip
                  >
                    <i class="fa-solid fa-paste"></i>
                  </button>
                </div>
              </div>
            </template>

            <template v-if="type === 'group'">
              <div class="fv-row mb-2">
                <label class="fs-6 mb-2">Virsgrupa</label>
                <SelectComponent
                  :options="groups"
                  v-model="formData.parentid"
                  :clearable="true"
                />
              </div>

              <div class="d-flex flex-stack mb-8">
                <div class="me-5">
                  <label class="fs-6">Rādīt e-veikalā</label>

                  <div class="fs-7 fw-semobold text-gray-400">
                    Paslēpj šo un visas apakšgrupas e-veikala kokā
                  </div>
                </div>
                <label
                  class="form-check form-switch form-check-custom form-check-solid"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    value="1"
                    v-model="formData.upload_to_web"
                  />
                </label>
                <!--end::Switch-->
              </div>
              <!--end::Input group-->
            </template>
          </div>
          <!--end::Modal body-->

          <!--begin::Modal footer-->
          <div class="modal-footer flex-center">
            <button type="button" class="btn btn-light" @click="hide()">
              Aizvērt
            </button>

            <router-link
              class="btn btn-light-warning"
              v-if="formData.products > 0"
              @click="hide()"
              :to="{
                name: 'settings-product-editor',
                query: { [idField]: formData.id },
              }"
            >
              Labot produktus
            </router-link>

            <button
              type="button"
              class="btn btn-light-danger"
              @click="deleteItem()"
              v-if="
                formData.products == 0 && parseInt(formData.children ?? 0) == 0
              "
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
import { computed, defineComponent, ref } from "vue";
import SelectComponent from "@/components/core/form/SelectComponent.vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Plus } from "@element-plus/icons-vue";
import "@/assets/uploader.css";
import { Modal } from "bootstrap";
import type { FormInstance } from "element-plus";

export default defineComponent({
  name: "edit-settings-modal",
  components: { Plus, SelectComponent },
  props: {
    pData: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const formRef = ref<null | HTMLFormElement>(null);
    const editSettingsModalRef = ref();
    const loading = ref<boolean>(false);

    // Init modal
    const initModal = () => {
      loadData();
      const modalElement = editSettingsModalRef.value;
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

    // Set field
    const fields = {
      location: "locationid",
      group: "productgroupid",
      producer: "producerid",
    };

    const idField = computed(() => {
      return fields[type.value] ?? "";
    });

    const groups = ref([]);
    const producerTecDoc = ref([]);
    function loadData() {
      // Load TecDoc producers
      ApiService.get("producer", "tecdoc")
        .then((response) => {
          producerTecDoc.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from producerTecDoc:`, error);
          push.error(`Neizdevās ielādēt TecDoc ražotājus`);
        });

      // Load groups
      ApiService.get("group")
        .then((response) => {
          groups.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from groups:`, error);
          push.error(`Neizdevās ielādēt grupas`);
        });
    }

    // Setup data load
    const formData = computed(() => props.pData.settingData);
    const type = computed(() => props.pData.type);
    const title = computed(() => {
      if (formData.value.id) {
        return `Labot ${formData.value.name}`;
      } else {
        return `Jauns`;
      }
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
      formData,
      rules,
      formRef,
      loading,
      editSettingsModalRef,
      title,
      producerTecDoc,
      type,
      groups,
      show,
      hide,
      loadData,
      idField,
    };
  },

  methods: {
    submit() {
      if (!this.formData) {
        return;
      }

      (this.$refs.formRef as FormInstance).validate((valid: boolean) => {
        if (valid) {
          this.loading = true;
          ApiService.post(this.type + "/", this.formData)
            .then((response) => {
              this.loadData();
              push.success("Saglabāts");

              const id = response.data.id ?? null;
              this.$emit("refresh", id);

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
      ApiService.delete(this.type + "/", this.formData)
        .then(() => {
          push.success("Dzēsts");
          this.$emit("refresh");
          this.hide();
        })
        .catch(() => {
          push.error("Neizdevās dzēst");
        });
    },
    uploadImage() {
      return (upload) => {
        const data = new FormData();
        data.append("file", upload.file);
        data.append("id", this.formData.id);
        data.append("image_type", "producer");

        ApiService.post("image/", data)
          .then((response) => {
            this.formData.image = response.data.image_url;
            this.formData.imageid = response.data.id;
            push.success("Attēls saglabāts");
            if (this.formData.id) this.$emit("refresh");
          })
          .catch(() => {
            push.error("Neizdevās saglabāt attēlu");
          });
      };
    },
    pasteImage() {
      try {
        navigator.clipboard.read().then((items) => {
          let is_image = false;
          for (let item of items) {
            for (let type of item.types) {
              if (type.indexOf("image") === 0) {
                is_image = true;
                item.getType(type).then((blob) => {
                  console.log(blob);
                  this.uploadImage()({ file: blob });
                });
              }
            }
          }
          if (!is_image) {
            push.error("Nav attēls");
          }
        });
      } catch {
        push.error("Neizdevās nolasīt krātuvi");
      }
    },
    deleteImage() {
      ApiService.delete("image/", {
        id: this.formData.id,
        imageid: this.formData.imageid,
        image_type: "producer",
      })
        .then(() => {
          this.formData.image = null;
          this.formData.imageid = null;
          this.$emit("refresh");
          push.success("Attēls dzēsts");
        })
        .catch(() => {
          push.error("Neizdevās dzēst attēlu");
        });
    },
  },
});
</script>
