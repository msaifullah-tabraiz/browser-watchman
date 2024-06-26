import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { defineConfig } from "vite";

// "src/welcome.html",
//         "src/offscreen.html",
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        block: resolve(__dirname, "block.html"),
        contentScript: resolve(__dirname, "src/content-script.ts"),
        serviceWorker: resolve(__dirname, "src/service-worker.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
