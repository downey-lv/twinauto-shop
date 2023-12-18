<template>
  <!--begin::List Widget 4-->
  <div class="card" :class="widgetClasses" v-if="searchHistory?.length">
    <!--begin::Header-->
    <div class="card-header border-0 pt-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold text-dark">Vēsture</span>
        <span class="text-muted mt-1 fw-semibold fs-7"
          >Pēdējie 25 meklējumi</span
        >
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body pt-5">
      <div class="d-flex flex-column">
        <li
          class="d-flex align-items-center py-2 cursor-pointer"
          v-for="(item, index) in searchHistory"
          :key="index"
          @click="usePreviousSearch(index, item)"
        >
          <span class="bullet me-5"></span>
          {{ item.label }}
          <template v-if="item.query.registration">
            <br />
            {{ item.query.registration
            }}{{ item.query.vin ? " - " + item.query.vin : "" }}
          </template>
        </li>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  props: {
    widgetClasses: String,
  },
  setup() {
    const searchHistory = ref<Array<any>>([]);

    onMounted(() => {
      const savedHistory = localStorage.getItem("searchHistory");
      if (savedHistory) {
        searchHistory.value = JSON.parse(savedHistory).reverse();
      }
    });

    return {
      searchHistory,
    };
  },
  methods: {
    usePreviousSearch(index, item) {
      // Set as latest search
      this.searchHistory.splice(index, 1);
      this.searchHistory.push(item);
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));

      this.$router.push({
        name: "tecdoc-groups",
        params: item.params,
        query: item.query,
      });
    },
  },
});
</script>
