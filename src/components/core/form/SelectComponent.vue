<template>
  <el-form-item :prop="prop">
    <el-select
      filterable
      :model-value="modelValue"
      :multiple="multiple"
      :multiple-limit="multipleLimit"
      default-first-option
      placeholder="Izvēlēties"
      class="w-100"
      @update:modelValue="(val) => $emit('update:modelValue', val)"
      @change="$emit('change', $event)"
      :clearable="clearable"
    >
      <el-option
        v-for="option in options"
        :key="String(option[keyColumn])"
        :label="option[labelColumn]"
        :value="String(option[keyColumn])"
      ></el-option>
    </el-select>
  </el-form-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface OptionItem {
  [key: string]: string | number;
}

export default defineComponent({
  name: "SelectComponent",
  props: {
    options: {
      required: false,
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
  },
  emits: ["update:modelValue", "change"],
});
</script>
