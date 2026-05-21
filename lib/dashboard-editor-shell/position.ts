import { calcXY, type PositionParams } from "../calculateUtils";
import type { Layout, LayoutItem } from "../utils";
import type {
  DashboardEditorShellDiagnostic,
  DashboardEditorShellListInsertion,
  DashboardEditorShellPositionHelperInput,
  DashboardEditorShellPositionInput,
  DashboardEditorShellPositionResult,
  DashboardEditorShellPositionSource,
  DashboardEditorShellResolvedPosition
} from "./types";

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const toPair = (
  value: unknown,
  fallback: [number, number]
): [number, number] => {
  if (typeof value === "number" && Number.isFinite(value)) return [value, value];
  if (Array.isArray(value)) {
    const x = typeof value[0] === "number" && Number.isFinite(value[0]) ? value[0] : fallback[0];
    const y = typeof value[1] === "number" && Number.isFinite(value[1]) ? value[1] : fallback[1];
    return [x, y];
  }
  return fallback;
};

const diagnostic = (
  code: string,
  level: DashboardEditorShellDiagnostic["level"],
  message: string,
  extra: Partial<DashboardEditorShellDiagnostic> = {}
): DashboardEditorShellDiagnostic => ({
  code,
  level,
  message,
  ...extra
});

const ok = (
  position: DashboardEditorShellResolvedPosition,
  diagnostics: DashboardEditorShellDiagnostic[] = []
): DashboardEditorShellPositionResult => ({
  ok: true,
  position,
  diagnostics
});

const blocked = (
  reason: string,
  message: string,
  diagnostics: DashboardEditorShellDiagnostic[] = []
): DashboardEditorShellPositionResult => ({
  ok: false,
  status: "blocked",
  reason,
  diagnostics: diagnostics.concat(diagnostic(
    `position-${reason}`,
    "warning",
    message,
    { reason, recoverable: true }
  ))
});

const normalizeInputPosition = (
  input: DashboardEditorShellPositionInput | null | undefined,
  source: DashboardEditorShellPositionSource,
  cols: number,
  maxRows: number
): DashboardEditorShellResolvedPosition | null => {
  if (!input || !isFiniteNumber(input.x) || !isFiniteNumber(input.y)) return null;
  const x = Math.max(0, Math.min(Math.floor(input.x), Math.max(0, cols - 1)));
  const y = Math.max(0, Number.isFinite(maxRows)
    ? Math.min(Math.floor(input.y), Math.max(0, maxRows - 1))
    : Math.floor(input.y));
  return {
    x,
    y,
    source: input.source || source,
    list: input.list,
    clientX: input.clientX,
    clientY: input.clientY,
    cols
  };
};

const getItemCenter = (
  item: LayoutItem,
  source: DashboardEditorShellPositionSource,
  cols: number,
  maxRows: number
): DashboardEditorShellResolvedPosition => ({
  x: Math.max(0, Math.min(Math.floor(item.x + item.w), Math.max(0, cols - 1))),
  y: Math.max(0, Number.isFinite(maxRows)
    ? Math.min(Math.floor(item.y + item.h), Math.max(0, maxRows - 1))
    : Math.floor(item.y + item.h)),
  source,
  cols
});

const getSelectionBoundsPosition = (
  layout: Layout,
  ids: string[],
  cols: number,
  maxRows: number
): DashboardEditorShellResolvedPosition | null => {
  const selected = layout.filter(item => ids.indexOf(item.i) !== -1);
  if (selected.length === 0) return null;
  const minX = Math.min(...selected.map(item => item.x));
  const minY = Math.min(...selected.map(item => item.y));
  const maxX = Math.max(...selected.map(item => item.x + item.w));
  const maxY = Math.max(...selected.map(item => item.y + item.h));
  return {
    x: Math.max(0, Math.min(Math.floor((minX + maxX) / 2), Math.max(0, cols - 1))),
    y: Math.max(0, Number.isFinite(maxRows)
      ? Math.min(Math.floor((minY + maxY) / 2), Math.max(0, maxRows - 1))
      : Math.floor((minY + maxY) / 2)),
    source: "selection",
    cols
  };
};

const getEventCoordinates = (
  event: Event | null | undefined
): { clientX: number; clientY: number } | null => {
  if (!event) return null;
  const pointer = event as MouseEvent | PointerEvent | DragEvent;
  if (isFiniteNumber(pointer.clientX) && isFiniteNumber(pointer.clientY)) {
    return { clientX: pointer.clientX, clientY: pointer.clientY };
  }
  const touchEvent = event as TouchEvent;
  const touch = touchEvent.touches?.[0] || touchEvent.changedTouches?.[0];
  if (touch && isFiniteNumber(touch.clientX) && isFiniteNumber(touch.clientY)) {
    return { clientX: touch.clientX, clientY: touch.clientY };
  }
  return null;
};

const getElementScroll = (
  element: HTMLElement
): { left: number; top: number } => ({
  left: isFiniteNumber(element.scrollLeft) ? element.scrollLeft : 0,
  top: isFiniteNumber(element.scrollTop) ? element.scrollTop : 0
});

const getContainerWidth = (
  gridElement: HTMLElement,
  rect: DOMRect | { width?: number }
): number => {
  if (isFiniteNumber(rect.width) && rect.width > 0) return rect.width;
  if (isFiniteNumber(gridElement.clientWidth) && gridElement.clientWidth > 0) return gridElement.clientWidth;
  if (isFiniteNumber(gridElement.offsetWidth) && gridElement.offsetWidth > 0) return gridElement.offsetWidth;
  return 0;
};

const getMaxRows = (runtime: DashboardEditorShellPositionHelperInput["runtime"]): number => {
  const raw = runtime?.gridSettings
    ? (runtime.gridSettings as Record<string, unknown>).maxRows
    : undefined;
  return isFiniteNumber(raw) && raw > 0 ? Math.floor(raw) : Infinity;
};

const getCols = (runtime: DashboardEditorShellPositionHelperInput["runtime"]): number => {
  const columns = runtime?.gridSettings?.columns;
  return isFiniteNumber(columns) && columns > 0 ? Math.floor(columns) : 12;
};

const getRowHeight = (runtime: DashboardEditorShellPositionHelperInput["runtime"]): number => {
  const heightRuntime = runtime?.heightRuntime;
  if (heightRuntime && isFiniteNumber(heightRuntime.rowHeight) && heightRuntime.rowHeight > 0) {
    return heightRuntime.rowHeight;
  }
  const rowHeight = runtime?.gridSettings?.rowHeight;
  return isFiniteNumber(rowHeight) && rowHeight > 0 ? rowHeight : 150;
};

const getListInsertion = (
  layout: Layout,
  y: number
): DashboardEditorShellListInsertion => {
  const ordered = layout.slice().sort((a, b) => a.y - b.y || a.x - b.x || a.i.localeCompare(b.i));
  const index = Math.max(0, Math.min(Math.floor(y), ordered.length));
  return {
    listIndex: index,
    beforeId: ordered[index]?.i,
    afterId: index > 0 ? ordered[index - 1]?.i : undefined
  };
};

const toListPosition = (
  position: DashboardEditorShellResolvedPosition,
  layout: Layout
): DashboardEditorShellResolvedPosition => ({
  ...position,
  x: 0,
  y: Math.max(0, position.list?.listIndex ?? position.y),
  source: position.source === "event" ? "list" : position.source,
  list: position.list || getListInsertion(layout, position.y)
});

export const resolveShellPosition = (
  input: DashboardEditorShellPositionHelperInput
): DashboardEditorShellPositionResult => {
  const runtime = input.runtime || null;
  const layout = input.layout || runtime?.layout || [];
  const cols = getCols(runtime);
  const maxRows = getMaxRows(runtime);
  const diagnostics: DashboardEditorShellDiagnostic[] = [];
  const itemSize = input.itemSize || { w: 1, h: 1 };

  const finish = (
    position: DashboardEditorShellResolvedPosition
  ): DashboardEditorShellPositionResult => {
    const viewFormat = runtime?.viewFormat || "grid";
    if (viewFormat === "list") {
      return ok(toListPosition(position, layout), diagnostics);
    }
    return ok(position, diagnostics);
  };

  const eventCoordinates = getEventCoordinates(input.event);
  if (eventCoordinates) {
    const gridElement = input.gridElement || null;
    if (!gridElement || typeof gridElement.getBoundingClientRect !== "function") {
      return blocked(
        "missing-grid-element",
        "Grid element is required to resolve event coordinates.",
        diagnostics
      );
    }
    const rect = gridElement.getBoundingClientRect();
    const width = getContainerWidth(gridElement, rect);
    if (!Number.isFinite(width) || width <= 0) {
      return blocked("missing-grid-element", "Grid element has no measurable width.", diagnostics);
    }
    const scroll = getElementScroll(gridElement);
    const left = eventCoordinates.clientX - rect.left + scroll.left;
    const top = eventCoordinates.clientY - rect.top + scroll.top;
    const params: PositionParams = {
      margin: toPair(runtime?.gridSettings?.margin, [10, 10]),
      containerPadding: toPair(runtime?.gridSettings?.containerPadding, [0, 0]),
      containerWidth: width,
      cols,
      rowHeight: getRowHeight(runtime),
      maxRows,
      renderPrecision: runtime?.gridSettings?.renderPrecision
    };
    const raw = calcXY(params, top, left, itemSize.w, itemSize.h);
    if (!isFiniteNumber(raw.x) || !isFiniteNumber(raw.y) || raw.x < 0 || raw.y < 0) {
      return blocked("invalid-input", "Event coordinates produced an invalid grid position.", diagnostics);
    }
    return finish({
      x: raw.x,
      y: raw.y,
      source: "event",
      clientX: eventCoordinates.clientX,
      clientY: eventCoordinates.clientY,
      left,
      top,
      cols,
      rowHeight: params.rowHeight
    });
  }

  const activeItemId = input.activeItemId || input.selection?.activeId;
  const activeItem = activeItemId
    ? layout.find(item => item.i === activeItemId)
    : null;
  if (activeItem) return finish(getItemCenter(activeItem, "active-item", cols, maxRows));

  if (input.selection?.selectedIds?.length) {
    const selectionPosition = getSelectionBoundsPosition(layout, input.selection.selectedIds, cols, maxRows);
    if (selectionPosition) return finish(selectionPosition);
  }

  const lastMenu = normalizeInputPosition(input.lastMenuPosition, "last-menu", cols, maxRows);
  if (lastMenu) return finish(lastMenu);

  const lastPointer = normalizeInputPosition(input.lastPointerPosition, "last-pointer", cols, maxRows);
  if (lastPointer) return finish(lastPointer);

  const gridElement = input.gridElement || null;
  if (gridElement && typeof gridElement.getBoundingClientRect === "function") {
    const rect = gridElement.getBoundingClientRect();
    const width = getContainerWidth(gridElement, rect);
    if (width > 0) {
      const rowHeight = getRowHeight(runtime);
      const estimatedRows = Number.isFinite(maxRows)
        ? maxRows
        : Math.max(1, Math.ceil((gridElement.clientHeight || rowHeight) / rowHeight));
      return finish({
        x: Math.max(0, Math.floor(cols / 2)),
        y: Math.max(0, Math.floor(estimatedRows / 2)),
        source: "viewport-center",
        cols,
        rowHeight
      });
    }
  }

  const fallback = normalizeInputPosition(input.fallback || null, "fallback", cols, maxRows);
  if (fallback) return finish(fallback);

  diagnostics.push(diagnostic(
    "position-fallback-origin",
    "info",
    "No pointer, selection, menu, pointer, viewport or caller fallback was available; using origin.",
    { source: "none", recoverable: true }
  ));
  return finish({ x: 0, y: 0, source: "none", cols, rowHeight: getRowHeight(runtime) });
};

export const getEventGridPosition = (
  input: DashboardEditorShellPositionHelperInput
): DashboardEditorShellPositionResult =>
  resolveShellPosition(input);
