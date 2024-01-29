<template>
  <div class="card" v-loading="loading">
    <div class="card-header border-0 pt-5" v-if="$slots.header">
      <slot name="header"></slot>
    </div>
    <div class="card-body pt-0">
      <el-collapse v-if="criteria.length > 0">
        <el-collapse-item title="Filtrs" name="1">
          <template #title>
            Filtrs
            <span
              class="badge badge-circle badge-primary ms-2"
              v-if="filterCount > 0"
            >
              {{ filterCount }}
            </span>
          </template>

          <template v-for="(row, index) in criteria" :key="index">
            <el-select
              v-model="filterCriteria[row.id]"
              class="m-2"
              :placeholder="row.label"
              style="width: 240px"
              clearable
              multiple
              filterable
            >
              <el-option
                v-for="item in row.values"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-collapse-item>
      </el-collapse>
      <Notice
        v-if="countWarning"
        classes="rounded-3 mb-3"
        color="warning"
        body="Pārāk daudz rezultātu, atlasīti tikai pirmie 1000"
      ></Notice>
      <DataTable
        ref="table"
        id="parts"
        :columns="dt.parts.columns"
        :data="parts"
        :options="dtOptions"
        class="table table-hover table-row-bordered gy-5 align-middle"
        @select="onSelect"
        @deselect="onSelect"
        :key="tabsKey"
      >
        <thead>
          <tr class="fw-bolder text-dark p-4">
            <th v-for="(header, index) in dt.parts.headers" :key="index">
              {{ header }}
            </th>
          </tr>
        </thead>
      </DataTable>
    </div>
  </div>

  <ImageHover />
</template>

<script lang="ts">
import {
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
} from "@/assets/ts/layout/dtOptions";
import { useProductStore } from "@/stores/product";
import Notice from "@/components/core/Notice.vue";
import { useRoute } from "vue-router";
import ApiService from "@/core/services/ApiService";
import ImageHover from "@/components/product/ImageHover.vue";
import type { WatchStopHandle } from "vue";
import type { Criteria, CriteriaFiltered } from "@/types/FilterCriteria";

export default defineComponent({
  components: {
    ImageHover,
    Notice,
  },
  props: {
    resource: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    query: {
      type: Object,
      required: false,
    },
  },
  setup(props) {
    const loading = ref<boolean>(false);
    const parts = ref();
    const countWarning = ref(false);
    const route = useRoute();
    const tabsKey = ref(0);
    const table = ref();
    const criteria = ref<Criteria[]>([]);
    const filterCriteria = ref<CriteriaFiltered>({});
    const watcherHandles: WatchStopHandle[] = [];

    // Setup data load
    const loadData = async () => {
      if (props.resource && props.slug) {
        loading.value = true;

        let query = props.query;
        // Add filterCtriteria
        if (Object.keys(filterCriteria.value).length > 0) {
          query = {
            ...query,
            filterCriteria: filterCriteria.value,
          };
        }

        ApiService.get(props.resource, props.slug, query)
          .then((response) => {
            const data = response.data;

            if (props.query && "includeCriteria" in props.query) {
              parts.value = data.data;
              if (criteria.value.length === 0) criteria.value = data.criteria;
            } else {
              parts.value = data;
            }

            tabsKey.value += 1;

            countWarning.value =
              ["all", "text"].includes(String(route.params.type)) &&
              parts.value.length >= 1000;
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          })
          .finally(() => {
            // Reset table to the default order
            const dtObj = table.value.dt;
            dtObj.order(dtOptions["order"]).draw();

            loading.value = false;
          });
      }
    };

    // Fetch data when the component is first loaded
    onMounted(loadData);

    // React to changes in URL
    const pWatcher = watch(
      () => [props.slug, props.query], // watching the URL prop
      ([newSlug, newQuery], [prevSlug, prevQuery]) => {
        if (newSlug !== prevSlug || newQuery !== prevQuery) {
          filterCriteria.value = {};
          loadData();
        }
      }
    );
    watcherHandles.push(pWatcher);

    // Filter counter
    const filterCount = ref(0);

    // React to changes in filterCriteria
    const fWatcher = watch(
      filterCriteria,
      () => {
        // Set filter count
        let count = 0;
        for (const key in filterCriteria.value) {
          if (
            Array.isArray(filterCriteria.value[key]) &&
            filterCriteria.value[key].length > 0
          ) {
            count++;
          }
        }
        filterCount.value = count;

        loadData();
      },
      { deep: true }
    );
    watcherHandles.push(fWatcher);

    // Define datatable
    let dtOptions = getDtOptions(1);
    dtOptions["select"] = true;
    dtOptions["order"] = [
      [10, "desc"], // Exact match
      [6, "desc"], // Rest
      [0, "desc"], // ID
      [7, "desc"], // Rest supplier
    ];

    let existingFunction = dtOptions["initComplete"];
    dtOptions["initComplete"] = function (settings, json) {
      // First run the existing function, if it's defined
      if (typeof existingFunction === "function") {
        existingFunction(settings, json);
      }

      // Get all 'th' elements in the document
      const thElements = document.getElementsByTagName("th");

      // Loop through all 'th' elements
      for (var i = 0; i < thElements.length; i++) {
        // Check if the text content of the current 'th' element includes "Veikalā"
        if ((thElements[i].textContent || "").includes("Veikalā")) {
          // If it includes "Veikalā", remove the 'fs-3' class from this 'th' element
          thElements[i].classList.remove("fs-3", "fw-bold");
        }
      }
    };

    let dtSource = {
      parts: {
        productid: "ID",
        code: "Kods",
        producer: "Ražotājs",
        name: "Nosaukums",
        comment: "Komentārs",
        priceSell: "Cena",
        rest: "Veikalā",
        restSupplier: "Noliktavā",
        sold6Months: "6 mēn.",
        codeAlphanum: "",
        exactMatch: "",
        staleProduct: "",
      },
    };

    const columnOptions = {
      parts: {
        productid: {
          createdCell: function (td, cellData, rowData, row, col) {
            if (rowData.images?.[0]) {
              td.setAttribute(
                "onmouseover",
                `showImage('${rowData.images?.[0]}')`
              );
              td.setAttribute("onmouseleave", `showImage()`);
            }
          },
        },
        name: {
          width: "350px",
        },
        priceSell: {
          width: "90px",
        },
        rest: {
          width: "90px",
          className: "fs-3 fw-bold text-center",
        },
        restSupplier: {
          width: "90px",
          className: "text-center",
        },
        sold6Months: {
          width: "90px",
          className: "text-muted text-center",
        },
        exactMatch: {
          visible: false,
        },
        codeAlphanum: {
          visible: false,
        },
        producer: {
          width: "80px",
          render: function (data, type, row) {
            // Check if manufacturerimage is not blank and render it
            if (row.producerimage) {
              return `<img src="${row.producerimage}" alt="${data}" style="max-width: 80px; max-height: 40px" /><span style="display:none;">${data}</span>`;
            }
            // Otherwise, just return the manufacturer data
            return data;
          },
        },
        staleProduct: {
          width: "30px",
          searchable: false,
          render: function (data, type, row) {
            if (row.important)
              return `<i class="fa-solid fa-fw fa-star text-info fs-2" title="Svarīgs produkts"></i>`;
            if (data)
              return `<i class="fa-duotone fa-fw fa-triangle-exclamation text-warning fs-2" title="Nav pārdots 6 mēnešus"></i>`;
            if (row.topProduct)
              return `<i class="fa-duotone fa-fw fa-trophy-star text-success fs-2" title="Top produkts"></i>`;
            return "";
          },
        },
      },
    };

    const dt = transformDtSource(dtSource, columnOptions);

    onBeforeUnmount(() => {
      watcherHandles.forEach((stop) => stop());
    });

    return {
      parts,
      dtSource,
      dtOptions,
      dt,
      loading,
      countWarning,
      tabsKey,
      table,
      criteria,
      filterCriteria,
      filterCount,
    };
  },
  methods: {
    onSelect(e, dt, type, indexes) {
      const rowData = handleSelect(dt, indexes);
      const productStore = useProductStore();
      productStore.setProduct(rowData);
    },
  },
});
</script>
