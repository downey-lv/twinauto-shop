<template>
  <div class="card">
    <div class="card-body">
      <p v-if="!error" role="status">Atver dokumentu…</p>
      <div v-else role="alert">
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="openDocument">Mēģināt vēlreiz</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ApiService from "@/core/services/ApiService";

const route = useRoute();
const router = useRouter();
const error = ref("");

async function openDocument() {
  const id = String(route.params.documentId);
  error.value = "";
  if (!/^[1-9]\d*$/.test(id)) {
    error.value = "Nederīgs dokumenta ID";
    return;
  }
  try {
    const { data } = await ApiService.get("document/resolve", id);
    if (String(route.params.documentId) !== id) return;
    if (data.return_id) {
      await router.replace({
        name: "return-view",
        params: { returnId: String(data.return_id), documentId: id },
      });
    } else if (data.grouping) {
      await router.replace({
        name: "document-view",
        params: { type: data.grouping, documentId: id },
      });
    } else {
      error.value = "Neizdevās noteikt dokumenta tipu";
    }
  } catch (failure: any) {
    if (String(route.params.documentId) !== id) return;
    if ([401, 403].includes(failure.response?.status)) {
      await router.replace({ name: "sign-in", query: { redirect: route.fullPath } });
      return;
    }
    error.value = failure.response?.status === 404
      ? "Dokuments nav atrasts"
      : "Neizdevās atvērt dokumentu";
  }
}

watch(() => route.params.documentId, openDocument, { immediate: true });
</script>
