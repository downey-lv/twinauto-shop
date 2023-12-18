<template>
  <template v-if="carData">
    <Notice
      v-if="carData.warning"
      :body="carData.warning"
      classes="rounded-3 mb-3"
      color="warning"
    ></Notice>
    <div class="separator separator-dashed my-3"></div>
    <div class="d-flex justify-content-center">
      <div class="text-gray-700 fw-bold fs-6 me-2">CSDD</div>
    </div>

    <template v-for="(item, key) in carData.csdd" :key="key">
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
          <a
            v-if="key === 'VIN' && carData.pl24"
            :href="carData.pl24"
            target="_blank"
            title="Atvērt partslink24"
            v-tooltip
          >
            <i class="fa-solid fa-car-garage text-warning"></i>
          </a>
        </div>
      </div>
    </template>
  </template>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import Copy from "@/components/core/buttons/Copy.vue";
import { useCarStore } from "@/stores/car";
import Notice from "@/components/core/Notice.vue";
import type { CarInfo } from "@/types/CarInfo";

export default defineComponent({
  name: "csdd-details",
  components: { Notice, Copy },
  props: {
    altDetails: {
      type: Object,
      default: () => {},
    },
  },
  setup(props) {
    const carStore = useCarStore();

    if (!carStore.data && props.altDetails)
      carStore.data = { csdd: props.altDetails };

    const carData = ref<CarInfo | null>(carStore.data);

    // Setup data watcher
    const dataWatcher = watch(
      () => carStore.data,
      (newVal) => {
        if (newVal) carData.value = carStore.data;
      }
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
