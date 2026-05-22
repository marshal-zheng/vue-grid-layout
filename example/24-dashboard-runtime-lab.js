import { createApp, computed, onBeforeUnmount, onMounted, ref, watch } from "vue/dist/vue.esm-bundler.js";
import { createPinia } from "pinia";
import {
  DASHBOARD_SCHEMA_VERSION,
  DashboardResponsiveVueGridLayout,
  migrateDashboardLayoutSettings,
  repairDashboardLayoutCollisions,
  resolveDashboardResponsiveProfile,
  serializeDashboardLayoutDocument,
  writeDashboardResponsiveRuntimeToDocument
} from "@marsio/vue-grid-layout/dashboard";
import { bindKeyboardShortcuts, useGridHistoryStore } from "@marsio/vue-grid-layout/history";

const style = document.createElement("style");
style.textContent = `
  .dashboard-migration-example {
    --surface: #ffffff;
    --canvas: #f3f2f1;
    --panel: #faf9f8;
    --border: #edebe9;
    --border-strong: #c8c6c4;
    --text: #323130;
    --muted: #605e5c;
    --subtle: #8a8886;
    --accent: #0078d4;
    --accent-dark: #106ebe;
    --warning: #8a6a00;
    --danger: #a4262c;
    color: var(--text);
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
  }

  .dashboard-migration-example * {
    box-sizing: border-box;
  }

  .dashboard-migration-example h1,
  .dashboard-migration-example h2,
  .dashboard-migration-example h3,
  .dashboard-migration-example p {
    margin: 0;
  }

  .demo-header {
    align-items: flex-start;
    display: flex;
    gap: 16px;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .demo-title {
    display: grid;
    gap: 4px;
    max-width: 860px;
  }

  .demo-title h1 {
    color: #201f1e;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0;
  }

  .demo-title p {
    color: var(--muted);
    font-size: 13px;
  }

  .demo-state {
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 4px;
    display: flex;
    gap: 8px;
    min-height: 32px;
    padding: 6px 10px;
    white-space: nowrap;
  }

  .state-dot {
    background: #107c10;
    border-radius: 50%;
    height: 8px;
    width: 8px;
  }

  .demo-state.warning .state-dot {
    background: var(--warning);
  }

  .demo-state.error .state-dot {
    background: var(--danger);
  }

  .demo-state span:last-child {
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
  }

  .command-bar {
    align-items: stretch;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    margin-bottom: 16px;
    min-height: 44px;
  }

  .command-group {
    align-items: center;
    border-right: 1px solid var(--border);
    display: flex;
    gap: 6px;
    padding: 6px 10px;
  }

  .command-group:last-child {
    border-right: 0;
  }

  .command-label {
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
    margin-right: 4px;
  }

  .command-button {
    appearance: none;
    background: var(--surface);
    border: 1px solid transparent;
    border-radius: 2px;
    color: var(--text);
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    min-height: 30px;
    padding: 5px 10px;
  }

  .command-button:hover {
    background: #f3f2f1;
    border-color: var(--border-strong);
  }

  .command-button:disabled {
    color: var(--subtle);
    cursor: default;
    opacity: 0.55;
  }

  .command-button:disabled:hover {
    background: var(--surface);
    border-color: transparent;
  }

  .command-button.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #ffffff;
    font-weight: 600;
  }

  .command-button.primary:hover {
    background: var(--accent-dark);
    border-color: var(--accent-dark);
  }

  .command-button.selected {
    background: #eff6fc;
    border-color: #c7e0f4;
    color: #004578;
    font-weight: 600;
  }

  .work-area {
    align-items: start;
    display: grid;
    gap: 16px;
    grid-template-columns: minmax(0, 1fr) 360px;
  }

  .canvas-panel,
  .side-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    min-width: 0;
  }

  .canvas-panel {
    overflow: hidden;
  }

  .panel-header {
    align-items: flex-start;
    border-bottom: 1px solid var(--border);
    display: flex;
    gap: 16px;
    justify-content: space-between;
    padding: 12px 14px;
  }

  .panel-heading {
    display: grid;
    gap: 2px;
  }

  .panel-heading h2,
  .side-section h3 {
    color: #201f1e;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0;
  }

  .panel-heading span {
    color: var(--muted);
    font-size: 12px;
  }

  .compact-meta {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }

  .meta-item {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--muted);
    font-size: 12px;
    padding: 4px 7px;
    white-space: nowrap;
  }

  .dashboard-canvas {
    background: var(--canvas);
    min-height: 380px;
  }

  .dashboard-canvas.vue-grid-layout {
    margin-top: 0;
  }

  .dashboard-canvas .vue-grid-item:not(.vue-grid-placeholder) {
    background: transparent;
    border: 0;
  }

  .dashboard-canvas .vue-grid-placeholder {
    background: rgba(0, 120, 212, 0.12);
    border: 1px dashed var(--accent);
  }

  .widget-slot {
    height: 100%;
    min-width: 0;
  }

  .widget-card {
    background: var(--surface);
    border: 1px solid var(--border-strong);
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100%;
    min-width: 0;
    padding: 12px;
  }

  .widget-card.warning {
    border-left: 3px solid var(--warning);
  }

  .widget-card.locked {
    background: #faf9f8;
  }

  .widget-top {
    align-items: start;
    display: flex;
    gap: 8px;
    justify-content: space-between;
    min-width: 0;
  }

  .widget-title {
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-type {
    color: var(--subtle);
    flex: 0 0 auto;
    font-size: 11px;
  }

  .widget-body {
    align-content: center;
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .widget-value {
    color: #201f1e;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-detail {
    color: var(--muted);
    font-size: 12px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-foot {
    color: var(--subtle);
    font-size: 11px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .side-panel {
    display: grid;
    gap: 0;
  }

  .side-section {
    border-bottom: 1px solid var(--border);
    display: grid;
    gap: 10px;
    padding: 14px;
  }

  .side-section:last-child {
    border-bottom: 0;
  }

  .property-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .property {
    border-bottom: 1px solid var(--border);
    min-width: 0;
    padding-bottom: 7px;
  }

  .property span {
    color: var(--muted);
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .property strong {
    color: var(--text);
    display: block;
    font-size: 14px;
    font-weight: 600;
    margin-top: 2px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .result-box {
    background: var(--panel);
    border: 1px solid var(--border);
    display: grid;
    gap: 4px;
    padding: 10px;
  }

  .result-title {
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
  }

  .result-detail {
    color: var(--muted);
    font-size: 12px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .diagnostic-table {
    border-collapse: collapse;
    width: 100%;
  }

  .diagnostic-table th,
  .diagnostic-table td {
    border-bottom: 1px solid var(--border);
    font-size: 12px;
    padding: 7px 0;
    text-align: left;
    vertical-align: top;
  }

  .diagnostic-table th {
    color: var(--muted);
    font-weight: 600;
  }

  .diagnostic-table td {
    color: var(--text);
  }

  .diagnostic-table .warning {
    color: var(--warning);
    font-weight: 600;
  }

  .diagnostic-table .error {
    color: var(--danger);
    font-weight: 600;
  }

  .empty-copy {
    color: var(--muted);
    font-size: 12px;
  }

  @media (max-width: 980px) {
    .demo-header,
    .panel-header {
      display: grid;
    }

    .demo-state,
    .compact-meta {
      justify-content: flex-start;
    }

    .work-area {
      grid-template-columns: 1fr;
    }

    .command-bar {
      display: grid;
    }

    .command-group {
      border-bottom: 1px solid var(--border);
      border-right: 0;
      flex-wrap: wrap;
    }

    .command-group:last-child {
      border-bottom: 0;
    }
  }
`;
document.head.appendChild(style);

let revisionIndex = 0;

const clone = value => JSON.parse(JSON.stringify(value));

const widgetCatalog = [
  {
    id: "revenue",
    title: "Revenue",
    type: "Metric",
    value: "$482K",
    detail: "QTD actual"
  },
  {
    id: "pipeline",
    title: "Pipeline",
    type: "Metric",
    value: "$1.9M",
    detail: "Weighted forecast"
  },
  {
    id: "utilization",
    title: "Utilization",
    type: "Metric",
    value: "84%",
    detail: "Team capacity"
  },
  {
    id: "service",
    title: "Service Health",
    type: "Locked",
    value: "Stable",
    detail: "Static governance tile",
    locked: true
  },
  {
    id: "incidents",
    title: "Open Incidents",
    type: "Review",
    value: "17",
    detail: "Imported overlap candidate",
    warning: true
  },
  {
    id: "region",
    title: "Region Performance",
    type: "Map",
    value: "5 zones",
    detail: "Hidden in mobile profile"
  }
];

const breakpoints = {
  mobile: 0,
  tablet: 720,
  default: 1100
};

const profilePresets = {
  default: { label: "Desktop", width: 1000, breakpoint: "default", targetView: "desktop" },
  tablet: { label: "Tablet", width: 860, breakpoint: "tablet", targetView: "desktop" },
  mobile: { label: "Mobile", width: 390, breakpoint: "mobile", targetView: "mobile" }
};

const mutedDiagnosticCodes = new Set([
  "deferred-layout-slot",
  "settings-default",
  "target-view-default",
  "unsupported-field",
  "unsupported-profile-field",
  "list-height-source"
]);

const isActionableDiagnostic = item => {
  if (!item || mutedDiagnosticCodes.has(item.code)) return false;
  if (item.code === "profile-fallback" && item.profileId === "default") return false;
  return item.level === "warning" || item.level === "error";
};

const serializeDocument = documentLike => serializeDashboardLayoutDocument(documentLike, {
  key: "dashboard-migration-example",
  sourceId: "example-dashboard-migration",
  revision: () => `migration-demo-${++revisionIndex}`,
  now: () => new Date("2026-05-19T00:00:00.000Z")
});

const createDashboardDocument = () => serializeDocument({
  dashboardSchemaVersion: DASHBOARD_SCHEMA_VERSION,
  kind: "dashboard-layout",
  key: "dashboard-migration-example",
  revision: "seed",
  sourceId: "example-dashboard-migration",
  savedAt: "2026-05-19T00:00:00.000Z",
  primaryLayoutId: "default",
  layouts: {
    default: {
      widgets: {
        revenue: { col: 0, row: 0, sizeX: 6, sizeY: 3, minSizeX: 3, mobileOrder: 0, mobileHeight: 3 },
        pipeline: { col: 6, row: 0, sizeX: 6, sizeY: 3, minSizeX: 3, mobileOrder: 1, mobileHeight: 3 },
        utilization: { col: 12, row: 0, sizeX: 6, sizeY: 3, minSizeX: 3, mobileOrder: 2, mobileHeight: 3 },
        service: {
          col: 18,
          row: 0,
          sizeX: 6,
          sizeY: 3,
          static: true,
          draggable: false,
          resizable: false,
          mobileOrder: 3,
          mobileHeight: 2
        },
        incidents: { col: 0, row: 3, sizeX: 10, sizeY: 4, minSizeX: 4, mobileOrder: 4, mobileHeight: 3 },
        region: {
          col: 10,
          row: 3,
          sizeX: 14,
          sizeY: 4,
          minSizeX: 6,
          mobileHide: true,
          mobileOrder: 5,
          mobileHeight: 4,
          preserveAspectRatio: true,
          aspectRatio: 2.6
        }
      },
      gridSettings: {
        columns: 24,
        minColumns: 6,
        margin: [8, 8],
        containerPadding: [12, 12],
        rowHeight: 48,
        heightMode: "auto",
        minRowHeight: 28,
        renderPrecision: "integer"
      },
      profiles: {
        tablet: {
          widgets: {
            revenue: { col: 0, row: 0, sizeX: 4, sizeY: 3 },
            pipeline: { col: 4, row: 0, sizeX: 4, sizeY: 3 },
            utilization: { col: 8, row: 0, sizeX: 4, sizeY: 3 },
            service: { col: 0, row: 3, sizeX: 6, sizeY: 3 },
            incidents: { col: 6, row: 3, sizeX: 6, sizeY: 3 },
            region: { col: 0, row: 6, sizeX: 12, sizeY: 4 }
          },
          gridSettings: {
            columns: 12,
            margin: [8, 8],
            containerPadding: [10, 10],
            rowHeight: 46,
            heightMode: "fit",
            renderPrecision: "subpixel"
          }
        },
        mobile: {
          widgets: {
            revenue: { col: 0, row: 0, sizeX: 6, sizeY: 3, mobileOrder: 0, mobileHeight: 3 },
            pipeline: { col: 0, row: 3, sizeX: 6, sizeY: 3, mobileOrder: 1, mobileHeight: 3 },
            utilization: { col: 0, row: 6, sizeX: 6, sizeY: 3, mobileOrder: 2, mobileHeight: 3 },
            service: { col: 0, row: 9, sizeX: 6, sizeY: 2, mobileOrder: 3, mobileHeight: 2 },
            incidents: { col: 0, row: 11, sizeX: 6, sizeY: 3, mobileOrder: 4, mobileHeight: 3 },
            region: { col: 0, row: 14, sizeX: 6, sizeY: 4, mobileHide: true, mobileOrder: 5, mobileHeight: 4 }
          },
          gridSettings: {
            columns: 6,
            margin: [8, 8],
            containerPadding: [8, 8],
            viewFormat: "list",
            rowHeight: 44,
            mobileRowHeight: 42,
            mobileHeightMode: "auto",
            renderPrecision: "subpixel"
          }
        }
      },
      editor: {
        version: 1,
        editorMetaById: {
          service: { locked: true, label: "Service Health" },
          region: { label: "Region Performance" }
        }
      }
    },
    importSlot: {
      widgets: {
        importedA: { col: 0, row: 0, sizeX: 6, sizeY: 2 },
        importedB: { col: 4, row: 0, sizeX: 6, sizeY: 2 },
        importedLock: { col: 10, row: 0, sizeX: 2, sizeY: 2, static: true }
      },
      gridSettings: {
        columns: 12,
        minColumns: 4,
        margin: [8, 8],
        containerPadding: [8, 8],
        rowHeight: 44,
        heightMode: "auto",
        renderPrecision: "integer"
      }
    }
  },
  meta: {
    example: "dashboard-migration"
  }
});

const profileIdFor = breakpoint =>
  breakpoint === "default" ? null : breakpoint;

const summarizeOperation = (label, result) => {
  const operation = result.operation || {};
  const affectedIds = operation.affectedIds || [];
  const patches = operation.patches || [];
  return {
    label,
    ok: result.ok,
    status: result.ok ? operation.status || "ok" : result.error?.code || "error",
    affected: affectedIds.length ? affectedIds.join(", ") : "none",
    patches: patches.length,
    diagnosticCount: (result.diagnostics || []).filter(isActionableDiagnostic).length
  };
};

const App = {
  setup() {
    const dashboardDocument = ref(createDashboardDocument());
    const selectedProfile = ref("default");
    const selectedBreakpoint = ref("default");
    const targetView = ref("desktop");
    const gridWidth = ref(1000);
    const targetColumns = ref(16);
    const mode = ref("edit");
    const runtime = ref(null);
    const runtimeDiagnostics = ref([]);
    const operationDiagnostics = ref([]);
    const canvasHost = ref(null);
    const history = createPinia
      ? useGridHistoryStore({ pinia: createPinia(), maxSize: 100 })
      : null;
    let unbindHistoryShortcuts = null;
    let stopCanvasMeasure = null;
    const lastOperation = ref({
      label: "No action run",
      ok: true,
      status: "idle",
      affected: "none",
      patches: 0,
      diagnosticCount: 0
    });
    const mounted = ref(false);

    const targetViewRule = {
      mobileBreakpointIds: ["mobile"],
      mobileMaxWidth: 520
    };

    const layoutEngine = computed(() => ({
      scheduler: { mode: "auto", auto: { eagerMaxItems: 30, rafMaxItems: 120, workerMinItems: 400 } },
      diagnostics: { debug: true, budgetMs: 10 }
    }));

    const currentSettings = computed(() => runtime.value?.gridSettings || {
      columns: 24,
      rowHeight: 48,
      heightMode: "auto",
      renderPrecision: "integer",
      viewFormat: "grid"
    });

    const visibleDiagnostics = computed(() => {
      const rows = operationDiagnostics.value.concat(runtimeDiagnostics.value);
      const seen = new Set();
      return rows.filter(item => {
        if (!isActionableDiagnostic(item)) return false;
        const key = `${item.code}:${item.level}:${item.itemId || ""}:${item.profileId || ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 5);
    });

    const health = computed(() => {
      const errors = visibleDiagnostics.value.filter(item => item.level === "error").length;
      const warnings = visibleDiagnostics.value.filter(item => item.level === "warning").length;
      if (errors > 0) return { className: "error", label: `${errors} issue${errors === 1 ? "" : "s"}` };
      if (warnings > 0) return { className: "warning", label: `${warnings} warning${warnings === 1 ? "" : "s"}` };
      return { className: "", label: "Ready" };
    });

    const activePreset = computed(() => profilePresets[selectedProfile.value]);

    const runtimeProperties = computed(() => {
      const height = runtime.value?.heightRuntime;
      return [
        { label: "Profile", value: runtime.value?.resolvedProfileId || "default" },
        { label: "Mode", value: mode.value },
        { label: "Columns", value: currentSettings.value.columns },
        { label: "Format", value: runtime.value?.viewFormat || "grid" },
        { label: "Hidden", value: runtime.value?.hiddenItemIds?.length || 0 },
        { label: "Row height", value: `${height?.rowHeight || currentSettings.value.rowHeight}px` }
      ];
    });

    const canvasMeta = computed(() => [
      `${currentSettings.value.columns} columns`,
      `${currentSettings.value.rowHeight}px rows`,
      currentSettings.value.renderPrecision || "integer"
    ]);

    const resolveRuntime = () => {
      const result = resolveDashboardResponsiveProfile(dashboardDocument.value, {
        width: gridWidth.value,
        breakpoints,
        breakpoint: selectedBreakpoint.value,
        targetView: targetView.value,
        targetViewRule,
        mode: mode.value,
        validation: "strict"
      });

      if (result.ok) {
        runtime.value = result.runtime;
        runtimeDiagnostics.value = result.diagnostics || [];
      } else {
        runtimeDiagnostics.value = result.diagnostics || [];
      }
    };

    const setDocument = nextDocument => {
      dashboardDocument.value = nextDocument;
    };

    const setProfile = key => {
      const preset = profilePresets[key];
      selectedProfile.value = key;
      selectedBreakpoint.value = preset.breakpoint;
      targetView.value = preset.targetView;
      updateGridWidth();
    };

    const updateGridWidth = () => {
      const preset = profilePresets[selectedProfile.value];
      if (!preset) return;
      if (selectedProfile.value !== "default") {
        gridWidth.value = preset.width;
        return;
      }
      const measured = canvasHost.value?.clientWidth;
      gridWidth.value = Math.max(720, Math.floor(measured || preset.width));
    };

    const setColumns = columns => {
      targetColumns.value = columns;
      runMigration(`Apply ${columns} columns`, { columns });
    };

    const setMode = nextMode => {
      mode.value = nextMode;
    };

    const pushResult = (label, result) => {
      if (result.ok) dashboardDocument.value = result.document;
      operationDiagnostics.value = result.diagnostics || [];
      lastOperation.value = summarizeOperation(label, result);
      resolveRuntime();
    };

    const applyHistoryLayout = (layout, label) => {
      if (!layout || !runtime.value) return;
      const result = writeDashboardResponsiveRuntimeToDocument(
        dashboardDocument.value,
        runtime.value,
        layout,
        {
          createMissingProfileOnEdit: true,
          validation: "strict"
        }
      );
      if (result.ok) dashboardDocument.value = result.document;
      operationDiagnostics.value = result.diagnostics || [];
      lastOperation.value = {
        label,
        ok: result.ok,
        status: result.ok ? "changed" : result.error?.code || "error",
        affected: "layout history",
        patches: 0,
        diagnosticCount: (result.diagnostics || []).filter(isActionableDiagnostic).length
      };
      resolveRuntime();
    };

    const undoHistory = () => {
      if (!history) return;
      applyHistoryLayout(history.undo(), "Undo layout");
    };

    const redoHistory = () => {
      if (!history) return;
      applyHistoryLayout(history.redo(), "Redo layout");
    };

    const migrationPolicy = () => ({
      axis: "horizontal",
      sanitizeInvalidItems: true,
      forceRepair: true,
      repair: {
        strategy: "nearest-then-first",
        createDiagnostics: true,
        objective: {
          minimizeMovement: 1,
          minimizeResize: 1,
          preserveOrder: 1,
          preserveStatic: 1
        }
      }
    });

    const runMigration = (label, nextSettings) => {
      const result = migrateDashboardLayoutSettings(dashboardDocument.value, {
        profileId: profileIdFor(selectedBreakpoint.value),
        previousSettings: clone(currentSettings.value),
        nextSettings,
        createMissingProfile: true,
        validation: "strict",
        policy: migrationPolicy()
      });
      pushResult(label, result);
    };

    const applyDensity = () => {
      const compact = currentSettings.value.rowHeight >= 48;
      runMigration(compact ? "Apply compact density" : "Apply comfortable density", {
        rowHeight: compact ? 40 : 48,
        renderPrecision: compact ? "subpixel" : "integer"
      });
    };

    const repairActive = () => {
      const result = repairDashboardLayoutCollisions(dashboardDocument.value, {
        profileId: profileIdFor(selectedBreakpoint.value),
        validation: "strict",
        policy: migrationPolicy().repair
      });
      pushResult("Repair active profile", result);
    };

    const repairImportSlot = () => {
      const result = repairDashboardLayoutCollisions(dashboardDocument.value, {
        layoutId: "importSlot",
        validation: "strict",
        policy: migrationPolicy().repair
      });
      pushResult("Repair import slot", result);
    };

    const reset = () => {
      dashboardDocument.value = createDashboardDocument();
      selectedProfile.value = "default";
      selectedBreakpoint.value = "default";
      targetView.value = "desktop";
      targetColumns.value = 16;
      mode.value = "edit";
      runtimeDiagnostics.value = [];
      operationDiagnostics.value = [];
      lastOperation.value = {
        label: "No action run",
        ok: true,
        status: "idle",
        affected: "none",
        patches: 0,
        diagnosticCount: 0
      };
      updateGridWidth();
      resolveRuntime();
    };

    const handleProjectionChange = event => {
      runtime.value = event.runtime;
      runtimeDiagnostics.value = event.runtime?.diagnostics || runtimeDiagnostics.value;
    };

    const handleDiagnosticsChange = event => {
      runtimeDiagnostics.value = event.diagnostics || [];
    };

    const handleDocumentChange = (nextDocument, nextRuntime) => {
      dashboardDocument.value = nextDocument;
      runtime.value = nextRuntime;
    };

    const formatGeometry = id => {
      const item = runtime.value?.layout?.find(entry => entry.i === id);
      if (!item) return "not rendered";
      return `${item.x},${item.y} / ${item.w}x${item.h}`;
    };

    watch(
      () => [
        dashboardDocument.value,
        selectedBreakpoint.value,
        targetView.value,
        gridWidth.value,
        mode.value
      ],
      resolveRuntime,
      { deep: true }
    );

    onMounted(() => {
      mounted.value = true;
      updateGridWidth();
      if (typeof ResizeObserver !== "undefined" && canvasHost.value) {
        const observer = new ResizeObserver(updateGridWidth);
        observer.observe(canvasHost.value);
        stopCanvasMeasure = () => observer.disconnect();
      } else if (typeof window !== "undefined") {
        window.addEventListener("resize", updateGridWidth);
        stopCanvasMeasure = () => window.removeEventListener("resize", updateGridWidth);
      }
      resolveRuntime();
      if (history) {
        unbindHistoryShortcuts = bindKeyboardShortcuts(history, {
          onUndo: layout => applyHistoryLayout(layout, "Undo layout"),
          onRedo: layout => applyHistoryLayout(layout, "Redo layout")
        });
      }
    });

    onBeforeUnmount(() => {
      if (stopCanvasMeasure) stopCanvasMeasure();
      if (unbindHistoryShortcuts) unbindHistoryShortcuts();
    });

    return {
      activePreset,
      applyDensity,
      breakpoints,
      canvasMeta,
      canvasHost,
      currentSettings,
      dashboardDocument,
      formatGeometry,
      gridWidth,
      handleDiagnosticsChange,
      handleDocumentChange,
      handleProjectionChange,
      health,
      history,
      lastOperation,
      layoutEngine,
      mode,
      mounted,
      profilePresets,
      repairActive,
      repairImportSlot,
      reset,
      runtime,
      runtimeProperties,
      selectedProfile,
      setColumns,
      setDocument,
      setMode,
      setProfile,
      targetColumns,
      targetView,
      targetViewRule,
      undoHistory,
      redoHistory,
      visibleDiagnostics,
      widgetCatalog
    };
  },
  components: {
    DashboardResponsiveVueGridLayout
  },
  template: `
    <div class="dashboard-migration-example">
      <header class="demo-header">
        <div class="demo-title">
          <h1>Dashboard Settings Migration</h1>
          <p>Apply grid-setting changes to a saved dashboard document and verify the responsive projection after repair.</p>
        </div>
        <div class="demo-state" :class="health.className">
          <span class="state-dot"></span>
          <span>{{ health.label }}</span>
        </div>
      </header>

      <div class="command-bar" aria-label="Dashboard migration commands">
        <div class="command-group">
          <span class="command-label">Profile</span>
          <button
            v-for="preset in profilePresets"
            :key="preset.breakpoint"
            class="command-button"
            :class="{ selected: selectedProfile === preset.breakpoint }"
            @click="setProfile(preset.breakpoint)"
          >
            {{ preset.label }}
          </button>
        </div>
        <div class="command-group">
          <span class="command-label">Mode</span>
          <button class="command-button" :class="{ selected: mode === 'edit' }" @click="setMode('edit')">Edit</button>
          <button class="command-button" :class="{ selected: mode === 'view' }" @click="setMode('view')">View</button>
        </div>
        <div class="command-group">
          <button class="command-button" :disabled="!history || !history.canUndo" @click="undoHistory">Undo</button>
          <button class="command-button" :disabled="!history || !history.canRedo" @click="redoHistory">Redo</button>
        </div>
        <div class="command-group">
          <span class="command-label">Columns</span>
          <button class="command-button" :class="{ selected: targetColumns === 24 }" @click="setColumns(24)">24</button>
          <button class="command-button" :class="{ selected: targetColumns === 16 }" @click="setColumns(16)">16</button>
          <button class="command-button" :class="{ selected: targetColumns === 12 }" @click="setColumns(12)">12</button>
        </div>
        <div class="command-group">
          <button class="command-button" @click="applyDensity">Toggle density</button>
          <button class="command-button" @click="repairActive">Repair active profile</button>
          <button class="command-button" @click="repairImportSlot">Repair import slot</button>
          <button class="command-button" @click="reset">Reset</button>
        </div>
      </div>

      <div class="work-area">
        <main class="canvas-panel" ref="canvasHost">
          <div class="panel-header">
            <div class="panel-heading">
              <h2>{{ activePreset.label }} projection</h2>
              <span>{{ gridWidth }}px width, {{ targetView }} target</span>
            </div>
            <div class="compact-meta">
              <span v-for="item in canvasMeta" :key="item" class="meta-item">{{ item }}</span>
            </div>
          </div>

          <DashboardResponsiveVueGridLayout
            class="dashboard-canvas"
            :document="dashboardDocument"
            :width="gridWidth"
            :breakpoints="breakpoints"
            :breakpoint="activePreset.breakpoint"
            :targetView="targetView"
            :targetViewRule="targetViewRule"
            :mode="mode"
            validation="strict"
            :autoSize="true"
            :isDraggable="mode === 'edit'"
            :isResizable="mode === 'edit'"
            :preventCollision="false"
            :verticalCompact="false"
            :compactType="null"
            :useCSSTransforms="mounted"
            :historyStore="history"
            :layoutEngine="layoutEngine"
            :createMissingProfileOnEdit="true"
            @update:document="setDocument"
            @projectionChange="handleProjectionChange"
            @diagnosticsChange="handleDiagnosticsChange"
            @documentChange="handleDocumentChange"
          >
            <div v-for="widget in widgetCatalog" :key="widget.id" class="widget-slot">
              <article class="widget-card" :class="{ warning: widget.warning, locked: widget.locked }">
                <div class="widget-top">
                  <span class="widget-title">{{ widget.title }}</span>
                  <span class="widget-type">{{ widget.type }}</span>
                </div>
                <div class="widget-body">
                  <strong class="widget-value">{{ widget.value }}</strong>
                  <span class="widget-detail">{{ widget.detail }}</span>
                </div>
                <span class="widget-foot">{{ formatGeometry(widget.id) }}</span>
              </article>
            </div>
          </DashboardResponsiveVueGridLayout>
        </main>

        <aside class="side-panel">
          <section class="side-section">
            <h3>Runtime state</h3>
            <div class="property-grid">
              <div v-for="property in runtimeProperties" :key="property.label" class="property">
                <span>{{ property.label }}</span>
                <strong>{{ property.value }}</strong>
              </div>
            </div>
          </section>

          <section class="side-section">
            <h3>Last action</h3>
            <div class="result-box">
              <span class="result-title">{{ lastOperation.label }}</span>
              <span class="result-detail">Status: {{ lastOperation.status }}; patches: {{ lastOperation.patches }}</span>
              <span class="result-detail">Affected: {{ lastOperation.affected }}</span>
              <span class="result-detail">Actionable diagnostics: {{ lastOperation.diagnosticCount }}</span>
            </div>
          </section>

          <section class="side-section">
            <h3>Actionable diagnostics</h3>
            <table v-if="visibleDiagnostics.length" class="diagnostic-table">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Code</th>
                  <th>Item</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(diagnostic, index) in visibleDiagnostics" :key="index + diagnostic.code">
                  <td :class="diagnostic.level">{{ diagnostic.level }}</td>
                  <td>{{ diagnostic.code }}</td>
                  <td>{{ diagnostic.itemId || diagnostic.profileId || "-" }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-copy">No user-actionable diagnostics.</p>
          </section>
        </aside>
      </div>
    </div>
  `
};

createApp(App).mount("#container");
