<template>
  <!--begin::List Widget 4-->
  <div class="card">
    <!--begin::Header-->
    <div class="card-header border-0 pt-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold text-dark">Interneta pasūtījumi</span>
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body pt-5" v-loading="loading">
      <table class="table table-sm">
        <thead>
          <tr class="fw-bold fs-6 text-gray-800">
            <th>Pasūtījuma numurs</th>
            <th>Klients</th>
            <th>Summa</th>
            <th>Apmaksāts</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td>
              <a :href="item.url" target="_blank">
                <span class="fw-light">{{ item.orderPrefix }}</span>
                <strong>{{ item.orderNumber }}</strong>
              </a>
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.amount }}</td>
            <td>
              <span class="badge" :class="item.paidBadge">{{
                item.paidLabel
              }}</span>
            </td>
          </tr>
        </tbody>
      </table>
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
    ApiService.get("data/orders")
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
