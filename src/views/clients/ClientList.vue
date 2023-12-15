<template>
  <ClientHeader />
  <ClientTable
    v-if="documentType && documentType !== 'all'"
    :type="documentType"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import ClientTable from "@/components/clients/ClientTable.vue";
import ClientHeader from "@/components/clients/ClientHeader.vue";

export default defineComponent({
  components: {
    ClientHeader,
    ClientTable,
  },
  setup() {
    const route = useRoute();

    const documentType = computed(() => {
      return String(route.params.type) || "";
    });

    return { documentType };
  },
});
</script>
