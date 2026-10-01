<template>
  <div
    class="modal fade"
    ref="revenueModalRef"
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
          <h2 class="fw-bold">{{ header }}</h2>
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
          <el-table :data="data" style="width: 100%" stripe>
            <el-table-column property="title" label="Dokumenta veids" />
            <el-table-column property="document" label="Dokuments" />
            <el-table-column property="value" label="Summa" />
            <el-table-column width="150">
              <template #default="scope">
                <a
                  v-if="scope.row.eshopId"
                  :href="`https://vide-jauns.twinauto.lv/eshop/order/view/${scope.row.eshopId}`"
                  class="text-info fw-bold"
                  target="_blank"
                  >Atvērt dokumentu</a
                >
                <router-link
                  v-else-if="scope.row.orderId"
                  :to="{
                    name: `document-view`,
                    params: {
                      documentId: scope.row.orderId,
                      type: scope.row.orderGrouping,
                    },
                    query: { enableBack: 1 },
                  }"
                  @click="hide()"
                  class="text-info fw-bold"
                  >Atvērt dokumentu</router-link
                >
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
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Modal } from "bootstrap";

export default defineComponent({
  name: "daily-revenue-modal",
  props: {
    revenueData: {
      type: Object,
      required: false,
    },
  },
  setup(props) {
    const revenueModalRef = ref();
    const loading = ref<boolean>(false);
    const header = ref("");

    // Init modal
    const initModal = () => {
      const modalElement = revenueModalRef.value;
      modal = new Modal(modalElement);
    };

    // Show modal
    let modal;
    const show = () => {
      if (!modal) {
        initModal();
      }
      modal.show();
    };

    // Hide modal
    const hide = () => {
      if (modal) {
        modal.hide();
      }
    };

    const data = ref([]);
    function loadData() {
      const d = props.revenueData;
      if (!d) {
        return;
      }

      // Set header
      header.value = `${d.workstation} - ${d.header}`;

      // Set query
      const query = {};
      if (d.date) query["date"] = d.date;

      loading.value = true;
      // Load payments
      ApiService.get(
        "data/daily/revenue",
        `${d.workstation}/${d.source}/${d.type}/`,
        query
      )
        .then((response) => {
          data.value = response.data;
        })
        .catch((error) => {
          data.value = [];
          console.error(`Error fetching data from daily revenue:`, error);
          push.error(`Neizdevās ielādēt`);
        })
        .finally(() => {
          loading.value = false;
        });
    }

    const dataWatcher = watch(
      () => props.revenueData,
      (newVal) => {
        if (newVal) loadData();
      }
    );

    onBeforeUnmount(() => {
      dataWatcher();
    });

    return {
      data,
      header,
      loading,
      revenueModalRef,
      show,
      hide,
    };
  },
});
</script>
