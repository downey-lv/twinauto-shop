<template>
  <button
    class="btn btn-flush"
    :class="buttonClass"
    title="Kopēt"
    v-tooltip
    v-clipboard="() => copy_value"
    v-clipboard:success="clipboardSuccessHandler"
    v-clipboard:error="clipboardErrorHandler"
  >
    <KTIcon icon-name="copy" :icon-class="`fs-${fontSize} text-secondary`" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { push } from "@/main";

export default defineComponent({
  name: "copy-button",
  props: {
    value: String,
    trimSpaces: Boolean,
    fontSize: {
      type: String,
      default: "1",
    },
    buttonClass: {
      type: String,
      default: "",
    },
  },
  computed: {
    copy_value() {
      let value = this.value;
      if (value) {
        value = value.trim();

        if (this.trimSpaces) value = value.replace(/\s/g, "");
      }
      return value;
    },
  },
  methods: {
    clipboardSuccessHandler() {
      push.success("Nokopēts");
    },

    clipboardErrorHandler() {
      push.error("Neizdevās nokopēt");
    },
  },
});
</script>
