import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import pkg from "./package.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const entryPoints = {
  index: path.resolve(__dirname, "lib/entries/index.ts"),
  core: path.resolve(__dirname, "lib/entries/core.ts"),
  responsive: path.resolve(__dirname, "lib/entries/responsive.ts"),
  "layout-engine": path.resolve(__dirname, "lib/entries/layout-engine.ts"),
  editor: path.resolve(__dirname, "lib/entries/editor.ts"),
  dashboard: path.resolve(__dirname, "lib/entries/dashboard.ts"),
  "dashboard-editor-shell": path.resolve(__dirname, "lib/entries/dashboard-editor-shell.ts"),
  "widget-registry": path.resolve(__dirname, "lib/entries/widget-registry.ts"),
  persistence: path.resolve(__dirname, "lib/entries/persistence.ts"),
  history: path.resolve(__dirname, "lib/entries/history.ts"),
  worker: path.resolve(__dirname, "lib/entries/worker.ts")
};

const runtimeExternalPackages = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  "vue",
  "pinia"
]);

const isExternal = (id: string) => {
  if (id.startsWith(".") || path.isAbsolute(id)) return false;
  return Array.from(runtimeExternalPackages).some(name => id === name || id.startsWith(`${name}/`));
};

const packageAliases = [
  { find: /^@marsio\/vue-grid-layout\/core$/, replacement: path.resolve(__dirname, "lib/entries/core.ts") },
  { find: /^@marsio\/vue-grid-layout\/responsive$/, replacement: path.resolve(__dirname, "lib/entries/responsive.ts") },
  { find: /^@marsio\/vue-grid-layout\/layout-engine$/, replacement: path.resolve(__dirname, "lib/entries/layout-engine.ts") },
  { find: /^@marsio\/vue-grid-layout\/editor$/, replacement: path.resolve(__dirname, "lib/entries/editor.ts") },
  { find: /^@marsio\/vue-grid-layout\/dashboard$/, replacement: path.resolve(__dirname, "lib/entries/dashboard.ts") },
  { find: /^@marsio\/vue-grid-layout\/dashboard-editor-shell$/, replacement: path.resolve(__dirname, "lib/entries/dashboard-editor-shell.ts") },
  { find: /^@marsio\/vue-grid-layout\/widget-registry$/, replacement: path.resolve(__dirname, "lib/entries/widget-registry.ts") },
  { find: /^@marsio\/vue-grid-layout\/persistence$/, replacement: path.resolve(__dirname, "lib/entries/persistence.ts") },
  { find: /^@marsio\/vue-grid-layout\/history$/, replacement: path.resolve(__dirname, "lib/entries/history.ts") },
  { find: /^@marsio\/vue-grid-layout\/worker$/, replacement: path.resolve(__dirname, "lib/entries/worker.ts") },
  { find: /^@marsio\/vue-grid-layout\/style\.css$/, replacement: path.resolve(__dirname, "css/styles.css") },
  { find: /^@marsio\/vue-grid-layout$/, replacement: path.resolve(__dirname, "lib/entries/index.ts") }
];

export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    plugins: [vueJsx()],
    resolve: {
      alias: packageAliases,
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"]
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || (isBuild ? "production" : "development")),
      "process.env.DRAGGABLE_DEBUG": JSON.stringify(process.env.DRAGGABLE_DEBUG || "")
    },
    server: {
      host: "0.0.0.0",
      open: "/"
    },
    build: {
      emptyOutDir: false,
      lib: {
        entry: entryPoints,
        formats: ["es", "cjs"],
        fileName: (format, entryName) => {
          if (format === "es") return `${entryName}.mjs`;
          return entryName === "index" ? "index.runtime.cjs" : `${entryName}.cjs`;
        }
      },
      rollupOptions: {
        external: isExternal,
        output: {
          exports: "named"
        }
      },
      sourcemap: false,
      target: "es2018"
    }
  };
});
