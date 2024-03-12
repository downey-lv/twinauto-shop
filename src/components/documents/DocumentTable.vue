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
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import {
  getDtOptions,
  handleSelect,
  transformDtSource,
  serverSide,
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
    serverSide: {
      type: Boolean,
      required: false,
    },
    clientId: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const loading = ref<boolean>(false);
    const documents = ref();
    const tabsKey = ref(0);
    const table = ref();

    // Setup data load
    const loadData = (queryInfo = {} as any) => {
      return new Promise((resolve, reject) => {
        if (props.type) {
          loading.value = true;
          ApiService.get("document/list", props.type, {
            returnId: props.returnId,
            returnClient: props.returnClient,
            clientId: props.clientId,
            ...queryInfo,
          })
            .then((response) => {
              if (queryInfo.dtServerSide) {
                resolve(response.data);
              } else {
                documents.value = response.data;
                tabsKey.value += 1;
              }
            })
            .catch((error) => {
              console.error("Error fetching data:", error);
              reject(error);
            })
            .finally(() => {
              loading.value = false;
            });
        }
      });
    };

    // Set source
    onMounted(async () => {
      setSource(props.type, "");
    });

    // Fetch data when the component is first loaded
    if (!props.serverSide) onMounted(loadData);

    // React to changes in URL
    const pWatcher = watch(
      () => props.type, // watching the URL prop
      (newType, prevType) => {
        if (newType !== prevType) {
          const sourceChanged = setSource(newType, prevType);
          if (!sourceChanged) {
            if (props.serverSide) {
              table.value.dt.draw();
            } else {
              loadData();
            }
          }
        }
      }
    );

    // Define datatable
    const saveState = !props.returnId;
    let dtOptions = getDtOptions(1, saveState);
    dtOptions["select"] = true;
    dtOptions["order"] = [[0, "desc"]];
    if (props.serverSide) {
      dtOptions["ajax"] = serverSide(loadData);
      dtOptions["processing"] = true;
      dtOptions["serverSide"] = true;
    }

    const documentSource = {
      orderid: "ID",
      orderdate: "Datums",
      companyname: "Klients",
      ordertypename: "Veids",
      waybillno: "Dokumenta nr.",
      comment: "Komentārs",
      amount_payable: "Summa",
      is_paid: "Apmaksāts",
    };

    let dtSource = ref({
      documents: documentSource,
    });

    const setSource = (newType, oldType) => {
      if (newType !== "daily" && oldType !== "daily") return false;

      const dailySource = {
        payments: "Apmaksa",
        recipients: "Darba vieta",
      };

      if (props.type === "daily") {
        dtSource.value.documents = { ...documentSource, ...dailySource };
      } else {
        dtSource.value.documents = documentSource;
      }

      tabsKey.value += 1;
      return true;
    };

    const columnOptions = {
      documents: {
        orderid: {
          width: "60px",
        },
        orderdate: {
          width: "100px",
        },
        amount_payable: {
          width: "85px",
        },
        companyname: {
          width: "300px",
        },
        ordertypename: {
          width: "180px",
        },
        is_paid: {
          render: function (data) {
            if (data) {
              return '<span class="badge badge-light-success">Jā</span>';
            } else {
              return '<span class="badge badge-light-danger">Nē</span>';
            }
          },
        },
      },
    };

    const dt = computed(() => transformDtSource(dtSource.value, columnOptions));

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
      table,
    };
  },
  methods: {
    onSelect(e, dt, type, indexes) {
      this.loading = true;
      const rowData = handleSelect(dt, indexes);
      const grouping = rowData[0].grouping;
      const documentId = rowData[0].orderid;

      const returnId = this.$props.returnId ?? rowData[0].return_id;
      if (returnId) {
        // Route to return view for document
        this.$router.push({
          name: "return-view",
          params: { returnId: returnId, documentId: documentId },
        });
      } else {
        // Route to standard document view
        const route = {
          name: "document-view",
          params: { type: grouping, documentId: documentId },
          query: {},
        };

        // Enable back button for client view
        if (this.$props.clientId) {
          route.query = { enableBack: 1 };
        }

        this.$router.push(route);
      }
    },
  },
});
</script>
