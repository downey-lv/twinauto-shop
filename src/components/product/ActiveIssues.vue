<template>
  <!--begin::List Widget 4-->
  <div class="card mb-5">
    <!--begin::Header-->
    <div class="card-header border-0 pt-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold text-dark"
          >Problēmas ar produktiem</span
        >
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body pt-5" v-loading="loading">
      <el-table :data="data" style="width: 100%" stripe>
        <el-table-column label="ID" width="100">
          <template #default="scope">
            {{ scope.row.productid }}
            <Search
              :value="String(scope.row.productid)"
              font-size="4"
              type="id"
            />
          </template>
        </el-table-column>
        <el-table-column label="Apraksts" property="description" />
        <el-table-column label="Lietotājs" property="user" width="150" />
        <el-table-column width="130">
          <template #default="scope">
            <el-popconfirm
              confirm-button-text="Jā"
              cancel-button-text="Nē"
              title="Atrisināts?"
              @confirm="resolveIssue(scope.row.issue_id)"
            >
              <template #reference>
                <button class="btn btn-sm btn-light-success">Atrisināts</button>
              </template>
            </el-popconfirm>
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
import { push } from "@/main";
import Search from "@/components/core/buttons/Search.vue";

export default defineComponent({
  components: { Search },
  setup() {
    const loading = ref<boolean>(false);
    const data = ref();

    const loadIssues = async () => {
      loading.value = true;
      const response = await ApiService.get("product/issue");
      data.value = response.data;
      loading.value = false;
    };

    return {
      data,
      loading,
      loadIssues,
    };
  },
  mounted() {
    this.loadIssues();
  },
  methods: {
    resolveIssue(issueId: number) {
      ApiService.post("product/issue/resolve", { issueId })
        .then(() => {
          push.success("Saglabāts");
          this.loadIssues();
        })
        .catch(() => {
          push.error("Neizdevās saglabāt");
        });
    },
  },
});
</script>
