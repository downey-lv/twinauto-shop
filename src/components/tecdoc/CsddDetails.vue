<template>
  <template v-if="Object.keys(carData).length > 0">
    <div class="separator separator-dashed my-3"></div>
    <div class="d-flex justify-content-center">
      <div class="text-gray-700 fw-bold fs-6 me-2">CSDD</div>
    </div>
  </template>
  <template v-for="(item, key) in carData" :key="key">
    <div class="d-flex flex-stack">
      <div class="text-gray-700 fw-semibold fs-6 me-2">{{ key }}</div>
      <div class="d-flex align-items-center">
        {{ item }}
        <Copy
          v-if="key === 'Reģ. nr.' || key === 'VIN'"
          :value="item"
          buttonClass="ms-2"
          trim-spaces
          font-size="3"
        />
      </div>
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import Copy from "@/components/core/buttons/Copy.vue";
import { useCarStore } from "@/stores/car";

export default defineComponent({
  name: "csdd-details",
  components: { Copy },
  props: {
    altDetails: {
      type: Object,
      default: () => {},
    },
  },
  setup(props) {
    const carStore = useCarStore();
    let initialData = carStore.data;

    if (Object.keys(initialData).length == 0 && props.altDetails)
      initialData = props.altDetails;

    const carData = ref({ ...initialData });

    // Setup data watcher
    const dataWatcher = watch(
      () => carStore.data,
      (newVal) => {
        if (newVal) carData.value = carStore.data;
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      dataWatcher();
    });

    return {
      carData,
    };
  },
});
</script>
