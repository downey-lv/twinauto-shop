<template>
  <el-form-item :prop="prop" :class="elementClass" :label="label">
    <el-select-v2
      filterable
      :model-value="editableValue"
      :multiple="multipleLimit > 1"
      :multiple-limit="multipleLimit"
      :size="size"
      :placeholder="placeholder"
      class="w-100"
      @update:modelValue="(val) => $emit('update:modelValue', val)"
      @change="$emit('change', $event)"
      :clearable="clearable"
      :allow-create="allowCreate"
      :options="formattedOptions"
    >
      <template #default="{ item }">
        {{ item.label }}&lrm;
      </template>
    </el-select-v2>
    <div class="fs-7 fw-semibold text-muted">
      <slot name="comment"></slot>
    </div>
  </el-form-item>
</template>

<style>
.el-select-dropdown__item {
  direction: rtl;
  text-overflow: ellipsis;
}
</style>

<script lang="ts">
import { computed, defineComponent, type PropType, ref, watch } from "vue";
import { cloneDeep } from "lodash";

interface OptionItem {
  [key: string]: string | number;
}

interface OptionGroup {
  label: string;
  options: OptionItem[];
}

export default defineComponent({
  name: "SelectComponent",
  props: {
    options: {
      required: false,
      type: Object as PropType<OptionItem[] | OptionGroup[]>,
    },
    modelValue: {
      required: true,
    },
    multipleLimit: {
      type: Number,
      default: 0,
    },
    keyColumn: {
      type: String,
      default: "id",
    },
    labelColumn: {
      type: String,
      default: "name",
    },
    prop: {
      type: String,
      default: "",
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "Izvēlēties",
    },
    elementClass: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    allowCreate: {
      type: Boolean,
      default: false,
    },
    grouped: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "change"],
  setup(props) {
    const formatOptions = (optionsOriginal: OptionItem[]) => {
      if (!optionsOriginal) {
        return [];
      }

      const options = cloneDeep(optionsOriginal);

      options.forEach((item) => {
        if (props.labelColumn != "label") {
          item.label = item[props.labelColumn];
          delete item[props.labelColumn];
        }
        if (props.keyColumn != "value") {
          item.value = item[props.keyColumn];
          delete item[props.keyColumn];
        }
      });

      return options;
    };

    const formattedOptions = computed(() => {
      if (!props.options) return [];

      if (props.grouped) {
        let options = props.options as OptionGroup[];
        if (!options) return [];

        options.forEach((group) => {
          group.options = formatOptions(group.options);
        });

        return options;
      }

      return formatOptions(props.options as OptionItem[]);
    });

    const editableValue = ref(props.modelValue);

    watch(
      () => props.modelValue,
      (value) => {
        editableValue.value = value;
      }
    );

    return {
      formattedOptions,
      editableValue,
    };
  },
});
</script>
