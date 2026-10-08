<template>
  <div v-loading="loading">
    <div class="card mb-5 mb-xl-10" v-if="returnDoc">
      <div class="card-header border-0 pt-5">
        <h3 class="card-title" v-if="returnDoc.title">
          {{ returnDoc.direction }} atgriešana - {{ returnDoc.title }}
        </h3>
        <div class="card-toolbar">
          <el-popconfirm
            v-if="!returnDoc.hasSupplier && !returnDoc.hasClient"
            confirm-button-text="Dzēst"
            cancel-button-text="Atcelt"
            confirm-button-type="danger"
            :title="`Izdzēst atgriešanu?`"
            :width="300"
            @confirm="deleteReturn()"
          >
            <template #reference>
              <button class="btn btn-sm btn-light-danger me-2">Dzēst</button>
            </template>
          </el-popconfirm>
          <button
            v-if="!returnDoc.internal && returnDoc.return_type !== 1"
            type="button"
            class="btn btn-sm btn-light me-2"
            @click="printReturn()"
          >
            <i class="fa-solid fa-fw fa-print"></i> Drukāt pieteikumu
          </button>
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
      <div class="card-body pt-3 pb-5">
        <div class="row">
          <div class="col d-flex flex-column">
            <span class="p-2">Datums: {{ returnDoc.date }}</span>
            <span class="p-2" v-if="returnDoc.companyname"
              >Klients: {{ returnDoc.companyname }}</span
            >
            <span class="p-2"
              >Statuss:
              <span :class="'ms-2 badge badge-' + returnDoc.status.bg">{{
                returnDoc.status.name
              }}</span></span
            >
            <span class="p-2">Komentārs: {{ returnDoc.return_comment }}</span>
          </div>
          <div class="col" v-if="returnDoc.vehicle_information">
            <template
              v-for="(value, key) in returnDoc.vehicle_information"
              :key="key"
            >
              <div class="row">
                <div class="col">{{ key }}</div>
                <div class="col">{{ value }}</div>
              </div>
            </template>
          </div>
        </div>
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
    <PdfModal ref="pdfModal" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import DocumentView from "@/views/document/DocumentView.vue";
import DocumentTable from "@/components/documents/DocumentTable.vue";
import ApiService from "@/core/services/ApiService";
import PdfModal from "@/components/data/PdfModal.vue";
import { push } from "@/main";
import type { ReturnView } from "@/types/Return";

export default defineComponent({
  name: "return-view",
  components: { DocumentTable, DocumentView, PdfModal },
  setup() {
    const documentId = ref<string | null>(null);
    const route = useRoute();
    const loading = ref<boolean>(false);
    const returnDoc = ref<ReturnView>({
      direction: "",
      title: null,
      return_comment: "",
      date: "",
      companyname: "",
      status: {
        name: "",
        bg: "",
      },
      internal: false,
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
  methods: {
    deleteReturn() {
      ApiService.delete(`return/${this.$route.params.returnId}`)
        .then(() => {
          push.success("Atgriešana izdzēsta");
          this.$router.push({ name: "return-list" });
        })
        .catch(() => {
          push.error("Neizdevās izdzēst atgriešanu");
        });
    },
    printReturn() {
      (this.$refs.pdfModal as any).show(
        "return/print",
        String(this.$route.params.returnId),
        "Atgriešana"
      );
    },
  },
});
</script>
