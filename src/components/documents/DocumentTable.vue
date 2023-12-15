<template>
  <div class="card" v-loading="loading">
    <div class="card-header border-0 pt-5" v-if="$slots.header">
      <slot name="header"></slot>
    </div>
    <div class="card-body pt-0">
      <DataTable
        ref="table"
        id="documents"
        :columns="dt.documents.columns"
        :data="documents"
        :options="dtOptions"
        class="table table-sm table-hover table-row-bordered gy-5 align-middle"
        :key="tabsKey"
        @select="onSelect"
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
import {defineComponent, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {
  getDtOptions,
  handleSelect,
  transformDtSource,
} from "@/assets/ts/layout/dtOptions";
import ApiService from "@/core/services/ApiService";

export default defineComponent({
  name: "document-table",
  props: {
    type: {
      type: String,
      required: true,
    },
    returnId: {
      type: String,
      required: false,
    },
    returnClient: {
      type: Boolean,
      required: false,
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
        ApiService.get("document/list", props.type, {
          returnId: props.returnId,
          returnClient: props.returnClient,
        })
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
    const pWatcher = watch(
      () => props.type, // watching the URL prop
      (newType, prevType) => {
        if (newType !== prevType) {
          loadData();
        }
      }
    );

    // Define datatable
    const saveState = !props.returnId;
    let dtOptions = getDtOptions(1, saveState);
    dtOptions["select"] = true;
    dtOptions["order"] = [[0, "desc"]];

    let dtSource = {
      documents: {
        orderid: "ID",
        orderdate: "Datums",
        companyname: "Klients",
        ordertypename: "Veids",
        waybillno: "Dokumenta nr.",
        comment: "Komentārs",
        amountwithvat: "Summa",
        paid: "Apmaksāts",
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
        paid: {
          render: function (data, type, row) {
            if (data) {
              return '<span class="badge badge-light-success">Jā</span>';
            } else {
              return '<span class="badge badge-light-danger">Nē</span>';
            }
          },
        },
      },
    };

    const dt = transformDtSource(dtSource, columnOptions);

    onBeforeUnmount(() => {
      pWatcher();
    });

    return {
      documents,
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
      const documentId = rowData[0].orderid;

      if (this.$props.returnId) {
        // Route to document edit in return
        this.$router.push({
          name: "return-view",
          params: { returnId: this.$props.returnId, documentId: documentId },
        });
      } else {
        // Route to standard document edit
        this.$router.push({
          name: "document-view",
          params: { type: this.$route.params.type, documentId: documentId },
        });
      }
    },
  },
});
</script>
