<template>
  <SearchBox />
  <div class="row g-5 g-xl-8">
    <div class="col-xl-4">
      <div class="row g-5 g-xl-8">
        <div class="col-xl-6">
          <TecdocCarSelection widget-classes="card-xl-stretch" use-dropdown />
        </div>
        <div class="col-xl-6">
          <DailyRevenue type="V1" />
          <DailyRevenue type="V2" />
        </div>
      </div>
    </div>
    <div class="col-xl-8">
      <OnlineOrders />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TecdocCarSelection from "@/components/tecdoc/TecdocCarSelection.vue";
import SearchBox from "@/components/parts/SearchBox.vue";
import DailyRevenue from "@/components/data/DailyRevenue.vue";
import OnlineOrders from "@/components/data/OnlineOrders.vue";

export default defineComponent({
  name: "dashboard-main",
  components: {
    SearchBox,
    TecdocCarSelection,
    DailyRevenue,
    OnlineOrders,
  },
});
</script>
