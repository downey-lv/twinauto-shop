<template>
  <div
    class="modal fade"
    id="issue"
    ref="linkageModalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <!--begin::Modal dialog-->
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <!--begin::Modal content-->
      <div class="modal-content">
        <!--begin::Modal header-->
        <div class="modal-header">
          <!--begin::Modal title-->
          <h2 class="fw-bold">Saistītās automašīnas</h2>
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
          <el-input
            v-model="filterText"
            ref="filterTextRef"
            placeholder="Meklēt"
            class="mb-5"
            clearable
          />

          <el-table
            :data="filteredVehicles"
            style="width: 100%"
            :default-sort="{ prop: 'modelDesc', order: 'ascending' }"
            @row-dblclick="openCar"
          >
            <el-table-column property="modelDesc" label="Modelis" sortable />
            <el-table-column property="carDesc" label="Tips" sortable />
            <el-table-column
              property="construction"
              label="Izlaiduma gads"
              width="200"
              sortable
            />
            <el-table-column label="Tilpums" width="100" sortable>
              <template #default="scope">
                {{ scope.row.cylinderCapacity }} cm³
              </template>
            </el-table-column>
            <el-table-column
              property="power"
              label="Jauda"
              width="150"
              sortable
            />
          </el-table>
        </div>
        <!--end::Modal body-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref, watch } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Modal } from "bootstrap";
import type { LinkageVehicle } from "@/types/Linkages";

export default defineComponent({
  name: "linkage-modal",
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const formRef = ref<null | HTMLFormElement>(null);
    const linkageModalRef = ref();
    const loading = ref(false);
    const vehicles = ref<LinkageVehicle[]>([]);
    const manuId = ref();

    // Init modal
    const initModal = () => {
      const modalElement = linkageModalRef.value;
      modal = new Modal(modalElement);
    };

    // Show modal
    let modal;
    const show = (manufacturerId) => {
      manuId.value = manufacturerId;
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

    function loadData() {
      if (
        !props.data.manufacturerId ||
        !props.data.productCode ||
        !manuId.value
      ) {
        return;
      }

      loading.value = true;
      ApiService.get(
        "tecdoc/linkages",
        `${props.data.manufacturerId}/${props.data.productCode}/${manuId.value}`
      )
        .then((response) => {
          vehicles.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from linkages:`, error);
          push.error(`Neizdevās ielādēt automašīnas`);
        })
        .finally(() => {
          loading.value = false;
        });
    }

    // Watch for changes
    const dataWatcher = watch(
      () => [props.data.manufacturerId, props.data.productCode, manuId.value],
      () => {
        loadData();
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      dataWatcher();
    });

    // Filtering
    const filterText = ref("");

    const containsText = (text) =>
      String(text ?? "")
        .toLowerCase()
        .includes(filterText.value.toLowerCase());

    const filteredVehicles = computed(() => {
      return vehicles.value.filter(
        (data) =>
          !filterText.value ||
          containsText(data.modelDesc) ||
          containsText(data.carDesc) ||
          containsText(data.construction) ||
          containsText(data.cylinderCapacity) ||
          containsText(data.power)
      );
    });

    return {
      formRef,
      linkageModalRef,
      show,
      hide,
      vehicles,
      loading,
      filterText,
      filteredVehicles,
    };
  },
  methods: {
    openCar(row) {
      const router = this.$router;
      router.push({
        name: "tecdoc-groups",
        params: {
          makeId: row.manuId,
          modelId: row.modelId,
          carId: row.carId,
        },
      });
      this.hide();
    },
  },
});
</script>
