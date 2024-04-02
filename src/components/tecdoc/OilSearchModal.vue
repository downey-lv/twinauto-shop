<template>
  <div
    class="modal fade"
    id="oil"
    ref="oilModalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <!--begin::Modal dialog-->
    <div class="modal-dialog modal-lg modal-dialog-centered mw-650px">
      <!--begin::Modal content-->
      <div class="modal-content">
        <!--begin::Modal header-->
        <div class="modal-header">
          <!--begin::Modal title-->
          <h2 class="fw-bold">Eļļas meklētājs</h2>
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
          <a href="https://lv.wolflubes.com/en-us/oil-finder" target="_blank"
          >Atvērt Wolf meklētāju</a>
          <ul>
            <li v-for="(item, key) in results" :key="key">
              <a :href="item.url" target="_blank">{{ item.name }}</a>
            </li>
          </ul>
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
import "@/assets/uploader.css";
import { Modal } from "bootstrap";

export default defineComponent({
  name: "oil-search-modal",
  props: {
    vin: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const oilModalRef = ref();
    const loading = ref<boolean>(false);

    // Init modal
    const initModal = () => {
      const modalElement = oilModalRef.value;
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

    const results = ref<any[]>([]);
    function loadData() {
      if (!props.vin) return;

      loading.value = true;
      // Load oil
      ApiService.get("/api/oil", props.vin)
        .then((response) => {
          results.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from oil:`, error);
          push.error(`Neizdevās ielādēt rezultātus`);
        })
        .finally(() => {
          loading.value = false;
        });
    }
    // Setup data load
    const vinWatcher = watch(
      () => props.vin,
      (newVal) => {
        if (newVal) loadData();
      }
    );

    onBeforeUnmount(() => {
      vinWatcher();
    });

    return {
      loading,
      oilModalRef,
      show,
      hide,
      loadData,
      results,
    };
  },
});
</script>
