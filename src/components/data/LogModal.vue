<template>
  <div
    class="modal fade"
    id="logs"
    ref="logModalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <!--begin::Modal dialog-->
    <div
      class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
    >
      <!--begin::Modal content-->
      <div class="modal-content">
        <!--begin::Modal header-->
        <div class="modal-header">
          <!--begin::Modal title-->
          <h2 class="fw-bold">Izmaiņas</h2>
          <!--end::Modal title-->

          <!--begin::Close-->
          <div
            @click="hide()"
            class="btn btn-icon btn-sm btn-active-icon-primary"
          >
            <KTIcon icon-name="cross" icon-class="fs-1" />
          </div>
          <!--end::Close-->
        </div>
        <!--end::Modal header-->

        <!--begin::Modal body-->
        <div class="modal-body py-10 px-lg-10" v-loading="loading">
          <el-table :data="log" style="width: 100%" stripe>
            <el-table-column
              property="operation"
              label="Darbība"
              width="100"
              :filters="[
                { text: 'UPDATE', value: 'UPDATE' },
                { text: 'INSERT', value: 'INSERT' },
                { text: 'DELETE', value: 'DELETE' },
                { text: 'VIEW', value: 'VIEW' },
              ]"
              :filter-method="filterHandler"
            />
            <el-table-column property="changes" label="Izmaiņas">
              <template #default="scope">
                <div v-for="(item, field) in scope.row.changes" :key="field">
                  <b>{{ field }}: </b>
                  <template
                    v-for="(change, index) in getChanges(item)"
                    :key="index"
                  >
                    <span v-if="change.added" class="text-info">{{
                      change.value
                    }}</span>
                    <span
                      v-else-if="change.removed"
                      class="text-decoration-line-through"
                      >{{ change.value }}</span
                    >
                    <span v-else>{{ change.value }}</span>
                  </template>
                </div>
              </template>
            </el-table-column>
            <el-table-column property="user" label="Lietotājs" width="100" />
            <el-table-column property="date" label="Laiks" width="200">
              <template #default="scope">
                {{
                  DateTime.fromISO(scope.row.date)
                    .setLocale("lv")
                    .toLocaleString(DateTime.DATETIME_MED)
                }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!--end::Modal body-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Modal } from "bootstrap";
import { DateTime } from "luxon";
import type { TableColumnCtx } from "element-plus";
import { diffChars } from "diff";
import type { Change } from "diff";

interface Log {
  operation: string;
  changes: object;
  user: string;
  date: string;
}

export default defineComponent({
  name: "log-modal",
  computed: {
    DateTime() {
      return DateTime;
    },
  },
  props: {
    logType: {
      type: String,
      required: true,
    },
    logID: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const logModalRef = ref();
    const loading = ref<boolean>(false);

    // Init modal
    const initModal = () => {
      const modalElement = logModalRef.value;
      modal = new Modal(modalElement);
    };

    // Show modal
    let modal;
    const show = () => {
      if (!modal) {
        initModal();
      }
      loadData();
      modal.show();
    };

    // Hide modal
    const hide = () => {
      if (modal) {
        modal.hide();
      }
    };

    const log = ref<Log[]>([]);
    function loadData() {
      // Load payments
      ApiService.get("data/log", `${props.logType}/${props.logID}`)
        .then((response) => {
          log.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from audit log:`, error);
          push.error(`Neizdevās ielādēt vēsturi`);
        });
    }

    return {
      log,
      loading,
      logModalRef,
      show,
      hide,
    };
  },
  methods: {
    filterHandler(value: string, row: Log, column: TableColumnCtx<Log>) {
      const property = column.property;
      return row[property] === value;
    },
    getChanges(item) {
      try {
        return diffChars(item.from || "", item.to || "");
      } catch (e) {
        return [
          {
            added: false,
            removed: false,
            value: `${item.from} -> ${item.to}`,
          },
        ] as Change[];
      }
    },
  },
});
</script>
