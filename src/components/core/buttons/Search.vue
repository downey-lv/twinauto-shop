<template>
  <button
    class="btn btn-flush"
    :class="buttonClass"
    @click="codeSearch(`${value}`)"
    title="Meklēt"
    v-tooltip
  >
    <KTIcon icon-name="magnifier" :icon-class="`fs-${fontSize} text-primary`" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "search-button",
  props: {
    value: String,
    fontSize: {
      type: String,
      default: "1",
    },
    buttonClass: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "code",
    },
  },
  methods: {
    codeSearch(value: string) {
      this.$router.push({
        name: "search-parts",
        params: {
          type: this.type,
          query: value,
        },
      });
    },
  },
});
</script>
