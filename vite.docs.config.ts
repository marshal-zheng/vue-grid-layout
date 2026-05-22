import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vueJsx from "@vitejs/plugin-vue-jsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const alias = [
  { find: /^@marsio\/vue-grid-layout\/core$/, replacement: path.resolve(__dirname, "lib/entries/core.ts") },
  { find: /^@marsio\/vue-grid-layout\/responsive$/, replacement: path.resolve(__dirname, "lib/entries/responsive.ts") },
  { find: /^@marsio\/vue-grid-layout\/layout-engine$/, replacement: path.resolve(__dirname, "lib/entries/layout-engine.ts") },
  { find: /^@marsio\/vue-grid-layout\/editor$/, replacement: path.resolve(__dirname, "lib/entries/editor.ts") },
  { find: /^@marsio\/vue-grid-layout\/dashboard$/, replacement: path.resolve(__dirname, "lib/entries/dashboard.ts") },
  { find: /^@marsio\/vue-grid-layout\/dashboard-editor-shell$/, replacement: path.resolve(__dirname, "lib/entries/dashboard-editor-shell.ts") },
  { find: /^@marsio\/vue-grid-layout\/persistence$/, replacement: path.resolve(__dirname, "lib/entries/persistence.ts") },
  { find: /^@marsio\/vue-grid-layout\/history$/, replacement: path.resolve(__dirname, "lib/entries/history.ts") },
  { find: /^@marsio\/vue-grid-layout\/worker$/, replacement: path.resolve(__dirname, "lib/entries/worker.ts") },
  { find: /^@marsio\/vue-grid-layout\/style\.css$/, replacement: path.resolve(__dirname, "css/styles.css") },
  { find: /^@marsio\/vue-grid-layout$/, replacement: path.resolve(__dirname, "lib/entries/index.ts") }
];

export default defineConfig({
  root: path.resolve(__dirname, "example"),
  plugins: [vueJsx()],
  resolve: {
    alias,
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"]
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env.DRAGGABLE_DEBUG": JSON.stringify("")
  },
  build: {
    outDir: path.resolve(__dirname, "docs/demo"),
    emptyOutDir: true,
    target: "es2018"
  }
});
