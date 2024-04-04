<template>
  <DailyFilter
    @updateFilters="updateFilters"
    show-recipient-filter
    show-range-filter
    :show-date-filter="false"
    :show-user-filter="false"
  />

  <div class="card mb-5" v-loading="loading" v-if="searchReady">
    <div class="card-header border-0 pt-5">
      <h3 class="card-title">Veikals</h3>
    </div>
    <div class="card-body">
      <el-table :data="reportData" style="width: 100%">
        <el-table-column property="calcDate" label="Datums" sortable />
        <el-table-column property="veikals_total" label="Kopā" sortable />
        <el-table-column property="veikals_kase" label="Kase" sortable>
          <template #default="{ row }">
            <a
              href="#"
              @click.prevent="viewDetails(row.calcDate, `kase`)"
              class="text-decoration-underline text-reset"
              >{{ row.veikals_kase }}</a
            >
          </template>
        </el-table-column>
        <el-table-column property="veikals_karte" label="Karte" sortable>
          <template #default="{ row }">
            <a
              href="#"
              @click.prevent="viewDetails(row.calcDate, `karte`)"
              class="text-decoration-underline text-reset"
              >{{ row.veikals_karte }}</a
            >
          </template>
        </el-table-column>
        <el-table-column property="cash" label="Skaidra" sortable>
          <template #default="{ row }">
            <a
              href="#"
              @click.prevent="viewDetails(row.calcDate, `skaidra`)"
              class="text-decoration-underline text-reset"
              >{{ row.cash }}</a
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <DailyRevenueModal :revenue-data="revenueData" ref="revenueModal" />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import DailyFilter from "@/components/documents/DailyFilter.vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import DailyRevenueModal from "@/components/data/DailyRevenueModal.vue";
import {useAuthStore} from "@/stores/auth";

type DateRange = [Date, Date];

export default defineComponent({
  components: {
    DailyRevenueModal,
    DailyFilter,
  },
  setup() {
    const revenueData = ref();
    const filterRange = ref<DateRange | null>(null);
    const filterRecipient = ref("");

    // Check permissions
    const auth = useAuthStore();
    const allowed = auth.user?.permissions?.includes("profits");

    // Input check
    const searchReady = computed(() => {
      return (
        allowed &&
        filterRecipient.value &&
        filterRange.value &&
        filterRange.value.length === 2
      );
    });

    // Data load
    const loading = ref(false);
    const reportData = ref([]);
    const loadData = async () => {
      if (!searchReady.value || !filterRange.value) return;

      // Split filterRange
      const from = filterRange.value[0].toISOString().split("T")[0];
      const to = filterRange.value[1].toISOString().split("T")[0];

      loading.value = true;
      await ApiService.get("data/daily/range", filterRecipient.value, {
        from,
        to,
      })
        .then((response) => {
          reportData.value = response.data;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          push.error("Neizdevās ielādēt datus");
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const updateFilters = (newData) => {
      const oldData = {
        range: filterRange.value,
        recipientName: filterRecipient.value,
      };

      filterRange.value = newData.range;
      filterRecipient.value = newData.recipientName;

      if (
        oldData.range !== newData.range ||
        oldData.recipientName !== newData.recipientName
      )
        loadData();
    };

    return {
      searchReady,
      updateFilters,
      loading,
      reportData,
      filterRecipient,
      revenueData,
    };
  },
  methods: {
    viewDetails(date, type) {
      this.revenueData = {
        date: date,
        workstation: this.filterRecipient,
        source: "veikals",
        type,
        header: type.charAt(0).toUpperCase() + type.slice(1) + " - " + date,
      };
      (this.$refs.revenueModal as any).show();
    },
  },
});
</script>
