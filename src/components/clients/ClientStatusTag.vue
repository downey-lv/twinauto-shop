<template>
  <template v-if="['all', 'daily', 'out'].includes(documentType)">
    <el-tooltip
      v-if="blocked"
      :content="blockedReasons.join(`, `) ?? `Nav norādīts`"
    >
      <el-tag type="danger">Bloķēts</el-tag>
    </el-tooltip>
    <el-tooltip v-else :content="`Atlikusī summma ${creditLeft.toFixed(2)} €`">
      <el-tag type="success">Aktīvs</el-tag>
    </el-tooltip>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    blocked: {
      type: Boolean,
      required: true,
    },
    creditLeft: {
      type: Number,
      required: true,
    },
    blockedReasons: {
      type: Array,
      required: true,
    },
    documentType: {
      type: String,
      required: false,
      default: "all",
    },
  },
  setup() {},
  methods: {},
});
</script>
