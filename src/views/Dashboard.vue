<template>
  <SearchBox />
  <div class="row g-5 g-xl-8">
    <div class="col-xl-4">
      <div class="row g-5 g-xl-8">
        <div class="col-xl-6">
          <TecdocCarSelection widget-classes="card-xl-stretch" use-dropdown />
        </div>
        <div class="col-xl-6">
          <template v-if="revenueAllowed">
            <DailyRevenue type="V1" />
            <DailyRevenue type="V2" />
          </template>
        </div>
      </div>
    </div>
    <div class="col-xl-8">
      <OnlineOrders v-if="ordersAllowed" />
      <ActiveRepairs v-if="repairsAllowed" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TecdocCarSelection from "@/components/tecdoc/TecdocCarSelection.vue";
import SearchBox from "@/components/parts/SearchBox.vue";
import DailyRevenue from "@/components/data/DailyRevenue.vue";
import OnlineOrders from "@/components/data/OnlineOrders.vue";
import { useAuthStore } from "@/stores/auth";
import { push } from "@/main";
import ActiveRepairs from "@/components/data/ActiveRepairs.vue";

export default defineComponent({
  name: "dashboard-main",
  components: {
    ActiveRepairs,
    SearchBox,
    TecdocCarSelection,
    DailyRevenue,
    OnlineOrders,
  },
  setup() {
    const auth = useAuthStore();
    const revenueAllowed = auth.user?.permissions?.includes("daily_revenue");
    const ordersAllowed = auth.user?.permissions?.includes("active_orders");
    const repairsAllowed = auth.user?.permissions?.includes("active_repairs");

    return {
      revenueAllowed,
      ordersAllowed,
      repairsAllowed,
    };
  },
});
</script>
