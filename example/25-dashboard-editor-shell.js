import { createApp, computed, ref } from "vue/dist/vue.esm-bundler.js";
import {
  DashboardResponsiveVueGridLayout,
  migrateDashboardLayoutSettings,
  serializeDashboardLayoutDocument,
  useDashboardResponsiveProfileModel
} from "@marsio/vue-grid-layout/dashboard";
import { internalGridEditorClipboard } from "@marsio/vue-grid-layout/editor";
import { useDashboardEditorShell } from "@marsio/vue-grid-layout/dashboard-editor-shell";

const style = document.createElement("style");
style.textContent = `
  .dashboard-shell-demo {
    --surface: #ffffff;
    --surface-subtle: #faf9f8;
    --canvas: #f3f2f1;
    --border: #edebe9;
    --border-strong: #c8c6c4;
    --text: #323130;
    --muted: #605e5c;
    --subtle: #8a8886;
    --accent: #0078d4;
    --accent-hover: #106ebe;
    --accent-soft: #eff6fc;
    --success: #107c10;
    --warning: #8a6a00;
    --danger: #a4262c;
    background: #f3f2f1;
    color: var(--text);
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    margin: -20px;
    min-height: 100vh;
    padding: 16px;
  }

  .dashboard-shell-demo * {
    box-sizing: border-box;
  }

  .dashboard-shell-demo h1,
  .dashboard-shell-demo h2,
  .dashboard-shell-demo h3,
  .dashboard-shell-demo p {
    margin: 0;
  }

  .shell-header {
    align-items: flex-start;
    display: flex;
    gap: 16px;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .shell-title {
    display: grid;
    gap: 3px;
    max-width: 880px;
  }

  .shell-title h1 {
    color: #201f1e;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0;
  }

  .shell-title p {
    color: var(--muted);
    font-size: 13px;
  }

  .shell-status {
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    gap: 8px;
    min-height: 32px;
    padding: 5px 10px;
    white-space: nowrap;
  }

  .shell-status-dot {
    background: var(--success);
    border-radius: 50%;
    height: 8px;
    width: 8px;
  }

  .shell-status.warning .shell-status-dot {
    background: var(--warning);
  }

  .shell-status.error .shell-status-dot {
    background: var(--danger);
  }

  .shell-status span:last-child {
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
  }

  .shell-command-bar {
    align-items: stretch;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 12px;
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
    margin-right: 2px;
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
    padding: 5px 9px;
    white-space: nowrap;
  }

  .command-button:hover {
    background: #f3f2f1;
    border-color: var(--border-strong);
  }

  .command-button:focus-visible,
  .widget-menu-button:focus-visible,
  .menu-action:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .command-button:disabled {
    color: var(--subtle);
    cursor: default;
    opacity: 0.58;
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
    background: var(--accent-hover);
    border-color: var(--accent-hover);
  }

  .command-button.selected {
    background: var(--accent-soft);
    border-color: #c7e0f4;
    color: #004578;
    font-weight: 600;
  }

  .command-button.danger {
    color: var(--danger);
  }

  .shell-layout {
    align-items: start;
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(0, 1fr) 340px;
  }

  .canvas-panel,
  .inspector {
    background: var(--surface);
    border: 1px solid var(--border);
    min-width: 0;
  }

  .panel-header {
    align-items: flex-start;
    border-bottom: 1px solid var(--border);
    display: flex;
    gap: 12px;
    justify-content: space-between;
    padding: 12px 14px;
  }

  .panel-heading {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .panel-heading h2,
  .inspector-section h3 {
    color: #201f1e;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0;
  }

  .panel-heading span {
    color: var(--muted);
    font-size: 12px;
  }

  .meta-list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }

  .meta-item,
  .pill {
    background: var(--surface-subtle);
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 12px;
    padding: 3px 7px;
    white-space: nowrap;
  }

  .pill.strong {
    background: var(--accent-soft);
    border-color: #c7e0f4;
    color: #004578;
    font-weight: 600;
  }

  .canvas-host {
    background:
      linear-gradient(90deg, rgba(96, 94, 92, 0.08) 1px, transparent 1px),
      linear-gradient(0deg, rgba(96, 94, 92, 0.08) 1px, transparent 1px),
      var(--canvas);
    background-size: 72px 72px;
    min-height: 474px;
    overflow: auto;
    padding: 12px;
  }

  .grid-viewport {
    margin: 0 auto;
    transition: width 160ms ease;
  }

  .grid-viewport.mobile {
    max-width: 428px;
  }

  .shell-grid {
    background: transparent;
    margin-top: 0;
    min-height: 430px;
  }

  .shell-grid.vue-grid-layout {
    margin-top: 0;
  }

  .shell-grid .vue-grid-item:not(.vue-grid-placeholder) {
    background: transparent;
    border: 0;
  }

  .shell-grid .vue-grid-placeholder {
    background: rgba(0, 120, 212, 0.12);
    border: 1px dashed var(--accent);
  }

  .widget-slot {
    height: 100%;
    min-width: 0;
  }

  .shell-widget {
    background: var(--surface);
    border: 1px solid var(--border-strong);
    cursor: pointer;
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100%;
    min-width: 0;
    overflow: hidden;
    padding: 11px;
  }

  .shell-widget:hover {
    border-color: #8a8886;
  }

  .shell-widget.selected {
    border-color: var(--accent);
    box-shadow: inset 0 0 0 2px var(--accent);
  }

  .shell-widget.highlighted {
    animation: shellHighlight 1100ms ease;
  }

  .shell-widget.locked {
    background: #faf9f8;
  }

  @keyframes shellHighlight {
    0% {
      box-shadow: inset 0 0 0 2px var(--accent), 0 0 0 0 rgba(0, 120, 212, 0.24);
    }
    100% {
      box-shadow: inset 0 0 0 2px var(--accent), 0 0 0 12px rgba(0, 120, 212, 0);
    }
  }

  .widget-top {
    align-items: flex-start;
    display: flex;
    gap: 8px;
    justify-content: space-between;
    min-width: 0;
  }

  .widget-title {
    color: var(--text);
    display: block;
    font-size: 13px;
    font-weight: 600;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-kind {
    color: var(--muted);
    display: block;
    font-size: 12px;
    margin-top: 2px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-menu-button {
    appearance: none;
    background: var(--surface-subtle);
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--muted);
    cursor: pointer;
    flex: 0 0 auto;
    font: inherit;
    font-size: 14px;
    height: 28px;
    line-height: 1;
    padding: 0;
    width: 30px;
  }

  .widget-menu-button:hover {
    background: var(--accent-soft);
    border-color: #c7e0f4;
    color: var(--accent);
  }

  .widget-body {
    align-content: center;
    color: var(--muted);
    display: grid;
    font-size: 12px;
    gap: 5px;
    min-height: 0;
    min-width: 0;
  }

  .widget-contract {
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-detail {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-footer {
    align-items: center;
    color: var(--subtle);
    display: flex;
    font-size: 11px;
    gap: 8px;
    justify-content: space-between;
    min-width: 0;
  }

  .widget-footer span:first-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .inspector {
    display: grid;
  }

  .inspector-section {
    border-bottom: 1px solid var(--border);
    display: grid;
    gap: 10px;
    padding: 14px;
  }

  .inspector-section:last-child {
    border-bottom: 0;
  }

  .state-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .state-cell {
    border-bottom: 1px solid var(--border);
    min-width: 0;
    padding-bottom: 7px;
  }

  .state-cell span {
    color: var(--muted);
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .state-cell strong {
    color: var(--text);
    display: block;
    font-size: 13px;
    font-weight: 600;
    margin-top: 2px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .focus-list {
    display: grid;
    gap: 7px;
  }

  .focus-row {
    align-items: flex-start;
    display: grid;
    gap: 3px;
  }

  .focus-row strong {
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
  }

  .focus-row span {
    color: var(--muted);
    font-size: 12px;
  }

  .result-box {
    background: var(--surface-subtle);
    border: 1px solid var(--border);
    display: grid;
    gap: 5px;
    padding: 10px;
  }

  .result-box strong {
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
  }

  .result-box span {
    color: var(--muted);
    font-size: 12px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .result-stream {
    display: grid;
    gap: 6px;
  }

  .result-row {
    border-bottom: 1px solid var(--border);
    display: grid;
    gap: 2px;
    padding-bottom: 6px;
  }

  .result-row:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .result-row strong {
    color: var(--text);
    font-size: 12px;
    font-weight: 600;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .result-row span,
  .diagnostic-row {
    color: var(--muted);
    font-size: 12px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .diagnostic-list {
    display: grid;
    gap: 5px;
  }

  .diagnostic-row.warning {
    color: var(--warning);
  }

  .diagnostic-row.error {
    color: var(--danger);
  }

  .menu-title {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  .menu-title strong {
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
  }

  .menu-title span {
    color: var(--muted);
    font-size: 12px;
  }

  .menu-actions {
    display: grid;
    gap: 4px;
  }

  .menu-action {
    appearance: none;
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--text);
    cursor: pointer;
    display: flex;
    font: inherit;
    font-size: 13px;
    justify-content: space-between;
    min-height: 32px;
    padding: 6px 8px;
    text-align: left;
  }

  .menu-action:hover {
    background: #f3f2f1;
    border-color: var(--border-strong);
  }

  .menu-action:disabled {
    color: var(--subtle);
    cursor: default;
    opacity: 0.62;
  }

  .menu-action.danger {
    color: var(--danger);
  }

  .shortcut {
    color: var(--subtle);
    font-size: 11px;
    margin-left: 10px;
  }

  .empty-note,
  .shell-message {
    color: var(--muted);
    font-size: 12px;
  }

  @media (max-width: 1080px) {
    .shell-header,
    .panel-header {
      display: grid;
    }

    .shell-status,
    .meta-list {
      justify-content: flex-start;
    }

    .shell-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .shell-command-bar {
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

    .state-grid {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(style);

const fixedDate = new Date("2026-05-19T00:00:00.000Z");

const breakpoints = {
  mobile: 0,
  default: 960
};

const viewportPresets = {
  desktop: {
    key: "desktop",
    label: "Desktop",
    width: 840,
    breakpoint: "default",
    targetView: "desktop"
  },
  mobile: {
    key: "mobile",
    label: "Mobile",
    width: 420,
    breakpoint: "mobile",
    targetView: "mobile"
  }
};

const seedWidgets = {
  revenue: {
    id: "revenue",
    title: "Revenue summary",
    kind: "Business widget",
    contract: "Copy, paste, remove",
    detail: "Layout item plus business payload",
    badge: "editable"
  },
  pipeline: {
    id: "pipeline",
    title: "Pipeline table",
    kind: "Business widget",
    contract: "Context menu target",
    detail: "Selection drives command availability",
    badge: "editable"
  },
  health: {
    id: "health",
    title: "Health monitor",
    kind: "Locked widget",
    contract: "Remove disabled",
    detail: "Editor metadata blocks destructive actions",
    badge: "locked",
    locked: true
  },
  incidents: {
    id: "incidents",
    title: "Incident queue",
    kind: "Business widget",
    contract: "Adapter transaction",
    detail: "Prepare, commit, rollback hooks stay outside layout math",
    badge: "editable"
  },
  region: {
    id: "region",
    title: "Region map",
    kind: "Reference widget",
    contract: "Copy reference",
    detail: "Reference actions use a separate adapter",
    badge: "reference",
    reference: true
  }
};

const clone = value => JSON.parse(JSON.stringify(value));

const createWidgetCatalog = () =>
  Object.keys(seedWidgets).reduce((acc, id) => {
    acc[id] = clone(seedWidgets[id]);
    return acc;
  }, {});

let revisionIndex = 0;
let localIdCounter = 0;
let resultEntryIndex = 0;

const nextRevision = () => `dashboard-shell-demo-${++revisionIndex}`;

const nextLocalId = base => {
  localIdCounter += 1;
  return `${base}-${localIdCounter.toString(36)}`;
};

const nextResultEntryId = base => {
  resultEntryIndex += 1;
  return `${base}-${resultEntryIndex.toString(36)}`;
};

const createDocument = () => serializeDashboardLayoutDocument({
  widgets: {
    revenue: { col: 0, row: 0, sizeX: 4, sizeY: 3, minSizeX: 3, mobileOrder: 0, mobileHeight: 3 },
    pipeline: { col: 4, row: 0, sizeX: 4, sizeY: 3, minSizeX: 3, mobileOrder: 1, mobileHeight: 3 },
    health: {
      col: 8,
      row: 0,
      sizeX: 4,
      sizeY: 3,
      static: true,
      draggable: false,
      resizable: false,
      mobileOrder: 2,
      mobileHeight: 3
    },
    incidents: { col: 0, row: 3, sizeX: 5, sizeY: 3, minSizeX: 3, mobileOrder: 3, mobileHeight: 3 },
    region: { col: 5, row: 3, sizeX: 7, sizeY: 3, minSizeX: 4, mobileOrder: 4, mobileHeight: 3 }
  },
  gridSettings: {
    columns: 12,
    rowHeight: 58,
    margin: [10, 10],
    containerPadding: [10, 10],
    viewFormat: "grid",
    heightMode: "auto",
    renderPrecision: "subpixel"
  },
  profiles: {
    mobile: {
      widgets: {
        revenue: { col: 0, row: 0, sizeX: 4, sizeY: 3, mobileOrder: 0, mobileHeight: 3 },
        pipeline: { col: 0, row: 3, sizeX: 4, sizeY: 3, mobileOrder: 1, mobileHeight: 3 },
        health: { col: 0, row: 6, sizeX: 4, sizeY: 3, mobileOrder: 2, mobileHeight: 3 },
        incidents: { col: 0, row: 9, sizeX: 4, sizeY: 3, mobileOrder: 3, mobileHeight: 3 },
        region: { col: 0, row: 12, sizeX: 4, sizeY: 3, mobileOrder: 4, mobileHeight: 3 }
      },
      gridSettings: {
        viewFormat: "list",
        columns: 4,
        rowHeight: 48,
        mobileRowHeight: 46,
        margin: [10, 10],
        containerPadding: [10, 10],
        renderPrecision: "subpixel"
      }
    }
  },
  editor: {
    version: 1,
    editorMetaById: {
      health: { label: "Health monitor", locked: true },
      region: { label: "Region map" }
    }
  },
  meta: {
    example: "dashboard-editor-shell"
  }
}, {
  key: "dashboard-shell-demo",
  sourceId: "dashboard-shell-demo",
  revision: nextRevision,
  now: () => fixedDate
});

const actionLabel = value =>
  String(value || "idle")
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const fallbackWidget = id => ({
  id,
  title: actionLabel(id.replace(/-copy(?:-\d+)?$/, "")),
  kind: "Business widget",
  contract: "created by shell",
  detail: "Generated through adapter transaction",
  badge: "editable"
});

const mutedDiagnosticCodes = new Set([
  "settings-default",
  "target-view-default",
  "profile-fallback",
  "list-height-source",
  "list-height-default"
]);

const actionableDiagnostics = diagnostics =>
  (diagnostics || []).filter(item =>
    item.level !== "info" && !mutedDiagnosticCodes.has(item.code)
  );

const widgetFromSource = (sourceWidget, id, overrides = {}) => {
  const base = sourceWidget ? clone(sourceWidget) : fallbackWidget(id);
  return {
    ...base,
    ...overrides,
    id,
    title: overrides.title || (sourceWidget ? `${sourceWidget.title} copy` : base.title)
  };
};

const geometryFor = (layout, id) => {
  const item = layout.find(entry => entry.i === id);
  return item ? `${item.x},${item.y} / ${item.w}x${item.h}` : "not rendered";
};

const App = {
  components: {
    DashboardGrid: DashboardResponsiveVueGridLayout
  },
  setup() {
    const documentRef = ref(createDocument());
    const gridRef = ref(null);
    const mode = ref("edit");
    const selectedViewport = ref("desktop");
    const breakpoint = ref(viewportPresets.desktop.breakpoint);
    const targetView = ref(viewportPresets.desktop.targetView);
    const gridWidth = ref(viewportPresets.desktop.width);
    const menu = ref(null);
    const message = ref("");
    const widgetCatalog = ref(createWidgetCatalog());
    const copiedWidgets = ref([]);
    const adapterStage = ref("Idle");
    const addStrategy = ref("first-fit");
    const placementCollisionPolicy = ref("block");
    const operationDiagnostics = ref([]);
    const resultStream = ref([]);
    const placementCollisionOptions = () => ({
      collisionPolicy: placementCollisionPolicy.value,
      compactType: "vertical",
      allowOverlap: false,
      preventCollision: false
    });
    const clipboardPlacementOptions = () => ({
      ...placementCollisionOptions(),
      strategy: "cursor",
      placementIntent: "here",
      placementMode: "interactive"
    });
    const lastAction = ref({
      actionType: "Ready",
      status: "success",
      source: "lifecycle",
      affected: "none",
      placement: "none",
      shifted: "none",
      diagnostics: 0,
      writeBack: "none",
      synthetic: "direct",
      detail: "Shell managed write-back is active"
    });

    const pushResultEntry = entry => {
      const normalized = {
        id: entry.id || nextResultEntryId(String(entry.actionType || "result").toLowerCase().replace(/\s+/g, "-")),
        actionType: entry.actionType || "Action",
        status: entry.status || "success",
        source: entry.source || "api",
        affected: entry.affected || "none",
        placement: entry.placement || "none",
        shifted: entry.shifted || "none",
        diagnostics: entry.diagnostics || 0,
        writeBack: entry.writeBack || "none",
        synthetic: entry.synthetic || "direct",
        detail: entry.detail || "none"
      };
      lastAction.value = normalized;
      resultStream.value = [normalized, ...resultStream.value].slice(0, 6);
    };

    const recordManualResult = entry => {
      operationDiagnostics.value = actionableDiagnostics(entry.diagnostics || []);
      pushResultEntry({
        ...entry,
        diagnostics: operationDiagnostics.value.length
      });
    };

    const recordShellResult = event => {
      const diagnostics = actionableDiagnostics(event.diagnostics);
      const data = event.data && typeof event.data === "object" ? event.data : {};
      operationDiagnostics.value = diagnostics;
      pushResultEntry({
        id: event.actionId,
        actionType: actionLabel(event.actionType),
        status: event.status,
        source: event.source,
        affected: event.affectedIds.length ? event.affectedIds.join(", ") : "none",
        placement: event.placement?.strategy || event.position?.source || "none",
        shifted: event.placement?.shiftedIds?.length ? event.placement.shiftedIds.join(", ") : "none",
        diagnostics: diagnostics.length,
        writeBack: event.writeResult ? (event.writeResult.ok ? "written" : "blocked") : "none",
        synthetic: data.synthesized ? "synthetic" : "direct",
        detail: event.commandResult?.type || event.adapter?.stage || "shell action"
      });
    };

    const widgetForId = id => widgetCatalog.value[id] || fallbackWidget(id);

    const updateWidget = (id, sourceWidget, overrides = {}) => {
      widgetCatalog.value = {
        ...widgetCatalog.value,
        [id]: widgetFromSource(sourceWidget, id, overrides)
      };
    };

    const removeWidgets = ids => {
      if (!ids.length) return;
      const next = { ...widgetCatalog.value };
      ids.forEach(id => {
        delete next[id];
      });
      widgetCatalog.value = next;
    };

    const addedIdsFromCommand = ctx =>
      (ctx.commandResult?.layoutPatches || [])
        .filter(patch => patch.type === "add" && patch.item?.i)
        .map(patch => patch.item.i);

    const removedIdsFromCommand = ctx =>
      (ctx.commandResult?.layoutPatches || [])
        .filter(patch => patch.type === "remove" && patch.id)
        .map(patch => patch.id);

    const model = useDashboardResponsiveProfileModel({
      document: documentRef,
      width: gridWidth,
      breakpoints,
      breakpoint,
      targetView,
      mode,
      validation: "strict",
      documentWriteBack: "shell",
      createMissingProfileOnEdit: true,
      editor: {
        commandPolicy: "skip-blocked",
        clipboard: internalGridEditorClipboard,
        layoutEngineOptions: {
          cols: 12,
          maxRows: Infinity,
          compactType: "vertical",
          allowOverlap: false,
          preventCollision: false
        }
      }
    });

    const shell = useDashboardEditorShell({
      document: documentRef,
      model,
      gridElement: gridRef,
      mode,
      controlled: false,
      documentWriteBack: "shell",
      createMissingProfileOnEdit: true,
      keyboard: {
        enabled: true,
        target: window,
        placementOptions: placementCollisionOptions
      },
      menu: {
        get defaultAddStrategy() {
          return addStrategy.value;
        },
        get defaultReferencePasteStrategy() {
          return addStrategy.value;
        },
        shortcuts: {
          "copy-widget": "Ctrl+C",
          "paste-widget": "Ctrl+V",
          "place-clipboard": "Ctrl+Enter",
          "paste-reference": "Ctrl+Shift+V",
          "open-palette": "Ctrl+P",
          "move-all": "Ctrl+Shift+M",
          "remove-widget": "Del"
        }
      },
      palette: {
        open: () => ({
          id: "insight-panel",
          w: 4,
          h: 3,
          payload: {
            title: "Insight panel",
            kind: "Palette widget",
            contract: "add from palette",
            detail: "Shell resolves insertion position, adapter creates payload",
            badge: "new"
          }
        })
      },
      widgetAdapter: {
        copyWidget: ctx => {
          copiedWidgets.value = ctx.itemIds.map(id => clone(widgetForId(id)));
          adapterStage.value = "Widget adapter copied payload";
          return { ok: true, metadata: { copied: ctx.itemIds.length } };
        },
        preparePasteWidget: () => {
          adapterStage.value = "Widget adapter prepared paste";
          return {
            id: `prepare-paste-${Date.now().toString(36)}`,
            kind: "widget",
            sourceIds: copiedWidgets.value.map(widget => widget.id)
          };
        },
        prepareDuplicateWidget: ctx => {
          adapterStage.value = "Widget adapter prepared duplicate";
          return {
            id: `prepare-duplicate-${Date.now().toString(36)}`,
            kind: "widget",
            sourceIds: ctx.itemIds
          };
        },
        prepareRemoveWidget: ctx => {
          adapterStage.value = "Widget adapter prepared remove";
          return {
            id: `prepare-remove-${Date.now().toString(36)}`,
            kind: "widget",
            sourceIds: ctx.itemIds
          };
        },
        prepareAddWidget: ctx => {
          const payload = ctx.template?.payload || {};
          const id = nextLocalId(ctx.template?.id || "widget");
          adapterStage.value = "Widget adapter prepared add";
          updateWidget(id, null, {
            title: payload.title || "New widget",
            kind: payload.kind || "Palette widget",
            contract: payload.contract || "add from palette",
            detail: payload.detail || "Business payload prepared by adapter",
            badge: payload.badge || "new"
          });
          return {
            id: `prepare-add-${id}`,
            kind: "widget",
            newIds: [id]
          };
        },
        commit: (prepared, ctx) => {
          const addedIds = addedIdsFromCommand(ctx);
          const removedIds = removedIdsFromCommand(ctx);
          addedIds.forEach((id, index) => {
            if (widgetCatalog.value[id]) return;
            const sourceId = prepared.sourceIds?.[index] || prepared.sourceIds?.[0] || ctx.itemIds[index] || ctx.itemIds[0];
            const sourceWidget = copiedWidgets.value[index] || copiedWidgets.value[0] || (sourceId ? widgetForId(sourceId) : null);
            updateWidget(id, sourceWidget, {
              title: sourceWidget ? `${sourceWidget.title} copy` : fallbackWidget(id).title,
              contract: "copied through adapter",
              detail: sourceWidget ? `Business payload copied from ${sourceWidget.title}` : "Created through shell mutation"
            });
          });
          adapterStage.value = "Widget adapter committed";
          return { ok: true, metadata: { addedIds, removedIds } };
        },
        rollback: prepared => {
          removeWidgets(prepared.newIds || []);
          adapterStage.value = "Widget adapter rolled back";
        }
      },
      referenceAdapter: {
        canCopyReference: () => ({ available: true }),
        copyReference: ctx => {
          adapterStage.value = `Reference adapter copied ${ctx.itemIds[0] || "item"}`;
          return { ok: true, sourceIds: ctx.itemIds, metadata: { copiedReference: true } };
        },
        canPasteReference: () => ({ available: true }),
        preparePasteReference: () => {
          const id = nextLocalId("shared-reference");
          adapterStage.value = "Reference adapter prepared paste";
          updateWidget(id, null, {
            title: "Shared reference",
            kind: "Reference widget",
            contract: "paste reference",
            detail: "Separate adapter owns the reference payload",
            badge: "reference",
            reference: true
          });
          return {
            id: `prepare-reference-${id}`,
            kind: "reference",
            newIds: [id],
            opaque: { hiddenBusinessReferencePayload: true }
          };
        },
        canReplaceReference: () => ({ available: true }),
        prepareReplaceReferenceWithWidgetCopy: ctx => {
          adapterStage.value = "Reference adapter prepared detach";
          return {
            id: `replace-reference-${ctx.itemIds[0]}`,
            kind: "reference",
            sourceIds: ctx.itemIds,
            newIds: [`${ctx.itemIds[0]}-detached`],
            metadata: { detached: true }
          };
        },
        commit: () => {
          adapterStage.value = "Reference adapter committed";
          return { ok: true };
        },
        rollback: prepared => {
          removeWidgets(prepared.newIds || []);
          adapterStage.value = "Reference adapter rolled back";
        }
      },
      confirm: () => true,
      onEvent: event => {
        if (event.type === "action-result") {
          recordShellResult(event);
        }
        if (event.type === "menu-change") {
          menu.value = event.menu;
        }
      },
      onDocumentChange: event => {
        documentRef.value = event.document;
      },
      onMessage: nextMessage => {
        message.value = nextMessage.message;
      }
    });

    const shellState = computed(() => shell.state.value);
    const activePreset = computed(() => viewportPresets[selectedViewport.value]);
    const selectedIds = computed(() =>
      model.editorController?.selection.value.selectedIds ||
      shellState.value.selection?.selectedIds ||
      []
    );
    const currentLayout = computed(() => model.state.value.layout || []);
    const currentWidgetIds = computed(() => {
      const layout = documentRef.value?.layouts?.default;
      return Object.keys(layout?.widgets || {});
    });
    const allWidgets = computed(() =>
      currentWidgetIds.value.map(id => widgetForId(id))
    );
    const visibleWidgets = computed(() =>
      (model.state.value.renderItemIds || []).map(id => widgetForId(id))
    );
    const canvasMeta = computed(() => [
      `${model.state.value.gridSettings?.columns || 12} columns`,
      `${model.state.value.viewFormat || "grid"} view`,
      `${gridWidth.value}px`
    ]);
    const health = computed(() => {
      const diagnostics = actionableDiagnostics(shellState.value.diagnostics);
      const errors = diagnostics.filter(item => item.level === "error").length;
      const warnings = diagnostics.filter(item => item.level === "warning").length;
      if (errors) return { className: "error", label: `${errors} issue${errors === 1 ? "" : "s"}` };
      if (warnings) return { className: "warning", label: `${warnings} warning${warnings === 1 ? "" : "s"}` };
      return { className: "", label: shellState.value.ready ? "Ready" : "Starting" };
    });
    const diagnosticRows = computed(() => {
      const rows = operationDiagnostics.value.concat(actionableDiagnostics(shellState.value.diagnostics));
      const seen = new Set();
      return rows.filter(item => {
        const key = `${item.level}:${item.code}:${item.itemId || ""}:${item.profileId || ""}:${item.reason || ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 6);
    });
    const stateRows = computed(() => [
      { label: "Profile", value: model.state.value.resolvedProfileId || "default" },
      { label: "Mode", value: mode.value },
      { label: "Selection", value: selectedIds.value.length ? selectedIds.value.join(", ") : "none" },
      { label: "Position", value: shellState.value.lastMenuPosition ? `${shellState.value.lastMenuPosition.x},${shellState.value.lastMenuPosition.y}` : "none" }
    ]);
    const menuItems = computed(() =>
      (menu.value?.items || []).filter(item => item.type !== "separator" && !item.hidden)
    );
    const canPaste = computed(() => copiedWidgets.value.length > 0);
    const canUndo = computed(() => Boolean(shellState.value.toolbar?.commands?.undo?.enabled));
    const canRedo = computed(() => Boolean(shellState.value.toolbar?.commands?.redo?.enabled));

    const setViewport = key => {
      const preset = viewportPresets[key];
      selectedViewport.value = key;
      breakpoint.value = preset.breakpoint;
      targetView.value = preset.targetView;
      gridWidth.value = preset.width;
      shell.actions.closeMenu("viewport-change");
      recordManualResult({
        actionType: "Profile switch",
        status: "success",
        source: "toolbar",
        affected: preset.key,
        placement: preset.targetView,
        writeBack: "none",
        detail: `${preset.width}px ${preset.breakpoint}`
      });
    };

    const setMode = nextMode => {
      mode.value = nextMode;
      shell.actions.closeMenu("mode-change");
    };

    const activeMigrationProfileId = () =>
      selectedViewport.value === "mobile" ? "mobile" : null;

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

    const runSettingsMigration = (label, nextSettings) => {
      const previousSettings = clone(model.state.value.gridSettings || {});
      const result = migrateDashboardLayoutSettings(documentRef.value, {
        profileId: activeMigrationProfileId(),
        previousSettings,
        nextSettings,
        createMissingProfile: true,
        validation: "strict",
        policy: migrationPolicy()
      });
      const diagnostics = actionableDiagnostics(result.diagnostics);
      if (result.ok) {
        documentRef.value = result.document;
      }
      recordManualResult({
        actionType: "Settings migration",
        status: result.ok ? result.operation?.status || "success" : result.error?.code || "error",
        source: "toolbar",
        affected: result.ok && result.operation?.affectedIds?.length ? result.operation.affectedIds.join(", ") : "active profile",
        placement: activeMigrationProfileId() || "default",
        writeBack: result.ok ? "written" : "blocked",
        detail: label,
        diagnostics
      });
    };

    const migrateColumns = () => {
      const current = model.state.value.gridSettings?.columns || (selectedViewport.value === "mobile" ? 4 : 12);
      const target = selectedViewport.value === "mobile"
        ? (current === 4 ? 5 : 4)
        : (current === 12 ? 10 : 12);
      runSettingsMigration(`${current} to ${target} columns`, { columns: target });
    };

    const toggleDensity = () => {
      const current = model.state.value.gridSettings?.rowHeight || 58;
      const compact = current >= 52;
      runSettingsMigration(compact ? "Compact rows" : "Comfortable rows", {
        rowHeight: compact ? 44 : 58,
        renderPrecision: compact ? "integer" : "subpixel"
      });
    };

    const editableTargetId = () =>
      selectedIds.value.find(id => !widgetForId(id).locked) ||
      currentWidgetIds.value.find(id => !widgetForId(id).locked) ||
      currentWidgetIds.value[0];

    const runSyntheticEditorCommand = command => {
      const editor = model.editorController;
      if (!editor) {
        recordManualResult({
          actionType: "Editor command",
          status: "blocked",
          source: "toolbar",
          affected: "none",
          detail: "missing editor controller"
        });
        return;
      }
      void editor.execute(command);
    };

    const simulatePointerMove = () => {
      const id = editableTargetId();
      if (!id) return;
      runSyntheticEditorCommand({
        type: "move",
        targetIds: [id],
        source: "pointer",
        payload: { dx: 1, dy: 0 }
      });
    };

    const simulatePointerResize = () => {
      const id = editableTargetId();
      if (!id) return;
      runSyntheticEditorCommand({
        type: "resize",
        targetIds: [id],
        source: "pointer",
        payload: { dw: 1, dh: 1 }
      });
    };

    const simulateExternalDrop = () => {
      const id = nextLocalId("dropped-widget");
      updateWidget(id, null, {
        title: "Dropped widget",
        kind: "Drop payload",
        contract: "external drop",
        detail: "Synthetic drop command writes through the shell",
        badge: "drop"
      });
      runSyntheticEditorCommand({
        type: "add",
        targetIds: [id],
        source: "drop",
        payload: {
          item: { i: id, x: 0, y: 6, w: selectedViewport.value === "mobile" ? 4 : 3, h: 2 },
          strategy: "cursor",
          cursor: { x: 0, y: 6 },
          cols: model.state.value.gridSettings?.columns || 12,
          maxRows: Infinity,
          compactType: "vertical",
          allowOverlap: false,
          preventCollision: false
        }
      });
    };

    const selectWidget = id => {
      void shell.actions.selectItem(id, { source: "pointer" });
    };

    const openDashboardMenu = event => {
      event.preventDefault();
      menu.value = shell.actions.prepareDashboardContextMenu(event, { source: "context-menu" });
    };

    const openWidgetMenu = (event, id) => {
      event.preventDefault();
      event.stopPropagation();
      void shell.actions.selectItem(id, { source: "pointer" });
      menu.value = shell.actions.prepareWidgetContextMenu(event, id, { source: "context-menu" });
    };

    const runMenuAction = item => {
      if (!item.enabled || !item.action) return;
      void Promise.resolve(item.action()).then(result => {
        if (result && !result.ok) {
          message.value = result.diagnostics[0]?.message || result.status;
        }
      });
    };

    const copySelected = () => {
      void shell.actions.copyWidget(selectedIds.value, { source: "toolbar" });
    };

    const pasteWidget = () => {
      void shell.actions.pasteWidget(null, {
        source: "toolbar",
        strategy: addStrategy.value
      });
    };

    const placeClipboard = () => {
      void shell.actions.placeClipboard(null, {
        ...clipboardPlacementOptions(),
        source: "toolbar"
      });
    };

    const addWidget = () => {
      void shell.actions.openWidgetPalette(null, {
        source: "toolbar",
        strategy: addStrategy.value
      });
    };

    const pasteReference = () => {
      void shell.actions.pasteWidgetReference(null, {
        source: "toolbar",
        strategy: addStrategy.value,
        itemSize: { w: 4, h: 3 }
      });
    };

    const removeSelected = () => {
      void shell.actions.removeWidget(selectedIds.value, { source: "toolbar" });
    };

    const undoHistory = () => {
      void shell.actions.undo({ source: "toolbar" });
    };

    const redoHistory = () => {
      void shell.actions.redo({ source: "toolbar" });
    };

    const moveAll = dy => {
      void shell.actions.moveAllWidgets(0, dy, { source: "toolbar" });
    };

    const locateWidget = id => {
      shell.actions.highlightItem(id, { source: "toolbar", durationMs: 1100 });
      void shell.actions.scrollToItem(id, { source: "toolbar", behavior: "smooth" });
    };

    const resetDemo = () => {
      internalGridEditorClipboard.clear?.();
      revisionIndex = 0;
      localIdCounter = 0;
      documentRef.value = createDocument();
      widgetCatalog.value = createWidgetCatalog();
      copiedWidgets.value = [];
      adapterStage.value = "Idle";
      message.value = "";
      operationDiagnostics.value = [];
      resultStream.value = [];
      lastAction.value = {
        actionType: "Ready",
        status: "success",
        source: "lifecycle",
        affected: "none",
        placement: "none",
        shifted: "none",
        diagnostics: 0,
        writeBack: "none",
        synthetic: "direct",
        detail: "Shell managed write-back is active"
      };
      shell.actions.closeMenu("reset");
    };

    const formatGeometry = id => geometryFor(currentLayout.value, id);

    return {
      activePreset,
      adapterStage,
      addStrategy,
      placementCollisionPolicy,
      addWidget,
      allWidgets,
      breakpoint,
      breakpoints,
      canPaste,
      canRedo,
      canUndo,
      canvasMeta,
      copySelected,
      documentRef,
      formatGeometry,
      gridRef,
      gridWidth,
      health,
      lastAction,
      locateWidget,
      diagnosticRows,
      migrateColumns,
      menu,
      menuItems,
      message,
      mode,
      model,
      moveAll,
      openDashboardMenu,
      openWidgetMenu,
      pasteReference,
      placeClipboard,
      pasteWidget,
      redoHistory,
      removeSelected,
      resetDemo,
      resultStream,
      runMenuAction,
      selectWidget,
      selectedIds,
      selectedViewport,
      setMode,
      setViewport,
      shell,
      shellState,
      simulateExternalDrop,
      simulatePointerMove,
      simulatePointerResize,
      stateRows,
      targetView,
      toggleDensity,
      undoHistory,
      viewportPresets,
      visibleWidgets
    };
  },
  template: `
    <section class="dashboard-shell-demo">
      <header class="shell-header">
        <div class="shell-title">
          <h1>Dashboard Editor Shell</h1>
          <p>Enterprise integration example for command routing, context menus, adapter transactions, and responsive profile write-back.</p>
        </div>
        <div class="shell-status" :class="health.className">
          <span class="shell-status-dot"></span>
          <span>{{ health.label }}</span>
        </div>
      </header>

      <div class="shell-command-bar" aria-label="Dashboard editor shell commands">
        <div class="command-group">
          <span class="command-label">Mode</span>
          <button class="command-button" :class="{ selected: mode === 'edit' }" @click="setMode('edit')">Edit</button>
          <button class="command-button" :class="{ selected: mode === 'view' }" @click="setMode('view')">View</button>
        </div>
        <div class="command-group">
          <span class="command-label">Projection</span>
          <button
            v-for="preset in viewportPresets"
            :key="preset.key"
            class="command-button"
            :class="{ selected: selectedViewport === preset.key }"
            @click="setViewport(preset.key)"
          >
            {{ preset.label }}
          </button>
        </div>
        <div class="command-group">
          <span class="command-label">Placement</span>
          <button
            class="command-button"
            :class="{ selected: addStrategy === 'first-fit' }"
            @click="addStrategy = 'first-fit'"
          >
            First fit
          </button>
          <button
            class="command-button"
            :class="{ selected: addStrategy === 'insert-top-shift' }"
            @click="addStrategy = 'insert-top-shift'"
          >
            Top shift
          </button>
          <button
            class="command-button"
            :class="{ selected: placementCollisionPolicy === 'block' }"
            @click="placementCollisionPolicy = 'block'"
          >
            Block
          </button>
          <button
            class="command-button"
            :class="{ selected: placementCollisionPolicy === 'layout' }"
            @click="placementCollisionPolicy = 'layout'"
          >
            Layout push
          </button>
        </div>
        <div class="command-group">
          <span class="command-label">Dogfood</span>
          <button class="command-button" @click="simulatePointerMove">Drag +1</button>
          <button class="command-button" @click="simulatePointerResize">Resize +1</button>
          <button class="command-button" @click="simulateExternalDrop">Drop widget</button>
          <button class="command-button" @click="migrateColumns">Migrate columns</button>
          <button class="command-button" @click="toggleDensity">Toggle density</button>
        </div>
        <div class="command-group">
          <button class="command-button" :disabled="!canUndo" @click="undoHistory">Undo</button>
          <button class="command-button" :disabled="!canRedo" @click="redoHistory">Redo</button>
          <button class="command-button" :disabled="!selectedIds.length" @click="copySelected">Copy</button>
          <button class="command-button" :disabled="!canPaste" @click="pasteWidget">Paste</button>
          <button class="command-button" :disabled="!canPaste" @click="placeClipboard">Place from clipboard</button>
          <button class="command-button primary" @click="addWidget">Add widget</button>
          <button class="command-button" @click="pasteReference">Paste reference</button>
        </div>
        <div class="command-group">
          <button class="command-button" @click="moveAll(-1)">Move all up</button>
          <button class="command-button" @click="moveAll(1)">Move all down</button>
          <button class="command-button danger" :disabled="!selectedIds.length" @click="removeSelected">Remove</button>
          <button class="command-button" @click="resetDemo">Reset</button>
        </div>
      </div>

      <div class="shell-layout">
        <main class="canvas-panel">
          <div class="panel-header">
            <div class="panel-heading">
              <h2>{{ activePreset.label }} projection</h2>
              <span>{{ visibleWidgets.length }} rendered widgets, {{ targetView }} target, {{ mode }} mode</span>
            </div>
            <div class="meta-list">
              <span v-for="item in canvasMeta" :key="item" class="meta-item">{{ item }}</span>
            </div>
          </div>

          <div ref="gridRef" class="canvas-host" @click="shell.actions.closeMenu('canvas-click')" @contextmenu="openDashboardMenu">
            <div class="grid-viewport" :class="{ mobile: selectedViewport === 'mobile' }" :style="{ width: gridWidth + 'px' }">
              <DashboardGrid
                class="shell-grid"
                :document="documentRef"
                :width="gridWidth"
                :breakpoints="breakpoints"
                :breakpoint="breakpoint"
                :targetView="targetView"
                :mode="mode"
                validation="strict"
                :documentWriteBack="'shell'"
                :editor="{ controller: model.editorController }"
                :createMissingProfileOnEdit="true"
                :autoSize="true"
                :isDraggable="mode === 'edit'"
                :isResizable="mode === 'edit'"
                :preventCollision="false"
                :verticalCompact="false"
                :compactType="'vertical'"
                :useCSSTransforms="true"
                :layoutEngine="{ scheduler: { mode: 'auto' }, diagnostics: { debug: true, budgetMs: 10 } }"
              >
                <div
                  v-for="widget in allWidgets"
                  :key="widget.id"
                  class="widget-slot"
                  :data-grid-id="widget.id"
                >
                  <article
                    class="shell-widget"
                    :class="{ selected: selectedIds.includes(widget.id), highlighted: shellState.highlightedId === widget.id, locked: widget.locked }"
                    @click.stop="selectWidget(widget.id)"
                    @dblclick.stop="locateWidget(widget.id)"
                    @contextmenu.stop="openWidgetMenu($event, widget.id)"
                  >
                    <div class="widget-top">
                      <div>
                        <span class="widget-title">{{ widget.title }}</span>
                        <span class="widget-kind">{{ widget.kind }}</span>
                      </div>
                      <button class="widget-menu-button" aria-label="Open widget menu" @click.stop="openWidgetMenu($event, widget.id)">...</button>
                    </div>
                    <div class="widget-body">
                      <span class="widget-contract">{{ widget.contract }}</span>
                      <span class="widget-detail">{{ widget.detail }}</span>
                    </div>
                    <div class="widget-footer">
                      <span>{{ formatGeometry(widget.id) }}</span>
                      <span class="pill" :class="{ strong: widget.reference || widget.locked }">{{ widget.badge }}</span>
                    </div>
                  </article>
                </div>
              </DashboardGrid>
            </div>
          </div>
        </main>

        <aside class="inspector">
          <section class="inspector-section">
            <h3>Example focus</h3>
            <div class="focus-list">
              <div class="focus-row">
                <strong>{{ addStrategy }} / {{ placementCollisionPolicy }}</strong>
                <span>Toolbar and keyboard paste use the selected policy; context-menu actions place at the clicked grid point.</span>
              </div>
              <div class="focus-row">
                <strong>Adapters</strong>
                <span>Prepare, write-back, commit, and rollback stay visible in the result stream.</span>
              </div>
              <div class="focus-row">
                <strong>Write-back</strong>
                <span>Only the active responsive profile receives geometry changes.</span>
              </div>
            </div>
          </section>

          <section class="inspector-section">
            <h3>Shell state</h3>
            <div class="state-grid">
              <div v-for="row in stateRows" :key="row.label" class="state-cell">
                <span>{{ row.label }}</span>
                <strong>{{ row.value }}</strong>
              </div>
            </div>
          </section>

          <section class="inspector-section" v-if="menu">
            <div class="menu-title">
              <strong>{{ menu.target.type === 'widget' ? 'Widget menu' : 'Canvas menu' }}</strong>
              <span>{{ menu.position ? menu.position.x + ',' + menu.position.y : 'no position' }}</span>
            </div>
            <div class="menu-actions">
              <button
                v-for="item in menuItems"
                :key="item.id"
                class="menu-action"
                :class="{ danger: item.danger }"
                :disabled="item.enabled === false"
                @click="runMenuAction(item)"
              >
                <span>{{ item.label || item.labelKey || item.id }}</span>
                <span class="shortcut">{{ item.enabled === false ? item.reason : item.shortcut }}</span>
              </button>
              <button class="menu-action" @click="shell.actions.closeMenu('dock-close')">
                <span>Close menu</span>
                <span class="shortcut">Esc</span>
              </button>
            </div>
          </section>

          <section class="inspector-section" v-else>
            <h3>Context menu</h3>
            <p class="empty-note">Open a widget menu to inspect action availability.</p>
          </section>

          <section class="inspector-section">
            <h3>Results and diagnostics</h3>
            <div class="result-box">
              <strong>{{ lastAction.actionType }}</strong>
              <span>Status: {{ lastAction.status }}; source: {{ lastAction.source }}</span>
              <span>Affected: {{ lastAction.affected }}</span>
              <span>Placement: {{ lastAction.placement }}</span>
              <span>Shifted: {{ lastAction.shifted }}</span>
              <span>Write-back: {{ lastAction.writeBack }}; {{ lastAction.synthetic }}</span>
              <span>Detail: {{ lastAction.detail }}</span>
              <span>Diagnostics: {{ lastAction.diagnostics }}</span>
              <span>Adapter: {{ adapterStage }}</span>
            </div>
            <div class="result-stream" v-if="resultStream.length">
              <div v-for="entry in resultStream" :key="entry.id" class="result-row">
                <strong>{{ entry.actionType }} - {{ entry.status }}</strong>
                <span>{{ entry.source }} - {{ entry.writeBack }} - {{ entry.detail }}</span>
                <span>{{ entry.affected }} - diagnostics {{ entry.diagnostics }}</span>
              </div>
            </div>
            <div class="diagnostic-list" v-if="diagnosticRows.length">
              <span
                v-for="(diagnostic, index) in diagnosticRows"
                :key="index + diagnostic.code"
                class="diagnostic-row"
                :class="diagnostic.level"
              >
                {{ diagnostic.level }} - {{ diagnostic.code }} - {{ diagnostic.itemId || diagnostic.profileId || diagnostic.reason || 'dashboard' }}
              </span>
            </div>
            <p class="shell-message">{{ message }}</p>
          </section>
        </aside>
      </div>
    </section>
  `
};

createApp(App).mount("#container");
