<template>
  <el-form
    @submit.prevent="submit()"
    :model="product"
    :rules="rules"
    ref="formRef"
    class="form"
  >
    <div class="row g-5" v-loading="loading.product">
      <div class="col-lg-4">
        <!-- Core details -->
        <div class="card mb-5">
          <div class="card-header border-0 pt-5">
            <h3 class="card-title">ID: {{ product.productidstr }}</h3>
            <div class="card-toolbar">
              <a
                @click="loadProduct(null, false)"
                class="btn btn-sm btn-light-danger me-3"
                v-if="!productMatches"
              >
                Atcelt izmaiņas
              </a>
              <a v-else @click="closeProduct" class="btn btn-sm btn-light me-3">
                Aizvērt
              </a>

              <button
                :data-kt-indicator="loading.product ? 'on' : null"
                class="btn btn-sm btn-primary"
                type="submit"
              >
                <span v-if="!loading.product" class="indicator-label">
                  Saglabāt
                </span>
                <span v-if="loading.product" class="indicator-progress">
                  Gaidu datus...
                  <span
                    class="spinner-border spinner-border-sm align-middle ms-2"
                  ></span>
                </span>
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="fv-row mb-2">
              <label class="required fs-6 mb-2">Kods</label>
              <el-form-item prop="productcode">
                <el-input
                  v-model="product.productcode"
                  @change="loadTecDoc()"
                ></el-input>
              </el-form-item>
            </div>

            <div class="fv-row mb-2" v-loading="loading.producers">
              <label class="required fs-6 mb-2">Ražotājs</label>
              <SelectComponent
                :options="producers"
                v-model="product.producerid"
                prop="producerid"
                @change="loadTecDoc()"
              />
            </div>

            <div class="fv-row mb-2" v-loading="loading.tecdoc">
              <label class="fs-6 mb-2">
                <span class="required">Nosaukums</span>
                <i
                  class="fa-solid fa-globe ms-2 text-info"
                  title="Redzams e-veikalā"
                  v-tooltip
                ></i>
              </label>
              <el-form-item prop="productname">
                <el-input
                  v-model="product.productname"
                  type="textarea"
                  rows="2"
                />
                <div>
                  <template v-for="(item, idx) in nameSuggestions" :key="idx">
                    <div class="fs-7 fw-semibold text-muted text-info">
                      <a
                        href="#"
                        @click.prevent="
                          product.productname = item;
                          nameSuggestions = [];
                        "
                        >{{ item }}</a
                      >
                    </div>
                  </template>
                </div>
              </el-form-item>
            </div>
          </div>
        </div>
        <!-- Product settings -->
        <div class="card mb-5">
          <div class="card-body">
            <div
              class="fv-row mb-2"
              v-loading="loading.groups || loading.tecdoc"
            >
              <label class="required fs-6 mb-2">Grupa</label>
              <SelectComponent
                :options="groups"
                v-model="product.productgroupid"
                prop="productgroupid"
              >
                <template #comment>
                  <a href="#" @click.prevent="newGroup()">Jauns</a>
                </template>
              </SelectComponent>
              <template v-for="(name, id) in groupSuggestions" :key="id">
                <div class="fs-7 fw-semibold text-muted text-info">
                  <a
                    href="#"
                    @click.prevent="
                      product.productgroupid = String(id);
                      groupSuggestions = [];
                    "
                    >{{ name }}</a
                  >
                </div>
              </template>
            </div>

            <div
              class="fv-row mb-2"
              v-loading="loading.locations || loading.tecdoc"
            >
              <label class="fs-6 mb-2">Novietnes</label>
              <SelectComponent
                :options="locations"
                v-model="product.location_list"
                :multiple="true"
                :multipleLimit="2"
                prop="location_list"
              />
              <template v-for="(id, name) in locationSuggestions" :key="name">
                <div class="fs-7 fw-semibold text-muted text-info">
                  <a
                    href="#"
                    @click.prevent="
                      product.location_list = id;
                      locationSuggestions = [];
                    "
                    >{{ name }}</a
                  >
                </div>
              </template>
            </div>
          </div>
        </div>
        <!-- Product parameters -->
        <div class="card mb-5">
          <div class="card-body">
            <div class="fv-row mb-2">
              <label class="fs-6 mb-2">EAN svītrukods</label>
              <el-form-item prop="ean">
                <el-input
                  v-model="product.ean"
                  @keydown.enter.prevent="loadTecDoc(true)"
                  maxlength="20"
                  show-word-limit
                />
                <div class="fs-7 fw-semibold text-muted">
                  Lai meklētu, ievadi EAN svītrkodu un nospied Enter
                </div>
              </el-form-item>
            </div>

            <div class="fv-row mb-2">
              <label class="fs-6 mb-2">
                Izmērs
                <i
                  class="fa-solid fa-globe ms-2 text-info"
                  title="Redzams e-veikalā"
                  v-tooltip
                ></i>
              </label>
              <el-form-item prop="dimensions">
                <el-input v-model="product.dimensions" />
              </el-form-item>
            </div>

            <div class="row" v-loading="loading.tecdoc">
              <div class="col-lg-6">
                <div class="fv-row mb-2">
                  <label class="fs-6 mb-2">Daudzums</label>
                  <el-form-item prop="volume">
                    <el-input-number
                      v-model="product.volume"
                      :min="0"
                      :step="0.001"
                    ></el-input-number>
                  </el-form-item>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="fv-row mb-2" v-loading="loading.units">
                  <label class="fs-6 mb-2">Vienība</label>
                  <SelectComponent
                    :options="units"
                    v-model="product.unitid"
                    prop="unitid"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Product flags -->
        <div class="card">
          <div class="card-body">
            <div class="d-flex flex-row">
              <div
                class="form-check form-switch form-check-custom form-check-solid"
              >
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="product.important"
                />
                <label class="form-check-label"> Svarīgs produkts </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Additional details -->
      <div class="col-lg">
        <div class="row mb-5">
          <div class="col-lg">
            <div class="card h-100">
              <div class="card-body">
                <div class="fv-row mb-2">
                  <label class="fs-6 mb-2">Komentārs</label>
                  <el-form-item prop="comment">
                    <el-input
                      v-model="product.comment"
                      type="textarea"
                      rows="2"
                      maxlength="300"
                      show-word-limit
                    />
                  </el-form-item>
                </div>

                <div class="fv-row mb-2">
                  <label class="fs-6 mb-2">Piegādātāju kodi</label>
                  <el-form-item prop="suppliercode">
                    <el-input
                      v-model="product.suppliercode"
                      type="textarea"
                      maxlength="100"
                      show-word-limit
                      rows="2"
                    />
                    <div class="fs-7 fw-semibold text-muted">
                      Jānorāda tikai tiem, kas nav e-veikalā
                    </div>
                  </el-form-item>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg">
            <div class="card">
              <div class="card-body">
                <div class="fv-row mb-2">
                  <label class="fs-6 mb-2">Paziņojums</label>
                  <el-form-item prop="message">
                    <el-input
                      v-model="product.message"
                      type="textarea"
                      rows="2"
                    />
                  </el-form-item>
                </div>

                <div class="fv-row mb-2">
                  <label class="fs-6 mb-2">Cita informācija</label>
                  <el-form-item prop="boldcomment">
                    <el-input
                      v-model="product.boldcomment"
                      type="textarea"
                      rows="2"
                    />
                  </el-form-item>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Analogues and codes -->
        <div class="row mb-5">
          <div class="col-lg-3">
            <div class="card h-100">
              <div class="card-body">
                <Notice
                  classes="rounded-3 mb-3"
                  color="warning"
                  body="Nav TecDoc prece"
                  v-if="tecdoc_warning"
                  icon="fa fa-solid fa-exclamation-triangle"
                ></Notice>
                <label class="fs-5 mb-2">TecDoc analogs</label>
                <div class="fv-row mb-2">
                  <label class="fs-6 mb-2">Kods</label>
                  <el-form-item>
                    <el-input
                      v-model="product.td_code"
                      @change="loadTecDoc(false, true)"
                    ></el-input>
                  </el-form-item>
                </div>

                <div class="fv-row mb-2" v-loading="loading.producers">
                  <label class="fs-6 mb-2">Ražotājs</label>
                  <SelectComponent
                    :options="producersTecdoc"
                    v-model="product.td_producer"
                    prop="producerid"
                    key-column="brandId"
                    label-column="brandName"
                    @change="loadTecDoc(false, true)"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-lg">
                    <div class="fv-row mb-2" v-loading="loading.tecdoc">
                      <label class="fs-6 mb-2">Analogi</label>
                      <el-form-item prop="analogi">
                        <el-input
                          v-model="product.analogi"
                          type="textarea"
                          rows="10"
                        />
                      </el-form-item>
                    </div>
                  </div>
                  <div class="col-lg">
                    <div class="fv-row mb-2" v-loading="loading.tecdoc">
                      <label class="fs-6 mb-2">OE kodi</label>
                      <el-form-item prop="oecode">
                        <el-input
                          v-model="product.oecode"
                          type="textarea"
                          rows="10"
                        />
                      </el-form-item>
                    </div>
                  </div>
                  <div class="col-lg">
                    <div class="fv-row mb-2">
                      <label class="fs-6 mb-2">
                        Specifikācija
                        <i
                          class="fa-solid fa-globe ms-2 text-info"
                          title="Redzams e-veikalā"
                          v-tooltip
                        ></i>
                      </label>
                      <quill-editor
                        theme="snow"
                        v-model:content="product.description"
                        contentType="html"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Photos -->
        <div class="card mb-5">
          <div class="card-body">
            <div class="d-lg-flex flex-row justify-content-center">
              <div v-for="index in 3" :key="index">
                <el-image
                  :src="product.images[index - 1]"
                  :ref="`imageViewer_${index - 1}`"
                  :initial-index="index - 1"
                  :preview-src-list="product.images"
                  :hide-on-click-modal="true"
                >
                </el-image>
                <div>
                  <a
                    href="#"
                    v-if="index > 1"
                    @click.prevent="moveImage(index)"
                  >
                    <i class="fa-solid fa-left fa-fw"></i>
                  </a>
                  <a
                    href="#"
                    v-if="index < 3"
                    @click.prevent="moveImage(index, false)"
                  >
                    <i class="fa-solid fa-right fa-fw"></i>
                  </a>
                </div>
                <el-upload
                  accept="image/*"
                  class="avatar-uploader p-2"
                  :show-file-list="false"
                  :http-request="uploadImage(index)"
                  title="Ielādēt no faila"
                  v-tooltip
                >
                  <div class="avatar" v-if="product.images[index - 1]">
                    <img :src="product.images[index - 1]" />
                  </div>
                  <el-icon v-else class="avatar-uploader-icon"
                    ><Plus
                  /></el-icon>
                </el-upload>
                <div
                  class="d-flex align-items-center justify-content-end ps-2 pe-2"
                >
                  <div class="flex-fill">
                    <label
                      class="form-check form-switch form-check-custom form-check-solid form-switch-sm"
                    >
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :name="`imagesweb[${index}]`"
                        v-model="product.imagesweb[index - 1]"
                      />
                      <span class="form-check-label">
                        <i
                          class="fa-solid fa-globe ms-2 text-info"
                          title="Redzams e-veikalā"
                          v-tooltip
                        ></i>
                      </span>
                    </label>
                  </div>
                  <button
                    v-if="product.images[index - 1]"
                    type="button"
                    @click="openImage(index - 1)"
                    class="btn btn-sm btn-icon btn-light me-1"
                    title="Atvērt"
                    v-tooltip
                  >
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  <button
                    v-if="product.image_ids[index - 1]"
                    type="button"
                    @click="deleteImage(index)"
                    class="btn btn-sm btn-icon btn-light-danger me-1"
                    title="Dzēst"
                    v-tooltip
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                  <button
                    type="button"
                    @click="pasteImage(index)"
                    class="btn btn-sm btn-icon btn-light"
                    title="Ielīmēt"
                    v-tooltip
                  >
                    <i class="fa-solid fa-paste"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-form>
  <EditSettingsModal
    ref="groupModal"
    :pData="blankGroupData"
    @refresh="refreshGroup"
  />
</template>

<style scoped>
.el-image {
  width: 0;
  height: 0;
}
</style>
<style>
.ql-editor {
  color: var(--el-text-color-regular);
}
.ql-editor p {
  padding-top: 5px;
}
</style>

<script lang="ts">
import type { WatchStopHandle } from "vue";
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import ApiService from "@/core/services/ApiService";
import SelectComponent from "@/components/core/form/SelectComponent.vue";
import { Plus } from "@element-plus/icons-vue";
import { push } from "@/main";
import { useWindowStore } from "@/stores/activewindows";
import { useRoute } from "vue-router";
import Notice from "@/components/core/Notice.vue";
import { isEqual } from "lodash";
import "@/assets/uploader.css";
import type { FormInstance } from "element-plus";
import { QuillEditor } from "@vueup/vue-quill";
import EditSettingsModal from "@/components/settings/EditSettingsModal.vue";

export default defineComponent({
  name: "product-edit",
  components: {
    EditSettingsModal,
    Notice,
    SelectComponent,
    Plus,
    QuillEditor,
  },
  setup() {
    const loading = ref({
      product: false,
      groups: false,
      producers: false,
      units: false,
      locations: false,
      tecdoc: false,
    });
    const tecdoc_warning = ref(false);

    const groups = ref();
    const producers = ref();
    const producersTecdoc = ref();
    const units = ref();
    const locations = ref();
    const is_new = ref(true);
    const nameSuggestions = ref([]);
    const groupSuggestions = ref([]);
    const locationSuggestions = ref([]);
    const formRef = ref<FormInstance>();

    const blankGroup = {
      type: `group`,
      settingData: {
        id: ``,
        name: ``,
        tecdoc_name: ``,
        image: ``,
        parentid: ``,
        upload_to_web: true,
      },
    };
    const blankGroupData = ref({ ...blankGroup });

    const defaultProduct = {
      productid: "",
      productidstr: "Jauns",
      productcode: "",
      productname: "",
      producerid: "",
      productgroupid: "",
      comment: "",
      dimensions: "",
      volume: 1,
      ean: "",
      unitid: "1",
      description: "",
      boldcomment: "",
      oecode: "",
      analogi: "",
      suppliercode: "",
      message: "",
      location_list: [],
      images: [] as string[],
      imagesweb: [] as boolean[],
      image_ids: [] as string[],
      crosses: [] as any[],
      important: false,
      td_code: "",
      td_producer: "",
    };
    const product = ref({ ...defaultProduct });
    let originalProduct;
    const productMatches = ref(true);
    const watcherHandles: WatchStopHandle[] = [];

    const route = useRoute();

    function setProduct(productData, use_store) {
      // Set original value
      originalProduct = { ...productData };

      // Grab data from store
      if (use_store) {
        const windowStore = useWindowStore();
        const window = windowStore.getWindow(route.path);
        if (window) {
          productData = window.data;
        }
      }

      // Set product value
      product.value = { ...productData };

      checkOriginal();
    }

    function checkOriginal() {
      productMatches.value = isEqual(product.value, originalProduct);

      // Re-validate form
      if (formRef.value) formRef.value.validate();
    }

    async function loadProduct(id: null | string = null, use_store = true) {
      if (!id) {
        id = route.params.id as string;
      }

      is_new.value = id === "new";

      // Set if copying
      let is_copy = false;
      if (route.query.copy) {
        is_copy = true;
        id = route.query.copy as string;
      }

      // Disable store for copy
      if (is_copy) {
        use_store = false;
      }

      // Stop loading if new product and set to default
      if (!is_copy && is_new.value) {
        const product = { ...defaultProduct };

        // If creating from purchase document, add values
        if (route.query.purchase) {
          let producer = route.query.producerid as string;
          if (producer === "") producer = route.query.producer as string;

          product.producerid = producer;
          product.productcode = route.query.productcode as string;
          product.suppliercode = route.query.suppliercode as string;
        }

        setProduct(product, use_store);

        return;
      }

      // Load product
      loading.value.product = true;
      return ApiService.get(`product/${id}`)
        .then((response) => {
          const data = response.data;

          // Convert to string for dropdowns
          data["producerid"] = String(data["producerid"]);
          data["productgroupid"] = String(data["productgroupid"]);
          data["td_producer"] = String(data["td_producer"] ?? "");

          // Convert numeric values
          data["volume"] = parseFloat(data["volume"]);

          // Reset data if copying
          if (is_copy) {
            const reset_fields = [
              "productid",
              "productidstr",
              "ean",
              "images",
              "imagesweb",
              "image_ids",
            ];

            reset_fields.forEach((key) => {
              data[key] = defaultProduct[key] || null;
            });
          }

          // Set tecdoc warning
          tecdoc_warning.value = !data.tecdocid;

          setProduct(data, use_store);
        })
        .catch((error) => {
          push.error("Neizdevās ielādēt produktu");
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          loading.value.product = false;
        });
    }

    // Store window
    const windowStore = useWindowStore();
    const wWatcher = watch(
      product,
      (newValue) => {
        windowStore.addWindow(
          route.path,
          `Labot preci: ${newValue.productidstr}`,
          newValue
        );
        checkOriginal();
      },
      { deep: true }
    );
    watcherHandles.push(wWatcher);

    const codeValidator = (rule, value, callback) => {
      if (!value) {
        callback(new Error("Jānorāda kods"));
      } else if (product.value.producerid !== "") {
        ApiService.get("product", "validate/", {
          productcode: value,
          producerid: product.value.producerid,
          productid: product.value.productid,
        })
          .then((response) => {
            if (response.data.exists) {
              callback(new Error("Prece jau eksistē"));
            } else {
              callback();
            }
          })
          .catch(() => {
            callback(new Error("Neizdevās pārbaudīt kodu"));
          });
      } else {
        callback();
      }
    };

    const dropdownValidator = (options, value, keyColumn = "id") => {
      if (!options) return false;
      return options.find((option) => String(option[keyColumn]) === value);
    };

    const rules = ref({
      productcode: [
        {
          validator: codeValidator,
          trigger: "change",
        },
      ],
      productname: [
        {
          required: true,
          message: "Jānorāda nosaukums",
          trigger: "change",
        },
      ],
      productgroupid: [
        {
          validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error("Jānorāda grupa"));
            } else if (!dropdownValidator(groups.value, value)) {
              callback(new Error("Jāizvēlās no saraksta"));
            } else {
              callback();
            }
          },
          trigger: "change",
        },
      ],
      ean: [
        {
          validator: (rule, value, callback) => {
            if (value && value.length > 20) {
              callback(new Error("Svītrukods pārāk garš"));
            } else {
              callback();
            }
          },
          trigger: "change",
        },
      ],
      producerid: [
        {
          validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error("Jānorāda ražotājs"));
            } else if (!dropdownValidator(producers.value, value)) {
              callback(new Error("Jāizvēlās no saraksta"));
            } else {
              // Re-validate productcode
              if (formRef.value)
                formRef.value.validateField("productcode", () => null);

              callback();
            }
          },
          trigger: "change",
        },
      ],
    });

    // Watch for route changes
    const rWatcher = watch(
      () => route.params.id,
      (newVal) => {
        if (newVal) loadProduct(newVal as string);
      },
      { immediate: true, deep: true }
    );
    watcherHandles.push(rWatcher);

    onBeforeUnmount(() => {
      watcherHandles.forEach((stop) => stop());
    });

    return {
      loading,
      tecdoc_warning,
      product,
      productMatches,
      groups,
      locations,
      producers,
      producersTecdoc,
      units,
      rules,
      is_new,
      loadProduct,
      nameSuggestions,
      groupSuggestions,
      locationSuggestions,
      formRef,
      blankGroup,
      blankGroupData,
    };
  },
  async mounted() {
    await Promise.all([
      this.loadData("location", "locations"),
      this.loadData("unit", "units"),
      this.loadData("producer", "producers"),
      this.loadData("group", "groups"),
      this.loadData("tecdoc/producers", "producersTecdoc"),
    ]);

    // Re-validate form
    if (this.$refs.formRef) (this.$refs.formRef as FormInstance).validate();

    // If creating from purchase document, load TecDoc
    if (this.$route.query.purchase) {
      this.loadTecDoc();
    }
  },
  data() {
    return {
      lastPath: null as any,
    };
  },
  created() {
    this.lastPath = this.$router.options.history.state.back;
  },
  methods: {
    submit() {
      if (!this.product) {
        return;
      }

      (this.$refs.formRef as FormInstance).validate((valid: boolean) => {
        if (valid) {
          this.loading.product = true;
          ApiService.post("product/", this.product)
            .then((response) => {
              push.success("Produkts saglabāts");
              // Returns productid if new product
              if (response.data.productid) {
                this.destroyWindow();
                this.$router.replace({
                  name: "product-edit",
                  params: { id: response.data.productid },
                });
              } else {
                this.loadProduct(null, false);
              }
            })
            .catch(() => {
              push.error("Neizdevās saglabāt produktu");
            })
            .finally(() => {
              this.loading.product = false;
            });
        } else {
          push.warning("Pārbaudi ievadītos datus");
          return false;
        }
      });
    },
    uploadImage(imageId) {
      return (upload) => {
        const data = new FormData();
        data.append("file", upload.file);
        data.append("image_no", imageId as string);
        data.append("id", this.product.productid);
        data.append("image_type", "product");

        ApiService.post("image/", data)
          .then((response) => {
            const index = imageId - 1;
            this.product.image_ids[index] = response.data.id;
            this.product.images[index] = response.data.image_url;
            this.product.imagesweb[index] = true;
            push.success("Attēls saglabāts");
          })
          .catch(() => {
            push.error("Neizdevās saglabāt attēlu");
          });
      };
    },
    pasteImage(index: number) {
      try {
        navigator.clipboard.read().then((items) => {
          let is_image = false;
          for (let item of items) {
            for (let type of item.types) {
              if (type.indexOf("image") === 0) {
                is_image = true;
                item.getType(type).then((blob) => {
                  this.uploadImage(index)({ file: blob });
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
    deleteImage(index: number) {
      ApiService.delete("image/", {
        id: this.product.productid,
        image_no: index,
        image_type: "product",
        image_id: this.product.image_ids[index - 1],
      })
        .then(() => {
          this.product.image_ids[index - 1] = "";
          this.product.images[index - 1] = "";
          this.product.imagesweb[index - 1] = false;
          push.success("Attēls dzēsts");
        })
        .catch(() => {
          push.error("Neizdevās dzēst attēlu");
        });
    },
    openImage(index) {
      this.$nextTick(() => {
        const elImage = this.$refs[`imageViewer_${index}`] as any;
        const imageElement = elImage[0].$el.querySelector("img");
        imageElement.click();
      });
    },
    async loadData(resource: string, attr: string) {
      this.loading[attr] = true;

      return ApiService.get(resource)
        .then((response) => {
          this[attr] = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from ${resource}:`, error);
          push.error(`Neizdevās ielādēt ${resource}`);
        })
        .finally(() => {
          this.loading[attr] = false;
        });
    },
    destroyWindow() {
      const windowStore = useWindowStore();
      windowStore.closeWindow(this.$route.path);
    },
    removeImport() {
      if (!this.lastPath) return null;

      const url = new URL(this.lastPath, "https://as.twinauto.lv");
      const params = new URLSearchParams(url.search);

      // Remove 'import' parameter
      params.delete("import");

      // Return the modified path
      return url.pathname + (params.toString() ? "?" + params.toString() : "");
    },
    closeProduct() {
      this.destroyWindow();

      // Avoid reseting import in purchase
      const modifiedPath = this.removeImport();
      if (modifiedPath) this.$router.replace(modifiedPath);
      else this.$router.go(-1);
    },
    loadTecDoc(ean = false, analogue = false) {
      let productCode;
      let producerId;
      let tecdocId;

      // Reset warning and suggestions
      this.tecdoc_warning = false;
      this.nameSuggestions = [];
      this.groupSuggestions = [];
      this.locationSuggestions = [];

      if (analogue) {
        productCode = this.product.td_code;
        tecdocId = this.product.td_producer;
      } else {
        productCode = this.product.productcode;
        producerId = this.product.producerid;
      }

      // Change to EAN
      if (ean) {
        productCode = this.product.ean;
        tecdocId = "EAN";
      }

      // If fields are empty, do nothing
      if (!productCode || (!producerId && !ean && !analogue)) {
        return;
      }

      if (!ean && !analogue) {
        // Find tecdocid from producers
        const producer = this.producers.find(
          (producer) => producer.id === producerId
        );

        tecdocId = producer.tecdocid;

        // Check tecdoc ID
        if (!tecdocId) {
          // No TecDoc ID, stop here
          this.tecdoc_warning = true;
          return;
        } else if (tecdocId > 100000000) {
          // Not a TecDoc ID
          this.tecdoc_warning = true;
        }
      }

      this.loading.tecdoc = true;

      // Load tecdoc data
      const code = encodeURIComponent(String(productCode));
      ApiService.get("tecdoc", `article/${tecdocId}/${code}?newProduct`)
        .then((response) => {
          const article = response.data ?? null;

          console.log(article);

          if (!article) {
            this.tecdoc_warning = true;
            return;
          }

          // Set code and producer
          if (ean) {
            this.product.productcode = article.articleNumber;
            const tecdocProducer = this.producers.find(
              (producer) => producer.tecdocid === String(article.dataSupplierId)
            );
            this.product.producerid = tecdocProducer.id;
          }

          // Grab criteria
          let criteria = article.articleCriteria?.reduce((accumulator, obj) => {
            accumulator[obj.criteriaId] = obj.rawValue;
            return accumulator;
          }, {});

          // Set volume (ml)
          if (criteria && criteria[684]) {
            this.product.volume = parseFloat(criteria[684]) / 1000;
            this.product.unitid = "2";
          }

          // Set OE codes
          let oe;
          if (article.oemNumbers) {
            oe = article.oemNumbers
              .map((item) => {
                // item[0] is the OEM number, item[1] is the array of manufacturers
                return `${item[0]} - ${item[1].join(", ")}`;
              })
              .join("\n");
          }
          if (oe) this.product.oecode = this.product.oecode + oe;

          // Set analogues
          let crosses;
          if (article.tecdocCrosses) {
            crosses = article.tecdocCrosses
              .map((item) => {
                return `${item.code} - ${item.producer}`;
              })
              .join("\n");
          }
          if (crosses) this.product.analogi = this.product.analogi + crosses;

          // Set name
          if (
            this.product.productname == "" &&
            article.nameSuggestions.length === 1
          ) {
            this.product.productname = article.nameSuggestions;
          } else {
            this.nameSuggestions = article.nameSuggestions;
          }

          // Set location
          if (
            this.product.location_list == [] &&
            Object.keys(article.locationSuggestions).length === 1
          ) {
            const key = Object.keys(article.locationSuggestions)[0];
            this.product.location_list = article.locationSuggestions[key];
          } else {
            this.locationSuggestions = article.locationSuggestions;
          }

          // Set group
          if (
            this.product.productgroupid == "" &&
            Object.keys(article.groupSuggestions).length === 1
          ) {
            this.product.productgroupid = Object.keys(
              article.groupSuggestions
            )[0];
          } else {
            this.groupSuggestions = article.groupSuggestions;
          }

          if (!analogue) {
            // Set ean
            if (article.gtins?.length > 0) this.product.ean = article.gtins[0];

            // Set image
            if (article.images?.[0]) {
              // Stage image for upload
              ApiService.get("tecdoc", "image", { url: article.images[0] })
                .then((response) => {
                  this.uploadImage(1)({ file: response.data });
                })
                .catch((error) => {
                  console.log("Failed to fetch image:", error);
                  push.error("Neizdevās pievienot TecDoc attēlu");
                });
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          this.loading.tecdoc = false;
        });
    },
    moveImage(index: number, left = true) {
      index = index - 1;
      const newIndex = left ? index - 1 : index + 1;

      // Get current image
      const image = this.product.images[index];
      const imageWeb = this.product.imagesweb[index];
      const imageId = this.product.image_ids[index];

      // Get image in the new location
      const imageNew = this.product.images[newIndex];
      const imageWebNew = this.product.imagesweb[newIndex];
      const imageIdNew = this.product.image_ids[newIndex];

      // Move current to new location
      this.product.images[index] = imageNew;
      this.product.imagesweb[index] = imageWebNew;
      this.product.image_ids[index] = imageIdNew;

      // Move new to current location
      this.product.images[newIndex] = image;
      this.product.imagesweb[newIndex] = imageWeb;
      this.product.image_ids[newIndex] = imageId;
    },
    newGroup() {
      this.blankGroupData = { ...this.blankGroup };
      (this.$refs.groupModal as any).show();
    },
    async refreshGroup(newId) {
      await this.loadData(`group`, `groups`);
      this.product.productgroupid = newId;
    },
  },
});
</script>
