<template>
  <!--begin::List Widget 4-->
  <div class="card" :class="widgetClasses">
    <!--begin::Header-->
    <div class="card-header border-0 pt-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold text-dark">TecDoc</span>

        <span class="text-muted mt-1 fw-semibold fs-7"
          >Izvēlēties automašīnu</span
        >
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body pt-5">
      <el-form class="form" v-loading="loading">
        <el-form-item :error="vinError">
          <el-input
            v-model="selectedVIN"
            @keyup.enter="findVIN()"
            placeholder="VIN vai reģistrācijas numurs"
            ref="VIN"
          ></el-input>
        </el-form-item>

        <div class="separator separator-dashed my-3"></div>

        <template v-for="(item, index) in list" :key="index">
          <!--begin::Input group-->
          <div class="d-flex flex-column fv-row">
            <el-form-item>
              <el-select
                filterable
                clearable
                v-model="item.selected"
                :placeholder="item.title"
                default-first-option
                @change="handleDropdownChange(index)"
                :ref="index"
                class="w-100"
              >
                <el-option
                  v-for="option in item.options"
                  :key="option.value"
                  :label="option.label"
                  :value="String(option.value)"
                ></el-option>
              </el-select>
            </el-form-item>
            <!--end::Input group-->
          </div>
        </template>
      </el-form>
    </div>
    <!--end::Body-->
  </div>
  <!--end::List Widget 4-->
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import type { ElTable } from "element-plus";
import ApiService from "@/core/services/ApiService";

export default defineComponent({
  name: "tecdoc-car-selection",
  props: {
    widgetClasses: String,
    useDropdown: Boolean,
  },
  setup(props, { emit }) {
    const loading = ref<boolean>(false);
    const tecDocData = ref();
    const selectedVIN = ref();

    const list = ref({
      make: {
        title: "Ražotājs",
        onchange: "loadModels",
        options: [] as any,
        selected: "",
        focus: "model",
      },
      model: {
        title: "Modelis",
        onchange: "loadCars",
        options: [] as any,
        selected: "",
        focus: "car",
      },
      car: {
        title: "Modifikācija",
        onchange: "",
        options: [] as any,
        selected: "",
        focus: "",
      },
    });

    const tdWatcher = watch(tecDocData, (newValue) => {
      emit("update:tecDocData", newValue); // Emitting the update to parent.
    });

    onBeforeUnmount(() => {
      tdWatcher();
    });

    return {
      list,
      loading,
      tecDocData,
      selectedVIN,
    };
  },
  data() {
    return {
      selectedModel: "",
      selectedMake: "",
      limited: { make: "", model: "", car: "" },
      vinError: "",
      vinData: { vin: "", registration: "" },
      values: { makeId: "", modelId: "", carId: "" },
    };
  },
  mounted() {
    this.selectedMake = (this.$route.params.makeId || "").toString();
    this.selectedModel = (this.$route.params.modelId || "").toString();
    this.loadData("make");
  },
  methods: {
    setValue(field: string, value: string, dropdown: boolean = true) {
      this.list[field]["selected"] = String(value);
      if (value !== "") this.handleDropdownChange(field, dropdown);
    },
    setOptions(
      field: string,
      data: any = [],
      selected: any = "",
      dropdown: boolean = true
    ) {
      this.list[field]["options"] = data.dropdown;
      this.tecDocData = { type: field, data: data };
      this.setValue(field, selected, dropdown);
    },
    async fetchData(slug, params = {}) {
      try {
        const response = await ApiService.get(`tecdoc/cars`, slug, params);
        return response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    async loadData(type) {
      const selectedMake = this.list["make"]["selected"];
      const selectedModel = this.list["model"]["selected"];

      let slug = "";
      if (type === "model" && selectedMake) {
        slug += `${selectedMake}/`;
      } else if (type === "car" && selectedMake && selectedModel) {
        slug += `${selectedMake}/${selectedModel}/`;
      }

      const data = await this.fetchData(slug, { limited: this.limited[type] });
      if (data) {
        this.setOptions(type, data);
        if (type !== "car")
          this[`selected${type.charAt(0).toUpperCase() + type.slice(1)}`] = "";
      }
    },

    handleDropdownChange(
      field: string,
      overrideDropdown: boolean | undefined = undefined
    ) {
      let dropdown = overrideDropdown;
      if (dropdown === undefined) dropdown = this.useDropdown;

      const refFocus = (ref) => {
        this.$nextTick(() => {
          (this.$refs[ref] as typeof ElTable)[0].focus();
        });
      };

      const nextField = {
        make: "model",
        model: "car",
      };

      if (field in nextField) {
        if (this.list[field]["selected"]) {
          this.loadData(nextField[field]);
          if (dropdown) refFocus(nextField[field]);
        } else {
          this.loadData(field);
        }
      } else if (field === "car" && this.list["car"]["selected"]) {
        this.$router.push({
          name: "tecdoc-groups",
          params: {
            makeId: this.list["make"]["selected"],
            modelId: this.list["model"]["selected"],
            carId: this.list["car"]["selected"],
          },
          query: this.vinData,
        });
      }
    },
    findVIN() {
      this.vinError = "";
      const vin = this.selectedVIN;

      if (!vin) {
        this.vinError = "Lauks nevar būt tukšs";
        return;
      }

      this.loading = true;
      ApiService.get(`tecdoc/vin`, vin)
        .then((response) => {
          const data = response.data;

          if (data["car"].length == 0) {
            this.vinError = "Nav rezultātu";
          } else {
            let values = {};

            // Loop dropdown fields
            for (const key of Object.keys(this.limited)) {
              if (data[key].length == 1) {
                // If only one result, select it.
                this.limited[key] = "";
                values[key] = String(data[key][0]);
              } else {
                // Set limited values for dropdown
                this.limited[key] = data[key].join(",");
              }
            }

            // Add details
            this.vinData = {
              vin: data["vin"],
              registration: data["registration"],
            };

            // Set values
            const that = this;
            for (const [key, value] of Object.entries(values)) {
              that.setValue(key, value as string);
            }
          }
        })
        .catch((error) => {
          this.vinError = "Neizdevās ielādēt";
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
});
</script>
