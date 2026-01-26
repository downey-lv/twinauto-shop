<template>
  <div class="card mb-5" v-loading="loading">
    <div class="card-header border-0 pt-5">
      <h3 class="card-title">Novietnes</h3>
    </div>
    <div class="card-body p-2">
      <el-table
        :data="locations"
        style="width: 100%"
        :default-sort="{ prop: 'products_in_location', order: 'descending' }"
      >
        <el-table-column label="Novietne" prop="locationname" sortable />
        <el-table-column
          label="Saskaitītās preces"
          prop="product_count"
          sortable
        >
          <template #default="scope">
            {{ scope.row.product_count }}
            <i
              v-if="
                scope.row.product_count == 0 &&
                scope.row.products_in_location > 0
              "
              class="fa-duotone fa-solid fa-circle-exclamation text-danger"
            ></i>
          </template>
        </el-table-column>
        <el-table-column
          label="Preces novietnē"
          prop="products_in_location"
          sortable
        />
        <el-table-column label="Skaitīja" prop="user_names_string" />
      </el-table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";

export default defineComponent({
  setup() {
    const locations = ref();
    const loading = ref(false);

    // Load locations
    loading.value = true;
    ApiService.get(`/stocktake/location`)
      .then((response) => {
        locations.value = response.data;
      })
      .catch((error) => {
        console.error(`Error fetching location overview:`, error);
        push.error(`Neizdevās ielādēt datus`);
      })
      .finally(() => {
        loading.value = false;
      });

    return {
      locations,
      loading,
    };
  },
});
</script>
