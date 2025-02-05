<template>
  <div
    class="editable-field"
    :class="divClass"
    @mouseover="hovering = true"
    @mouseleave="hovering = false"
    v-loading="loading"
  >
    <template v-if="!isEditing">
      <span class="me-5">
        <slot name="display"></slot>
        <span :class="spanClass" v-if="!$slots.display">
          <span
            v-for="(line, lineNumber) of String(displayValue).split('\n')"
            v-bind:key="lineNumber"
            v-html="line + '<br />'"
          >
          </span>
        </span>
      </span>
    </template>
    <template v-else>
      <el-input
        v-if="inputType == 'textarea'"
        v-model="editableValue"
        size="small"
        class="me-2"
        type="textarea"
        autosize
      >
      </el-input>
      <template v-else-if="inputType == 'select'">
        <el-select-v2
          v-model="editableValue"
          :options="selectOptions"
          placeholder="Izvēlēties"
          size="large"
          style="width: 100%; min-width: 240px"
          :multiple="multipleLimit > 1"
          :multiple-limit="multipleLimit"
          filterable
          clearable
        />
      </template>
      <div class="text-end w-100">
        <el-button-group class="me-2 mt-1">
          <el-button @click="cancelEdit" type="danger" size="small"
            ><i class="fas fa-times"></i
          ></el-button>
          <el-button @click="saveEdit" type="success" size="small"
            ><i class="fas fa-check"></i
          ></el-button>
        </el-button-group>
      </div>
    </template>

    <a href="javascript:" @click="isEditing = true">
      <i v-if="hovering && !isEditing" class="fas fa-pencil-alt"></i>
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";

export default defineComponent({
  props: {
    modelValue: {
      type: [String, Array],
      required: true,
    },
    formattedValue: {
      type: String,
    },
    field: {
      type: String,
      required: true,
    },
    inputType: {
      type: String,
      default: "textarea",
    },
    productId: {
      type: String,
      required: true,
    },
    divClass: {
      type: String,
    },
    spanClass: {
      type: String,
    },
    multipleLimit: {
      type: Number,
      default: 1,
    },
  },
  emits: ["update:modelValue", "update:formattedValue"],
  setup(props, { emit }) {
    const editableValue = ref(cleanValue(props.modelValue));
    const displayValue = ref(props.formattedValue || props.modelValue);
    const isEditing = ref(false);
    const hovering = ref(false);
    const loading = ref(false);
    const selectOptions = ref([]);

    const saveEdit = () => {
      loading.value = true;
      const data = {
        field: props.field,
        value: editableValue.value,
      };

      ApiService.post(`product/${props.productId}`, data)
        .then(() => {
          push.success("Produkts saglabāts");

          // Update the parent model value
          emit("update:modelValue", dirtyValue(editableValue.value));

          // Set display value from select options
          if (props.formattedValue && props.inputType === "select") {
            let value = editableValue.value;

            // Check if the value is an array
            if (!Array.isArray(editableValue.value)) {
              value = [editableValue.value];
            }

            // Get selected options
            const selOpt: any[] = selectOptions.value;
            const selected = value.map((selectedValue) =>
              selOpt.find((option) => option.value === selectedValue)
            );

            // Set display value to selected options
            displayValue.value = selected
              .map((option) => option.label)
              .join(" / ");

            // Emit changes
            emit("update:formattedValue", displayValue.value);
          }

          isEditing.value = false;
        })
        .catch(() => {
          push.error("Neizdevās saglabāt produktu");
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const cancelEdit = () => {
      editableValue.value = cleanValue(props.modelValue);
      isEditing.value = false;
    };

    function cleanValue(value) {
      if (typeof value !== "string") return value;

      return value.replaceAll(/<br>/g, "\n");
    }

    function dirtyValue(value) {
      if (typeof value !== "string") return value;

      return value.replaceAll(/\n/g, "<br>");
    }

    watch(
      () => props.modelValue,
      (newValue) => {
        // Ensure the value is reset properly
        editableValue.value = cleanValue(newValue);
        displayValue.value = props.formattedValue || newValue;
      }
    );

    async function loadData(resource: string) {
      loading.value = true;

      return ApiService.get(resource)
        .then((response) => {
          // Rename id column to value
          response.data.forEach((item) => {
            item.value = item.id;
            item.label = item.name;
            delete item.id;
            delete item.name;
          });

          selectOptions.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from ${resource}:`, error);
          push.error(`Neizdevās ielādēt ${resource}`);
        })
        .finally(() => {
          loading.value = false;
        });
    }

    if (props.field === "location") loadData("location");
    else if (props.field === "productgroupid") loadData("group");

    return {
      editableValue,
      displayValue,
      isEditing,
      hovering,
      saveEdit,
      cancelEdit,
      loading,
      selectOptions,
    };
  },
});
</script>
