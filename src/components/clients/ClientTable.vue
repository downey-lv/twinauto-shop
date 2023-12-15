<template>
  <div class="card" v-loading="loading">
    <div class="card-body">
      <DataTable
        ref="table"
        id="documents"
        :columns="dt.documents.columns"
        :data="documents"
        :options="dtOptions"
        class="table table-sm table-hover table-row-bordered gy-5 align-middle"
        :key="tabsKey"
      >
        <thead>
          <tr class="fw-bolder text-dark p-4">
            <th v-for="(header, index) in dt.documents.headers" :key="index">
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
import { getDtOptions, transformDtSource } from "@/assets/ts/layout/dtOptions";
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
    const documents = ref();
    const tabsKey = ref(0);

    // Setup data load
    const loadData = async () => {
      if (props.type) {
        loading.value = true;
        ApiService.get("document/list", props.type)
          .then((response) => {
            documents.value = response.data;
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
    dtOptions["order"] = [[0, "desc"]];

    let dtSource = {
      documents: {
        orderid: "ID",
        orderdate: "Datums",
        client: "Klients",
        ordertypename: "Veids",
        waybillno: "Dokumenta nr.",
        comment: "Komentārs",
        countsum: "Preču skaits",
        amountwithvat: "Summa",
      },
    };

    const columnOptions = {
      documents: {
        orderdate: {
          width: "100px",
        },
        amountwithvat: {
          width: "85px",
        },
        client: {
          width: "250px",
        },
        ordertypename: {
          width: "180px",
        },
      },
    };

    const dt = transformDtSource(dtSource, columnOptions);

    return {
      documents,
      dtSource,
      dtOptions,
      dt,
      loading,
      tabsKey,
    };
  },
});
</script>
