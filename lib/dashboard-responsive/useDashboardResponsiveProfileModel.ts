import {
  getCurrentInstance,
  onBeforeUnmount,
  ref,
  shallowRef,
  unref,
  watch,
  type Ref,
  type WatchStopHandle
} from "vue";
import { deepEqual } from "fast-equals";
import { createGridEditorController, type GridEditorController } from "../editor";
import type { GridEditorMetaById, GridEditorProp } from "../editor";
import type { Layout } from "../utils";
import {
  createDashboardHeightDiagnostic,
  createDashboardResponsiveDiagnostic,
  isDashboardHeightDiagnostic,
  resolveDashboardResponsiveProfile,
  writeDashboardResponsiveRuntimeToDocument
} from "./resolve";
import type { GridHeightRuntime } from "../grid-height";
import type {
  DashboardResponsiveMode,
  DashboardResponsiveProfileEvent,
  DashboardResponsiveProfileModel,
  DashboardResponsiveRuntime,
  UseDashboardResponsiveProfileModelOptions
} from "./types";

const cloneLayout = (layout: Layout): Layout => layout.map(item => ({ ...item }));

const emptyRuntime = (
  options: UseDashboardResponsiveProfileModelOptions
): DashboardResponsiveRuntime => ({
  layout: [],
  gridSettings: {
    columns: 12,
    minColumns: 1,
    margin: 10,
    outerMargin: true,
    containerPadding: [0, 0],
    viewFormat: "grid",
    rowHeight: 150,
    autoFillHeight: false,
    renderPrecision: "integer"
  },
  editorMetaById: {},
  layoutId: "default",
  requestedBreakpoint: unref(options.breakpoint) || "default",
  resolvedProfileId: null,
  targetView: unref(options.targetView) || "desktop",
  targetViewSource: unref(options.targetView) ? "explicit" : "default",
  mode: unref(options.mode) || "view",
  viewFormat: "grid",
  heightOptions: {
    heightMode: "auto",
    rowHeight: 150,
    renderPrecision: "integer"
  },
  fallbackApplied: true,
  allItemIds: [],
  activeItemIds: [],
  renderItemIds: [],
  hiddenItemIds: [],
  diagnostics: [
    createDashboardResponsiveDiagnostic(
      "projection-validation-failed",
      "error",
      "Dashboard responsive runtime has not resolved successfully yet."
    )
  ]
});

const projectionSignature = (runtime: DashboardResponsiveRuntime) => ({
  layout: runtime.layout,
  gridSettings: runtime.gridSettings,
  editorMetaById: runtime.editorMetaById,
  allItemIds: runtime.allItemIds,
  activeItemIds: runtime.activeItemIds,
  renderItemIds: runtime.renderItemIds,
  hiddenItemIds: runtime.hiddenItemIds,
  viewFormat: runtime.viewFormat,
  targetView: runtime.targetView,
  mode: runtime.mode,
  heightOptions: runtime.heightOptions,
  heightRuntime: runtime.heightRuntime
});

const withoutHeightDiagnostics = (runtime: DashboardResponsiveRuntime) =>
  runtime.diagnostics.filter(diagnostic => !isDashboardHeightDiagnostic(diagnostic));

const toEventEmit = (
  options: UseDashboardResponsiveProfileModelOptions
): ((event: DashboardResponsiveProfileEvent) => void) =>
  event => {
    options.onEvent?.(event);
  };

const unrefOptional = <T>(value: Ref<T> | T | undefined): T | undefined =>
  typeof value === "undefined" ? undefined : unref(value);

export function useDashboardResponsiveProfileModel(
  options: UseDashboardResponsiveProfileModelOptions
): DashboardResponsiveProfileModel {
  const initial = resolveDashboardResponsiveProfile(unref(options.document), {
    width: unref(options.width),
    breakpoints: unref(options.breakpoints),
    breakpoint: unrefOptional(options.breakpoint) || null,
    targetView: unrefOptional(options.targetView) || null,
    targetViewRule: options.targetViewRule,
    mode: unrefOptional(options.mode) || "view",
    validation: options.validation,
    allowUnknownProfileItems: options.allowUnknownProfileItems
  });
  const state = shallowRef<DashboardResponsiveRuntime>(
    initial.ok ? initial.runtime : emptyRuntime(options)
  );
  const layoutRef = ref<Layout>(cloneLayout(state.value.layout));
  const editorMetaRef = ref<GridEditorMetaById>({ ...state.value.editorMetaById });
  const modeRef = ref<DashboardResponsiveMode>(state.value.mode);
  const emit = toEventEmit(options);
  const stopHandles: WatchStopHandle[] = [];
  let stopped = false;

  if (!initial.ok) {
    emit({ type: "projectionError", error: initial.error, diagnostics: initial.diagnostics });
  }

  const editorConfig = options.editor && typeof options.editor === "object"
    ? options.editor
    : null;
  const editorController: GridEditorController | null = editorConfig
    ? editorConfig.controller || createGridEditorController({
        ...editorConfig,
        kind: "layout",
        layout: layoutRef,
        mode: modeRef,
        editorMetaById: editorMetaRef
      })
    : null;

  const applyRuntime = (
    runtime: DashboardResponsiveRuntime,
    previous: DashboardResponsiveRuntime | null,
    reason: string
  ) => {
    state.value = runtime;
    layoutRef.value = cloneLayout(runtime.layout);
    editorMetaRef.value = { ...runtime.editorMetaById };
    modeRef.value = runtime.mode;
    editorController?.setExternalLayout(runtime.layout, reason);

    if (previous && previous.requestedBreakpoint !== runtime.requestedBreakpoint) {
      emit({
        type: "breakpointChange",
        requestedBreakpoint: runtime.requestedBreakpoint,
        previous: previous.requestedBreakpoint
      });
    }
    if (previous && previous.resolvedProfileId !== runtime.resolvedProfileId) {
      emit({
        type: "profileChange",
        resolvedProfileId: runtime.resolvedProfileId,
        previous: previous.resolvedProfileId,
        fallbackApplied: runtime.fallbackApplied
      });
    }
    if (!previous || !deepEqual(projectionSignature(previous), projectionSignature(runtime))) {
      emit({ type: "projectionChange", runtime });
    }
    if (!previous || !deepEqual(previous.diagnostics, runtime.diagnostics)) {
      emit({ type: "diagnosticsChange", diagnostics: runtime.diagnostics });
    }
  };

  const refresh = (reason = "refresh") => {
    if (stopped) return;
    const previous = state.value;
    const result = resolveDashboardResponsiveProfile(unref(options.document), {
      width: unref(options.width),
      breakpoints: unref(options.breakpoints),
      breakpoint: unrefOptional(options.breakpoint) || null,
      targetView: unrefOptional(options.targetView) || null,
      targetViewRule: options.targetViewRule,
      mode: unrefOptional(options.mode) || "view",
      validation: options.validation,
      allowUnknownProfileItems: options.allowUnknownProfileItems
    });
    if (result.ok) {
      applyRuntime(result.runtime, previous, reason);
      return;
    }
    emit({ type: "projectionError", error: result.error, diagnostics: result.diagnostics });
    emit({ type: "diagnosticsChange", diagnostics: result.diagnostics });
  };

  stopHandles.push(watch(
    () => [
      unref(options.document),
      unref(options.width),
      unref(options.breakpoints),
      unrefOptional(options.breakpoint),
      unrefOptional(options.targetView),
      unrefOptional(options.mode)
    ],
    () => refresh("input-change"),
    { deep: true }
  ));

  const onLayoutChange = (layout: Layout) => {
    const written = writeDashboardResponsiveRuntimeToDocument(
      unref(options.document),
      state.value,
      layout,
      {
        createMissingProfileOnEdit: options.createMissingProfileOnEdit,
        validation: options.validation,
        editorMetaById: editorMetaRef.value
      }
    );
    if (written.ok) {
      emit({ type: "documentChange", document: written.document, runtime: state.value });
    } else {
      emit({ type: "projectionError", error: written.error, diagnostics: written.diagnostics });
      emit({ type: "diagnosticsChange", diagnostics: written.diagnostics });
    }
  };

  const onHeightRuntimeChange = (heightRuntime: GridHeightRuntime) => {
    const previous = state.value;
    const baseDiagnostics = withoutHeightDiagnostics(previous);
    const next: DashboardResponsiveRuntime = {
      ...previous,
      heightRuntime,
      diagnostics: baseDiagnostics.concat(
        heightRuntime.diagnostics.map(diagnostic => createDashboardHeightDiagnostic(diagnostic, previous))
      )
    };
    state.value = next;
    if (!deepEqual(projectionSignature(previous), projectionSignature(next))) {
      emit({ type: "projectionChange", runtime: next });
    }
    if (!deepEqual(previous.diagnostics, next.diagnostics)) {
      emit({ type: "diagnosticsChange", diagnostics: next.diagnostics });
    }
  };

  const stop = () => {
    if (stopped) return;
    stopped = true;
    stopHandles.forEach(handle => handle());
    if (!editorConfig?.controller) editorController?.stop();
  };

  if (getCurrentInstance()) {
    onBeforeUnmount(stop);
  }

  const getInnerEditorProp = (): false | GridEditorProp =>
    editorController ? { ...(editorConfig || {}), controller: editorController } : false;

  return {
    state,
    editorController,
    getInnerEditorProp,
    onLayoutChange,
    onHeightRuntimeChange,
    refresh,
    stop
  };
}
