<template>
  <el-form-item :prop="prop" :class="elementClass" :label="label">
    <el-select
      filterable
      :model-value="modelValue"
      :multiple="multiple"
      :multiple-limit="multipleLimit"
      :size="size"
      default-first-option
      :placeholder="placeholder"
      class="w-100"
      @update:modelValue="(val) => $emit('update:modelValue', val)"
      @change="$emit('change', $event)"
      :clearable="clearable"
      :allow-create="allowCreate"
    >
      <template v-if="grouped">
        <el-option-group
          v-for="group in options"
          :key="group.label"
          :label="group.label"
        >
          <el-option
            v-for="option in group.options"
            :key="String(option[keyColumn])"
            :label="option[labelColumn]"
            :value="String(option[keyColumn])"
          ></el-option>
        </el-option-group>
      </template>
      <template v-else>
        <el-option
          v-for="option in options"
          :key="String(option[keyColumn])"
          :label="option[labelColumn]"
          :value="String(option[keyColumn])"
        ></el-option>
      </template>
    </el-select>
  </el-form-item>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

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
    multiple: {
      type: Boolean,
      default: false,
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
});
</script>
