import type { Router } from "vue-router";

// How often to check for a new deploy
const CHECK_INTERVAL = 5 * 60 * 1000;
// Guard against reload loops when chunks fail to load
const RELOAD_KEY = "app-update-reload";
const RELOAD_GUARD = 60 * 1000;

let updateAvailable = false;

const reload = () => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_GUARD) return;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Storage unavailable, reload anyway
  }
  window.location.reload();
};

const checkVersion = async (notify: (message: string) => void) => {
  if (updateAvailable) return;

  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`,
      { cache: "no-store" }
    );
    if (!response.ok) return;

    const { build } = await response.json();
    if (build && build !== __APP_BUILD__) {
      updateAvailable = true;
      notify("Pieejama jauna versija, tā tiks ielādēta, atverot citu lapu");
    }
  } catch {
    // Offline or server unavailable, try again later
  }
};

// Reload the app after a new version is deployed
export const registerUpdateCheck = (
  router: Router,
  notify: (message: string) => void
) => {
  // Old chunks are gone after a deploy: reload to get the new version
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    reload();
  });

  if (import.meta.env.DEV) return;

  // Reload on the next page change, so no work in progress is lost
  router.afterEach((to, from) => {
    if (updateAvailable && to.fullPath !== from.fullPath) reload();
  });

  setInterval(() => checkVersion(notify), CHECK_INTERVAL);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkVersion(notify);
  });
};
