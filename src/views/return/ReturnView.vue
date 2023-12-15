<template>
  <div v-loading="loading">
    <div class="card mb-5 mb-xl-10" v-if="returnDoc">
      <div class="card-header border-0 pt-5">
        <h3 class="card-title" v-if="returnDoc.title">
          {{ returnDoc.direction }} atgriešana - {{ returnDoc.title }}
        </h3>
        <div class="card-toolbar">
          <router-link
            class="btn btn-sm btn-light-info me-2"
            type="button"
            :to="{ name: `return-edit` }"
          >
            <i class="fa-solid fa-pencil"></i> Labot atgriešanas informāciju
          </router-link>
          <router-link
            :to="{ name: 'return-list' }"
            class="btn btn-sm btn-light me-2"
          >
            Aizvērt
          </router-link>
        </div>
      </div>
      <div class="card-body pt-3 pb-5 d-flex flex-column">
        <span class="p-2">Datums: {{ returnDoc.date }}</span>
        <span class="p-2" v-if="returnDoc.companyname">Klients: {{ returnDoc.companyname }}</span>
        <span class="p-2"
          >Statuss:
          <span :class="'ms-2 badge badge-' + returnDoc.status.bg">{{
            returnDoc.status.name
          }}</span></span
        >
        <span class="p-2">Komentārs: {{ returnDoc.comment }}</span>
      </div>
    </div>
    <DocumentView v-if="documentId" />
    <template v-else>
      <div class="card mb-5 mb-xl-10">
        <div class="card-header border-0 pt-5">
          <h3 class="card-title">Klienta dokumenti</h3>
          <div class="card-toolbar">
            <router-link
              :to="{
                name: 'document-edit',
                params: { editId: 'new', type: 'return' },
                query: {
                  returnId: $route.params.returnId,
                  orderType: 8,
                  clientId: returnDoc.companyid,
                },
              }"
              class="btn btn-sm btn-light-info me-2"
            >
              Jauns
            </router-link>
          </div>
        </div>
        <div class="card-body pt-0 pb-0">
          <DocumentTable
            v-if="returnDoc.hasClient"
            type="return"
            :return-id="String($route.params.returnId)"
            :return-client="true"
          />
        </div>
      </div>
      <div class="card mb-5 mb-xl-10">
        <div class="card-header border-0 pt-5">
          <h3 class="card-title">Piegādātāja dokumenti</h3>
          <div class="card-toolbar">
            <router-link
              v-if="returnDoc.supplierDocumentType"
              :to="{
                name: 'document-edit',
                params: { editId: 'new', type: 'return' },
                query: {
                  returnId: $route.params.returnId,
                  orderType: returnDoc.supplierDocumentType,
                },
              }"
              class="btn btn-sm btn-light-info me-2"
            >
              Jauns
            </router-link>
          </div>
        </div>
        <div class="card-body pt-0 pb-0">
          <DocumentTable
            v-if="returnDoc.hasSupplier"
            type="return"
            :return-id="String($route.params.returnId)"
            :return-client="false"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import DocumentView from "@/views/document/DocumentView.vue";
import DocumentTable from "@/components/documents/DocumentTable.vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import type { ReturnView } from "@/types/Return";

export default defineComponent({
  name: "return-view",
  components: { DocumentTable, DocumentView },
  setup() {
    const documentId = ref<string | null>(null);
    const route = useRoute();
    const loading = ref<boolean>(false);
    const returnDoc = ref<ReturnView>({
      direction: "",
      title: null,
      comment: "",
      date: "",
      companyname: "",
      status: {
        name: "",
        bg: "",
      },
    } as ReturnView);

    const fetchReturn = async () => {
      loading.value = true;
      await ApiService.get("return", String(route.params.returnId))
        .then((response) => {
          returnDoc.value = response.data;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          push.error("Neizdevās ielādēt atgriešanu");
        })
        .finally(() => {
          loading.value = false;
        });
    };

    // Watch for documentId change
    const iWatcher = watch(
      () => route.params.documentId,
      (newDocumentId) => {
        if (newDocumentId) documentId.value = String(newDocumentId);
        else documentId.value = null;
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      iWatcher();
    });

    return {
      documentId,
      loading,
      fetchReturn,
      returnDoc,
    };
  },
  mounted() {
    this.fetchReturn();
  },
});
</script>
