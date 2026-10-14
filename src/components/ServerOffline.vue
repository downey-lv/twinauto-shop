<template>
  <div v-if="offline" class="server-offline">
    <div class="card shadow-sm">
      <div class="card-body d-flex flex-column align-items-center p-10">
        <div class="spinner-border text-primary mb-5" role="status"></div>
        <div class="fs-3 fw-bold mb-2">Nav savienojuma ar serveri</div>
        <div class="text-muted">Gaidām, kad serveris atkal būs pieejams...</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { storeToRefs } from "pinia";
import { useConnectionStore } from "@/stores/connection";
import { useAuthStore } from "@/stores/auth";
import JwtService from "@/core/services/JwtService";

export default defineComponent({
  name: "server-offline",
  setup() {
    const { offline } = storeToRefs(useConnectionStore());
    const authStore = useAuthStore();

    // Server is back: re-check the session that could not be verified meanwhile
    watch(offline, (isOffline) => {
      if (!isOffline && JwtService.getToken()) authStore.verifyAuth();
    });

    return { offline };
  },
});
</script>

<style scoped>
.server-offline {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}
</style>
