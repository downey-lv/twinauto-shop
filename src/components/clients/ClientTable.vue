<template>
  <div class="card" v-loading="loading">
    <div class="card-body">
      <DataTable
        ref="table"
        id="clients"
        :columns="dt.clients.columns"
        :data="clients"
        :options="dtOptions"
        class="table table-sm table-hover table-row-bordered gy-5 align-middle"
        :key="tabsKey"
        @select="onSelect"
      >
        <thead>
          <tr class="fw-bolder text-dark p-4">
            <th v-for="(header, index) in dt.clients.headers" :key="index">
              {{ header }}
            </th>
          </tr>
        </thead>
      </DataTable>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  getDtOptions,
  handleSelect,
  transformDtSource,
} from "@/assets/ts/layout/dtOptions";
import ApiService from "@/core/services/ApiService";

export default defineComponent({
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const loading = ref<boolean>(false);
    const clients = ref();
    const tabsKey = ref(0);

    // Setup data load
    const loadData = async () => {
      if (props.type) {
        loading.value = true;
        ApiService.get("company/list", props.type)
          .then((response) => {
            clients.value = response.data;
            tabsKey.value += 1;
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          })
          .finally(() => {
            loading.value = false;
          });
      }
    };

    // Fetch data when the component is first loaded
    onMounted(loadData);

    // React to changes in URL
    const uWatcher = watch(
      () => props.type, // watching the URL prop
      (newType, prevType) => {
        if (newType !== prevType) {
          loadData();
        }
      }
    );

    onBeforeUnmount(() => {
      uWatcher();
    });

    // Define datatable
    let dtOptions = getDtOptions(1);
    dtOptions["select"] = true;
    dtOptions["order"] = [[0, "desc"]];

    let dtSource = {
      clients: {
        companyid: "ID",
        companyname: "Nosaukums",
        nmrno: "Reģ. nr.",
        pvnno: "PVN nr.",
      },
    };

    const dt = transformDtSource(dtSource);

    return {
      clients,
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
      const clientId = rowData[0].companyid;

      this.$router.push({
        name: "client-view",
        params: { clientId: clientId },
      });
    },
  },
});
</script>
