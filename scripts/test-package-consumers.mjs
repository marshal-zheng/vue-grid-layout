import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = path.join(root, ".tmp", "package-consumers");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const node = process.execPath;

const run = (command, args, cwd = root, extraEnv = {}) => {
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_fund: "false",
      ...extraEnv
    }
  });
};

const write = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
};

if (!fs.existsSync(path.join(root, "dist", "index.cjs"))) {
  run(npm, ["run", "build"]);
}

fs.rmSync(tmpRoot, { recursive: true, force: true });
fs.mkdirSync(tmpRoot, { recursive: true });

const packOutput = execFileSync(npm, ["pack", "--json", "--pack-destination", tmpRoot], {
  cwd: root,
  encoding: "utf8",
  env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" }
});
const packInfo = JSON.parse(packOutput)[0];
const tarball = path.join(tmpRoot, packInfo.filename);

const install = (dir, packages) => {
  write(path.join(dir, "package.json"), JSON.stringify({
    private: true,
    name: `vgl-consumer-${path.basename(dir)}`,
    version: "0.0.0"
  }, null, 2));
  run(npm, ["install", "--ignore-scripts", "--no-package-lock", tarball, ...packages], dir);
};

const esmDir = path.join(tmpRoot, "esm");
install(esmDir, ["vue@^3.2.23"]);
write(path.join(esmDir, "package.json"), JSON.stringify({
  private: true,
  type: "module",
  dependencies: {}
}, null, 2));
write(path.join(esmDir, "index.mjs"), `
import assert from 'node:assert/strict';
import VGL, { VueGridLayout, WidthProvider } from '@marsio/vue-grid-layout';
import * as rootNs from '@marsio/vue-grid-layout';
import { VueGridLayout as CoreGrid } from '@marsio/vue-grid-layout/core';
import { ResponsiveVueGridLayout as ResponsiveGrid } from '@marsio/vue-grid-layout/responsive';
import { createLayoutEngine, executeLayoutOperation, workerLayoutExecutor } from '@marsio/vue-grid-layout/layout-engine';
import { EditorGridLayout, EditorResponsiveGridLayout, createGridEditorController, createGridEditorHistory } from '@marsio/vue-grid-layout/editor';
import { DashboardResponsiveVueGridLayout, serializeDashboardLayoutDocument } from '@marsio/vue-grid-layout/dashboard';
import { runDashboardEditorShellTransaction, useDashboardEditorShell } from '@marsio/vue-grid-layout/dashboard-editor-shell';
import { createWidgetRegistry, materializeWidgetTemplate } from '@marsio/vue-grid-layout/widget-registry';
import { PersistentGridLayout, PersistentResponsiveGridLayout, serializeLayoutDocument } from '@marsio/vue-grid-layout/persistence';
import { runLayoutWorkerRequest } from '@marsio/vue-grid-layout/worker';
assert.equal(VGL, VueGridLayout);
assert.equal(CoreGrid, VueGridLayout);
assert.equal('ResponsiveVueGridLayout' in rootNs, false);
assert.equal('Responsive' in rootNs, false);
assert.equal(typeof ResponsiveGrid, 'object');
assert.equal(typeof WidthProvider, 'function');
assert.equal(typeof createLayoutEngine, 'function');
assert.equal(typeof executeLayoutOperation, 'function');
assert.equal(typeof workerLayoutExecutor, 'function');
assert.equal(typeof EditorGridLayout, 'object');
assert.equal(typeof EditorResponsiveGridLayout, 'object');
assert.equal(typeof createGridEditorController, 'function');
assert.equal(typeof createGridEditorHistory, 'function');
assert.equal(typeof DashboardResponsiveVueGridLayout, 'object');
assert.equal(typeof serializeDashboardLayoutDocument, 'function');
assert.equal(typeof useDashboardEditorShell, 'function');
assert.equal(typeof runDashboardEditorShellTransaction, 'function');
assert.equal(typeof createWidgetRegistry, 'function');
assert.equal(typeof materializeWidgetTemplate, 'function');
assert.equal(typeof PersistentGridLayout, 'object');
assert.equal(typeof PersistentResponsiveGridLayout, 'object');
assert.equal(typeof serializeLayoutDocument, 'function');
assert.equal(typeof runLayoutWorkerRequest, 'function');
`);
run(node, ["index.mjs"], esmDir);

const cjsDir = path.join(tmpRoot, "cjs");
install(cjsDir, ["vue@^3.2.23"]);
write(path.join(cjsDir, "index.cjs"), `
const assert = require('node:assert/strict');
const VGL = require('@marsio/vue-grid-layout');
const core = require('@marsio/vue-grid-layout/core');
const responsive = require('@marsio/vue-grid-layout/responsive');
const engine = require('@marsio/vue-grid-layout/layout-engine');
const editor = require('@marsio/vue-grid-layout/editor');
const dashboard = require('@marsio/vue-grid-layout/dashboard');
const shell = require('@marsio/vue-grid-layout/dashboard-editor-shell');
const widgetRegistry = require('@marsio/vue-grid-layout/widget-registry');
const persistence = require('@marsio/vue-grid-layout/persistence');
const worker = require('@marsio/vue-grid-layout/worker');
assert.equal(VGL.default, VGL);
assert.equal(VGL.VueGridLayout, VGL);
assert.equal(VGL.Responsive, undefined);
assert.equal(VGL.ResponsiveVueGridLayout, undefined);
assert.equal(core.VueGridLayout, VGL);
assert.equal(typeof responsive.ResponsiveVueGridLayout, 'object');
assert.equal(typeof engine.createLayoutEngine, 'function');
assert.equal(typeof engine.executeLayoutOperation, 'function');
assert.equal(typeof editor.createGridEditorController, 'function');
assert.equal(typeof editor.createGridEditorHistory, 'function');
assert.equal(typeof dashboard.DashboardResponsiveVueGridLayout, 'object');
assert.equal(typeof dashboard.serializeDashboardLayoutDocument, 'function');
assert.equal(typeof shell.useDashboardEditorShell, 'function');
assert.equal(typeof shell.runDashboardEditorShellTransaction, 'function');
assert.equal(typeof widgetRegistry.createWidgetRegistry, 'function');
assert.equal(typeof widgetRegistry.materializeWidgetTemplate, 'function');
assert.equal(typeof persistence.PersistentGridLayout, 'object');
assert.equal(typeof persistence.PersistentResponsiveGridLayout, 'object');
assert.equal(typeof persistence.serializeLayoutDocument, 'function');
assert.equal(typeof worker.runLayoutWorkerRequest, 'function');
`);
run(node, ["index.cjs"], cjsDir);

const noPiniaDir = path.join(tmpRoot, "no-pinia");
install(noPiniaDir, ["vue@^3.2.23"]);
write(path.join(noPiniaDir, "package.json"), JSON.stringify({ private: true, type: "module" }, null, 2));
write(path.join(noPiniaDir, "index.mjs"), `
import assert from 'node:assert/strict';
import VGL from '@marsio/vue-grid-layout';
import { VueGridLayout } from '@marsio/vue-grid-layout/core';
import { ResponsiveVueGridLayout } from '@marsio/vue-grid-layout/responsive';
import { createLayoutEngine } from '@marsio/vue-grid-layout/layout-engine';
import { PersistentGridLayout, PersistentResponsiveGridLayout, serializeLayoutDocument } from '@marsio/vue-grid-layout/persistence';
assert.equal(VGL, VueGridLayout);
assert.equal(typeof ResponsiveVueGridLayout, 'object');
assert.equal(typeof createLayoutEngine, 'function');
assert.equal(typeof PersistentGridLayout, 'object');
assert.equal(typeof PersistentResponsiveGridLayout, 'object');
assert.equal(typeof serializeLayoutDocument, 'function');
`);
run(node, ["index.mjs"], noPiniaDir);

const piniaDir = path.join(tmpRoot, "pinia-history");
install(piniaDir, ["vue@^3.2.23", "pinia@^2.1.7"]);
write(path.join(piniaDir, "package.json"), JSON.stringify({ private: true, type: "module" }, null, 2));
write(path.join(piniaDir, "index.mjs"), `
import assert from 'node:assert/strict';
import { createPinia } from 'pinia';
import { createGridHistoryStore } from '@marsio/vue-grid-layout/history';
const store = createGridHistoryStore({ pinia: createPinia(), id: 'consumerHistory' });
store.push([{ i: 'a', x: 0, y: 0, w: 1, h: 1 }]);
assert.equal(store.canUndo, false);
store.push([{ i: 'a', x: 1, y: 0, w: 1, h: 1 }]);
assert.equal(store.canUndo, true);
`);
run(node, ["index.mjs"], piniaDir);

const tsDir = path.join(tmpRoot, "typescript");
install(tsDir, ["vue@^3.2.23", "pinia@^2.1.7", "typescript@^5.2.2"]);
write(path.join(tsDir, "package.json"), JSON.stringify({ private: true, type: "module" }, null, 2));
write(path.join(tsDir, "tsconfig.json"), JSON.stringify({
  compilerOptions: {
    target: "ES2020",
    module: "ESNext",
    moduleResolution: "Bundler",
    strict: true,
    skipLibCheck: true,
    jsx: "preserve"
  },
  include: ["src/**/*.ts"]
}, null, 2));
write(path.join(tsDir, "src", "index.ts"), `
import VGL, { type Layout } from '@marsio/vue-grid-layout';
import { ref } from 'vue';
import { VueGridLayout } from '@marsio/vue-grid-layout/core';
import { ResponsiveVueGridLayout as ResponsiveGrid } from '@marsio/vue-grid-layout/responsive';
import { createLayoutEngine, workerLayoutExecutor } from '@marsio/vue-grid-layout/layout-engine';
import {
  EditorGridLayout,
  EditorResponsiveGridLayout,
  createGridEditorController,
  createGridEditorHistory,
  type GridEditorEventListener,
  type GridEditorHistoryCheckpoint,
  type GridEditorRollbackCheckpoint
} from '@marsio/vue-grid-layout/editor';
import {
  DashboardResponsiveVueGridLayout,
  serializeDashboardLayoutDocument,
  type DashboardDocumentWriteBackOwner
} from '@marsio/vue-grid-layout/dashboard';
import {
  useDashboardEditorShell,
  type DashboardEditorShellActionType,
  type DashboardEditorShellSyntheticCommitData
} from '@marsio/vue-grid-layout/dashboard-editor-shell';
import {
  createWidgetRegistry,
  materializeWidgetTemplate,
  type WidgetTypeDefinition,
  type WidgetInstanceMetadata
} from '@marsio/vue-grid-layout/widget-registry';
import { PersistentGridLayout, PersistentResponsiveGridLayout, serializeLayoutDocument } from '@marsio/vue-grid-layout/persistence';
import { createGridHistoryStore } from '@marsio/vue-grid-layout/history';
import { runLayoutWorkerRequest } from '@marsio/vue-grid-layout/worker';
import '@marsio/vue-grid-layout/style.css';
const layout: Layout = [{ i: 'a', x: 0, y: 0, w: 1, h: 1 }];
const history = createGridEditorHistory();
const checkpoint: GridEditorHistoryCheckpoint = history.checkpoint();
history.restore(checkpoint);
const editor = createGridEditorController({ layout: ref(layout), history });
const listener: GridEditorEventListener = event => void event.type;
const unsubscribe = editor.subscribe(listener);
const rollbackCheckpoint: GridEditorRollbackCheckpoint = editor.createRollbackCheckpoint('consumer');
editor.restoreRollbackCheckpoint(rollbackCheckpoint, 'consumer-restore');
unsubscribe();
const writeBackOwner: DashboardDocumentWriteBackOwner = 'shell';
const shellAction: DashboardEditorShellActionType = 'external-drop';
const syntheticData: DashboardEditorShellSyntheticCommitData = {
  commandId: 'consumer-command',
  commandType: 'add',
  synthesized: true
};
const widgetType: WidgetTypeDefinition = {
  type: 'consumer-kpi',
  version: '1.0.0',
  title: 'Consumer KPI',
  layoutDefaults: { w: 2, h: 2 },
  settings: { fields: [{ id: 'title', type: 'string', defaultValue: 'Revenue' }] }
};
const registry = createWidgetRegistry([widgetType]);
const materialized = materializeWidgetTemplate(registry, { type: 'consumer-kpi' });
const widgetMetadata: WidgetInstanceMetadata | null = materialized.ok ? materialized.instance : null;
const workerUrl = new URL('@marsio/vue-grid-layout/worker', import.meta.url).toString();
void [VGL, VueGridLayout, ResponsiveGrid, createLayoutEngine, workerLayoutExecutor, EditorGridLayout, EditorResponsiveGridLayout, createGridEditorController, createGridEditorHistory, DashboardResponsiveVueGridLayout, PersistentGridLayout, PersistentResponsiveGridLayout, serializeDashboardLayoutDocument, useDashboardEditorShell, serializeLayoutDocument, createGridHistoryStore, runLayoutWorkerRequest, workerUrl, layout, editor, writeBackOwner, shellAction, syntheticData, registry, materialized, widgetMetadata];
`);
write(path.join(tsDir, "src", "negative.ts"), `
import { VueGridLayout } from '@marsio/vue-grid-layout/core';
import { ResponsiveVueGridLayout } from '@marsio/vue-grid-layout/responsive';

type CoreProps = InstanceType<typeof VueGridLayout>['$props'];
type ResponsiveProps = InstanceType<typeof ResponsiveVueGridLayout>['$props'];

// @ts-expect-error lean grid no longer accepts editor.
const badCoreEditor: CoreProps = { editor: false };
// @ts-expect-error lean grid no longer accepts persistence.
const badCorePersistence: CoreProps = { persistence: false };
// @ts-expect-error lean grid no longer accepts historyStore.
const badCoreHistory: CoreProps = { historyStore: {} };
// @ts-expect-error lean responsive no longer accepts editor.
const badResponsiveEditor: ResponsiveProps = { width: 1200, editor: false };
// @ts-expect-error lean responsive no longer accepts persistence.
const badResponsivePersistence: ResponsiveProps = { width: 1200, persistence: false };

void [badCoreEditor, badCorePersistence, badCoreHistory, badResponsiveEditor, badResponsivePersistence];
`);
run(path.join(tsDir, "node_modules", ".bin", "tsc"), ["--noEmit"], tsDir);

const viteDir = path.join(tmpRoot, "vite-browser");
install(viteDir, ["vue@^3.2.23", "vite@^5.4.21", "typescript@^5.2.2"]);
write(path.join(viteDir, "package.json"), JSON.stringify({ private: true, type: "module" }, null, 2));
write(path.join(viteDir, "index.html"), `<div id="app"></div><script type="module" src="/src/main.ts"></script>`);
write(path.join(viteDir, "src", "main.ts"), `
import VGL from '@marsio/vue-grid-layout';
import { createLayoutEngine, workerLayoutExecutor } from '@marsio/vue-grid-layout/layout-engine';
import { runLayoutWorkerRequest } from '@marsio/vue-grid-layout/worker';
import '@marsio/vue-grid-layout/style.css';
const workerUrl = new URL('@marsio/vue-grid-layout/worker', import.meta.url).toString();
const executor = workerLayoutExecutor({ workerUrl });
document.getElementById('app')!.textContent = [VGL.name, typeof createLayoutEngine, typeof runLayoutWorkerRequest, typeof executor.execute].join(':');
`);
run(path.join(viteDir, "node_modules", ".bin", "vite"), ["build"], viteDir);

console.log("package consumer matrix verified");
