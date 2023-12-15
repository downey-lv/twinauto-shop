<template>
  <div class="card" v-loading="loading">
    <div class="card-header pb-0 pt-0 border-0">
      <h3 class="card-title"></h3>
      <div class="card-toolbar">
        <router-link
          :to="{ name: 'return-edit', params: { returnId: 'new' } }"
          class="btn btn-sm btn-info me-3"
        >
          Jauns
        </router-link>
      </div>
    </div>
    <div class="card-body pt-0">
      <DataTable
        ref="table"
        id="returns"
        :columns="dt.returns.columns"
        :data="returns"
        :options="dtOptions"
        class="table table-sm table-hover table-row-bordered gy-5 align-middle"
        :key="tabsKey"
        @select="onSelect"
      >
        <thead>
          <tr class="fw-bolder text-dark p-4">
            <th v-for="(header, index) in dt.returns.headers" :key="index">
              {{ header }}
            </th>
          </tr>
        </thead>
      </DataTable>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import {
  getDtOptions,
  handleSelect,
  transformDtSource,
} from "@/assets/ts/layout/dtOptions";
import ApiService from "@/core/services/ApiService";

export default defineComponent({
  name: "return-list",
  setup() {
    const loading = ref<boolean>(false);
    const returns = ref();
    const tabsKey = ref(0);

    // Setup data load
    const loadData = async () => {
      loading.value = true;
      ApiService.get("return", "list")
        .then((response) => {
          returns.value = response.data;
          tabsKey.value += 1;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          loading.value = false;
        });
    };

    // Fetch data when the component is first loaded
    onMounted(loadData);

    // Define datatable
    let dtOptions = getDtOptions(1, false);
    dtOptions["select"] = true;
    dtOptions["order"] = [
      [6, "desc"], // Priority
      [2, "desc"], // Lead with external
      [0, "desc"], // ID
    ];

    let dtSource = {
      returns: {
        return_id: "ID",
        date: "Datums",
        direction: "Veids",
        title: "Iemesls",
        companyname: "Klients",
        suppliername: "Piegādātājs",
        status: "Statuss",
        return_comment: "Komentārs",
      },
    };

    const columnOptions = {
      returns: {
        direction: {
          render: function (data, type, row) {
            const icon = data === "Klienta" ? "user text-info" : "building";
            return `<i class="fa-solid fa-fw fa-${icon} me-2"></i> ${data}`;
          },
        },
        status: {
          render: function (data, type, row) {
            return `<span style="display:none;">${data.priority}</span><span class="badge bg-${data.bg}">${data.name}</span>`;
          },
        },
      },
    };

    const dt = transformDtSource(dtSource, columnOptions);

    return {
      returns,
      dtSource,
      dtOptions,
      dt,
      loading,
      tabsKey,
    };
  },
  methods: {
    onSelect(e, dt, type, indexes) {
      this.loading = true;
      const rowData = handleSelect(dt, indexes);
      const returnId = rowData[0].return_id;

      this.$router.push({
        name: "return-view",
        params: { returnId: returnId },
      });
    },
  },
});
</script>
