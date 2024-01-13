<template>
  <!--begin::List Widget 4-->
  <div class="card mb-5">
    <!--begin::Header-->
    <div class="card-header border-0 pt-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold text-dark">Aktīvie remonti</span>
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body pt-5" v-loading="loading">
      <el-table :data="data" style="width: 100%" stripe>
        <el-table-column label="Remonts">
          <template #default="scope"> #{{ scope.row.repair_id }} </template>
        </el-table-column>
        <el-table-column label="Automašīna">
          <template #default="scope">
            {{ scope.row.make }} {{ scope.row.model }}
          </template>
        </el-table-column>
        <el-table-column label="Reģistrācijas numurs">
          <template #default="scope">
            {{ scope.row.registration }}
            <router-link
              :to="{
                name: `tecdoc-car`,
                query: { registration: scope.row.registration },
              }"
              class="btn btn-flush"
              title="Meklēt automašīnu"
              v-tooltip
            >
              <i class="fa-solid fa-magnifying-glass text-info"></i>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            <router-link
              :to="{
                name: `document-view`,
                params: {
                  documentId: scope.row.autoshop_order_id,
                  type: 'service',
                },
                query: { enableBack: 1 },
              }"
              class="text-info fw-bold"
              >Atvērt dokumentu</router-link
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--end::Body-->
  </div>
  <!--end::List Widget 4-->
</template>
<script lang="ts">
import ApiService from "@/core/services/ApiService";
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const loading = ref<boolean>(false);
    const data = ref();

    return {
      data,
      loading,
    };
  },
  mounted() {
    this.loading = true;
    ApiService.get("data/repairs")
      .then((response) => {
        this.data = response.data;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        this.loading = false;
      });
  },
});
</script>
