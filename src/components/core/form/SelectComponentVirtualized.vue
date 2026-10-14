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
      <template #default="{ item }"> {{ item.label }}&lrm; </template>

      <template #empty>
        <slot name="empty">
          <!-- Default No-Match Message -->
          <div style="color: gray">Nav rezultātu</div>
        </slot>
      </template>
    </el-select-v2>
    <div class="fs-7 fw-semibold text-muted">
      <slot name="comment"></slot>
    </div>
  </el-form-item>
</template>

<!-- Ellipsis at the start for long options in dropdown -->
<style>
.el-select-dropdown__item {
  direction: rtl;
  text-overflow: ellipsis;
  text-align: left;
}
</style>

<script lang="ts">
import { computed, defineComponent, type PropType, ref, watch } from "vue";

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
    noMatchText: {
      type: String,
      default: "Nav rezultātu",
    },
  },
  emits: ["update:modelValue", "change"],
  setup(props) {
    const formatOptions = (optionsOriginal: OptionItem[]) => {
      if (!optionsOriginal) {
        return [];
      }

      // Shallow copy per item: el-select-v2 only needs label/value
      return optionsOriginal.map((item) => ({
        ...item,
        label: item[props.labelColumn],
        value: item[props.keyColumn],
      }));
    };

    const formattedOptions = computed(() => {
      if (!props.options) return [];

      if (props.grouped) {
        // Don't mutate the parent's groups in place
        return (props.options as OptionGroup[]).map((group) => ({
          ...group,
          options: formatOptions(group.options),
        }));
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
