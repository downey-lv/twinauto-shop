<template>
  <div
    class="modal fade"
    ref="pdfModalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <!--begin::Modal dialog-->
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <!--begin::Modal content-->
      <div class="modal-content">
        <!--begin::Modal header-->
        <div class="modal-header py-4">
          <!--begin::Modal title-->
          <h2 class="fw-bold text-truncate mb-0">{{ title }}</h2>
          <!--end::Modal title-->

          <div class="d-flex align-items-center gap-2">
            <a
              v-if="url"
              :href="url"
              target="_blank"
              class="btn btn-sm btn-light"
              title="Atvērt jaunā cilnē"
            >
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
            <!--begin::Close-->
            <div
              @click="hide()"
              class="btn btn-icon btn-sm btn-active-icon-primary"
            >
              <KTIcon icon-name="cross" icon-class="fs-1" />
            </div>
            <!--end::Close-->
          </div>
        </div>
        <!--end::Modal header-->

        <!--begin::Modal body-->
        <div class="modal-body p-0 pdf-modal-body" v-loading="loading">
          <iframe v-if="url" :src="url" class="pdf-frame"></iframe>
        </div>
        <!--end::Modal body-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { Modal } from "bootstrap";

export default defineComponent({
  name: "pdf-modal",
  setup() {
    const pdfModalRef = ref<HTMLElement>();
    const loading = ref<boolean>(false);
    const url = ref<string>("");
    const title = ref<string>("");
    let modal: Modal | undefined;

    const releaseUrl = () => {
      if (url.value) URL.revokeObjectURL(url.value);
      url.value = "";
    };

    // Show modal and load PDF
    const show = (resource: string, slug = "", modalTitle = "PDF") => {
      if (!modal && pdfModalRef.value) modal = new Modal(pdfModalRef.value);
      releaseUrl();
      title.value = modalTitle;
      loading.value = true;
      modal?.show();

      ApiService.pdfUrl(resource, slug)
        .then((fileURL) => {
          url.value = fileURL;
        })
        .catch((error) => {
          console.error("Neizdevās ielādēt PDF:", error);
          push.error("Neizdevās ielādēt PDF");
          modal?.hide();
        })
        .finally(() => {
          loading.value = false;
        });
    };

    // Hide modal
    const hide = () => {
      modal?.hide();
    };

    onMounted(() => {
      pdfModalRef.value?.addEventListener("hidden.bs.modal", releaseUrl);
    });
    onBeforeUnmount(() => {
      pdfModalRef.value?.removeEventListener("hidden.bs.modal", releaseUrl);
      modal?.dispose();
      releaseUrl();
    });

    return {
      pdfModalRef,
      loading,
      url,
      title,
      show,
      hide,
    };
  },
});
</script>

<style scoped>
.pdf-modal-body {
  height: 85vh;
}
.pdf-frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
</style>
