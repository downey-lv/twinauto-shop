<template>
  <div class="card mb-5">
    <div class="card-body" v-loading="loading">
      <el-table :data="resultList" @current-change="handleSelection">
        <el-table-column prop="stocktake_id" label="ID" />
        <el-table-column prop="order_id" label="Dokumenta ID" />
        <el-table-column prop="date_created" label="Datums" />
        <el-table-column prop="amountwithvat" label="Summa ar PVN" />
      </el-table>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { useRoute } from "vue-router";
import { useProductStore } from "@/stores/product";
import type { Document } from "@/types/Document";
import { DateTime } from "luxon";
import ImageHover from "@/components/product/ImageHover.vue";
import { Decimal } from "decimal.js";
import {
  calculateTotalPrice,
  calculateTotalPriceVAT,
  calculateTotalVAT,
} from "@/components/documents/calculations";

interface Result {
  stocktake_id: string;
  order_id: string;
  date_created: string;
  amountwithvat: string;
}

export default defineComponent({
  setup() {

    const loading = ref<boolean>(false);
    const resultList = ref<Result[]>([]);

    // Document load
    const fetchList = async () => {
      loading.value = true;
      await ApiService.get("stocktake/result")
        .then((response) => {
          resultList.value = response.data;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          push.error("Neizdevās ielādēt dokumentu");
        })
        .finally(() => {
          loading.value = false;
        });
    };

    return {
      loading,
      fetchList,
      resultList,
    };
  },
  async mounted() {
    // Load document
    await this.fetchList();
  },
  methods: {
    handleSelection(val: Result | undefined) {
      if (val) {
        this.$router.push({
          name: "stock-result",
          params: { stocktakeId: val.stocktake_id },
        });
      }
    },
  },
});
</script>
