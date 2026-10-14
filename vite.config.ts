import { fileURLToPath, URL } from "node:url";

import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";

// Unique id of this build, compared against dist/version.json to detect deploys
const buildId = Date.now().toString();

const versionFile = (): Plugin => ({
  name: "version-file",
  apply: "build",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify({ build: buildId }),
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), versionFile()],
  define: {
    __APP_BUILD__: JSON.stringify(buildId),
  },
  resolve: {
    alias: {
      "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js",
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "/",
  build: {
    chunkSizeWarningLimit: 3000,
  },
});
