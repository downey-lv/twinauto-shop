<template>
  <div class="row g-5 g-xl-8">
    <div class="col-xl-3">
      <TecdocCarSelection
        widget-classes="mb-xl-8"
        @update:tecDocData="handleTecDocDataUpdate"
        ref="tecdocRef"
      />
      <TecdocCarHistory widget-classes="mb-xl-8" />
    </div>
    <div class="col-xl">
      <div class="card">
        <!--begin::Body-->
        <div class="card-body pt-5">
          <template v-for="(item, index) in dt" :key="index">
            <DataTable
              ref="table"
              v-if="localTecDocData.type == String(index)"
              :id="index"
              :columns="item.columns"
              :data="localTecDocData.data.raw"
              :options="dtOptions"
              class="table table-hover table-row-bordered gy-5"
              @select="onSelect"
            >
              <thead>
                <tr class="fw-bolder text-dark p-4">
                  <th v-for="(header, index) in item.headers" :key="index">
                    {{ header }}
                  </th>
                </tr>
              </thead>
            </DataTable>
          </template>
        </div>
        <!--end::Body-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import TecdocCarSelection from "@/components/tecdoc/TecdocCarSelection.vue";
import type { ElTable } from "element-plus";
import {
  getDtOptions,
  handleSelect,
  transformDtSource,
} from "@/assets/ts/layout/dtOptions";
import TecdocCarHistory from "@/components/tecdoc/TecdocCarHistory.vue";

export default defineComponent({
  name: "car-selection",
  components: {
    TecdocCarHistory,
    TecdocCarSelection,
  },
  setup() {
    const localTecDocData = ref({ data: { raw: {} }, type: "" });

    let dtOptions = getDtOptions(1, false);
    dtOptions["select"] = true;
    dtOptions["order"] = [
      [0, "desc"],
      [1, "asc"],
    ];

    const dtId = {
      make: "manuId",
      model: "modelId",
      car: "carId",
    };

    let dtSource = {
      make: {
        favoured: "",
        manuName: "Ražotājs",
      },
      model: {
        favoured: "",
        modelname: "Modelis",
        construction: "Izlaiduma gads",
      },
      car: {
        favoured: "",
        carName: "Tips",
        construction: "Izlaiduma gads",
        power: "Jauda",
        cylinderCapacity: "Tilpums",
        motorCodes: "Motora kods",
      },
    };

    const columnOptions = {
      make: {
        favoured: {
          searchable: false,
          visible: false,
        },
      },
      model: {
        favoured: {
          searchable: false,
          visible: false,
        },
      },
      car: {
        favoured: {
          searchable: false,
          visible: false,
        },
      },
    };

    const dt = transformDtSource(dtSource, columnOptions);

    const handleTecDocDataUpdate = (updatedData) => {
      localTecDocData.value = updatedData;
    };

    return {
      handleTecDocDataUpdate,
      localTecDocData,
      dtOptions,
      dt,
      dtId,
    };
  },
  methods: {
    selectValue(field, value) {
      (this.$refs.tecdocRef as typeof ElTable).setValue(field, value, false);
    },
    onSelect(e, dt, type, indexes) {
      const rowData = handleSelect(dt, indexes);
      const tableType = dt.table().node().id;
      this.selectValue(tableType, rowData[0][this.dtId[tableType]]);
    },
  },
});
</script>
