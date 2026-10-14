import { ref } from "vue";
import { defineStore } from "pinia";

// How often to check if the server is back
const CHECK_INTERVAL = 3000;

export const useConnectionStore = defineStore("connection", () => {
  const offline = ref(false);
  let timer: ReturnType<typeof setInterval> | null = null;

  const isServerUp = async (baseUrl: string) => {
    try {
      const response = await fetch(`${baseUrl}/public/health`, {
        cache: "no-store",
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // Server could not be reached: check until it responds again
  function setOffline(baseUrl: string) {
    if (offline.value) return;
    offline.value = true;

    timer = setInterval(async () => {
      if (!(await isServerUp(baseUrl))) return;

      if (timer) clearInterval(timer);
      timer = null;
      offline.value = false;
    }, CHECK_INTERVAL);
  }

  return {
    offline,
    setOffline,
  };
});
