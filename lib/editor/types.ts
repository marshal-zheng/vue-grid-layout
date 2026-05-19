import type { ComputedRef, Ref } from "vue";
import type { GridHistoryStore } from "../history";
import type {
  GridLayoutEngineProp,
  LayoutDiagnostics,
  LayoutOperationResult,
  LayoutPatch
} from "../layout-engine";
import type {
  GridLayoutPersistenceController,
  GridLayoutPersistenceProp,
  LayoutPersistenceDocument,
  LayoutPersistenceError,
  LayoutPersistenceEvent,
  LayoutPersistenceMeta,
  LayoutPersistenceStatus,
  LayoutsMap,
  MaybePromise,
  ResponsiveGridLayoutPersistenceProp
} from "../persistence";
import type { Layout, LayoutItem, ResizeHandleAxis } from "../utils";

export type GridEditorMode = "view" | "edit";

export type GridEditorDerivedState =
  | "viewing"
  | "editingClean"
  | "editingDirty"
  | "dragging"
  | "resizing"
  | "keyboardEditing"
  | "savePending"
  | "saveFailed"
  | "conflict";

export type GridEditorSelectionMode = "single" | "multiple";

export type GridEditorSelectionSource =
  | "pointer"
  | "keyboard"
  | "api"
  | "history"
  | "external";

export type GridEditorSelectionState = {
  selectedIds: string[];
  activeId: string | null;
  anchorId: string | null;
  mode: GridEditorSelectionMode;
  source: GridEditorSelectionSource;
};

export type GridEditorItemMeta = {
  locked?: boolean;
  visible?: boolean;
  editable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  deletable?: boolean;
  duplicatable?: boolean;
  copyable?: boolean;
  label?: string;
  data?: Record<string, unknown>;
};

export type GridEditorMetaById = Record<string, GridEditorItemMeta>;

export type GridEditorResolvedCapability = {
  id: string;
  locked: boolean;
  visible: boolean;
  editable: boolean;
  draggable: boolean;
  resizable: boolean;
  bounded: boolean;
  deletable: boolean;
  duplicatable: boolean;
  copyable: boolean;
  resizeHandles?: ResizeHandleAxis[];
  source: {
    layoutStatic?: boolean;
    layoutDraggable?: boolean;
    layoutResizable?: boolean;
    layoutBounded?: boolean;
    metaLocked?: boolean;
    metaVisible?: boolean;
    metaEditable?: boolean;
  };
};

export type GridEditorMetadataPatch =
  | {
      type: "set";
      id: string;
      previous?: GridEditorItemMeta;
      next: GridEditorItemMeta;
    }
  | {
      type: "remove";
      id: string;
      previous?: GridEditorItemMeta;
    };

export type GridEditorCommandType =
  | "select"
  | "clearSelection"
  | "move"
  | "resize"
  | "add"
  | "delete"
  | "duplicate"
  | "copy"
  | "paste"
  | "align"
  | "distribute"
  | "tidy"
  | "lock"
  | "unlock"
  | "show"
  | "hide"
  | "save"
  | "discard"
  | "reset"
  | "undo"
  | "redo"
  | "section-row-collapse"
  | "section-row-expand"
  | "section-row-move"
  | "section-row-delete"
  | "section-row-reorder";

export type GridEditorCommandSource =
  | "pointer"
  | "keyboard"
  | "toolbar"
  | "context-menu"
  | "api"
  | "persistence";

export type GridEditorCommand = {
  id?: string;
  type: GridEditorCommandType;
  targetIds?: string[];
  payload?: unknown;
  source?: GridEditorCommandSource;
  history?: {
    mergeKey?: string;
    mergeWindowMs?: number;
    skip?: boolean;
  };
};

export type GridEditorCommandStatus =
  | "changed"
  | "noop"
  | "blocked"
  | "cancelled"
  | "timeout"
  | "error";

export type GridEditorBlockedReason =
  | "mode-readonly"
  | "editor-mode-missing"
  | "capability"
  | "locked"
  | "hidden"
  | "static-item"
  | "collision"
  | "bounds"
  | "maxRows"
  | "missing-item"
  | "selection-count"
  | "unsupported-scope"
  | "section-row-locked"
  | "section-row-collapsed"
  | "section-row-policy"
  | "clipboard-unavailable"
  | "clipboard-permission"
  | "clipboard-invalid"
  | "before-command-blocked"
  | "before-command-cancelled"
  | "before-command-timeout"
  | "multi-resize-unsupported"
  | "persistence-error"
  | "conflict"
  | "invalid-input";

export type GridEditorCommandResult = {
  id: string;
  type: GridEditorCommandType;
  status: GridEditorCommandStatus;
  targetIds: string[];
  layoutPatches: LayoutPatch[];
  metadataPatches: GridEditorMetadataPatch[];
  affectedIds: string[];
  selection?: GridEditorSelectionState;
  blocked?: {
    reason: GridEditorBlockedReason;
    itemIds?: string[];
    message?: string;
    skippedIds?: string[];
  };
  diagnostics?: {
    durationMs: number;
    guardMs?: number;
    guideCount?: number;
    layoutDiagnostics?: LayoutDiagnostics;
    operationResult?: LayoutOperationResult;
    intelligence?: GridEditorIntelligenceDiagnostics;
    computed?: GridEditorCommandComputedDiagnostics;
    messages?: GridEditorMessage[];
  };
  undo?: GridEditorHistoryEntry;
  error?: {
    message: string;
    cause?: unknown;
  };
};

export type GridEditorMessageLevel = "info" | "warning" | "error";

export type GridEditorMessage = {
  code: string;
  level: GridEditorMessageLevel;
  message: string;
  itemIds?: string[];
  recoverable?: boolean;
};

export type GridEditorBeforeCommandResult =
  | { status: "allow" }
  | { status: "block"; reason?: GridEditorBlockedReason; message?: string }
  | { status: "cancel"; message?: string }
  | { status: "timeout"; message?: string }
  | { status: "error"; error?: unknown; message?: string };

export type GridEditorBeforeCommandContext = {
  command: GridEditorCommand;
  targetIds: string[];
  layout: Layout;
  layouts?: LayoutsMap;
  editorMetaById: GridEditorMetaById;
  selection: GridEditorSelectionState;
  mode: GridEditorMode;
};

export type GridEditorBeforeCommand = (
  context: GridEditorBeforeCommandContext
) => MaybePromise<GridEditorBeforeCommandResult | boolean | void>;

export type GridEditorConflict = {
  key?: string;
  reason: string;
  localValue?: Layout | LayoutsMap;
  externalValue?: Layout | LayoutsMap;
  localEditorMetaById?: GridEditorMetaById;
  externalEditorMetaById?: GridEditorMetaById;
  localDocument?: LayoutPersistenceDocument;
  externalDocument?: LayoutPersistenceDocument;
  resolveActions?: Array<"useLocal" | "useRemote" | "merge">;
};

export type GridEditorGuideKind =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "center-x"
  | "center-y"
  | "spacing-x"
  | "spacing-y";

export type GridEditorGuideAxis = "x" | "y";

export type GridEditorGuideDisplayKind = "alignment" | "spacing";

export type GridEditorGuideDisplay = {
  kind: GridEditorGuideDisplayKind;
  start: number;
  end: number;
  label?: string;
  showLabel?: boolean;
  sourceIds: string[];
};

export type GridEditorGuideEdgeSide =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "center-x"
  | "center-y";

export type GridEditorGuide = {
  id: string;
  kind: GridEditorGuideKind;
  axis: GridEditorGuideAxis;
  position: number;
  sourceIds: string[];
  targetId: string;
  distance: number;
  priority: number;
  proximity?: number;
  isPredictive?: boolean;
  isSnapped?: boolean;
  anchorIds?: string[];
  sourceEdge?: GridEditorGuideEdgeSide;
  targetEdge?: GridEditorGuideEdgeSide;
  display?: GridEditorGuideDisplay;
};

export type GridEditorGuideInteraction = "drag" | "resize" | "drop" | "keyboard" | "api";

export type GridEditorIntelligenceInteraction =
  | GridEditorGuideInteraction
  | "toolbar";

export type GridEditorSpacingChipSide = "top" | "right" | "bottom" | "left";

export type GridEditorSpacingChip = {
  id: string;
  side: GridEditorSpacingChipSide;
  axis: GridEditorGuideAxis;
  position: number;
  span: { start: number; end: number };
  distance: number;
  unit: "col" | "row";
  isEqual: boolean;
  neighborId: string | null;
};

export type GridEditorMeasurementHud = {
  itemId: string;
  label?: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  delta?: { dx?: number; dy?: number; dw?: number; dh?: number };
  interaction: GridEditorGuideInteraction;
  commandType?: GridEditorCommandType;
  selectionCount?: number;
  targetLine?: number;
  targetSpacing?: number;
  affectedCount?: number;
  ariaLive?: "off" | "polite" | "assertive";
  blocked?: GridEditorBlockedReason;
  blockedMessage?: string;
  blockedItemIds?: string[];
};

export type GridEditorGuideAnchorEdge = {
  itemId: string;
  sides: GridEditorGuideEdgeSide[];
  role: "active" | "source";
};

export type GridEditorGuideState = {
  activeId: string | null;
  interaction?: GridEditorGuideInteraction;
  guides: GridEditorGuide[];
  displayGuides?: GridEditorGuide[];
  debugGuides?: GridEditorGuide[];
  snappedGuideIds: string[];
  spacingLabelGuideIds?: string[];
  spacingChips?: GridEditorSpacingChip[];
  measurementHud?: GridEditorMeasurementHud | null;
  anchorEdges?: GridEditorGuideAnchorEdge[];
  showGrid?: boolean;
  debug?: boolean;
  debugMode?: false | "layer" | "panel";
  diagnostics?: {
    durationMs: number;
    itemCount: number;
    degraded?: boolean;
    reason?: string;
    fullGuideCount?: number;
    displayGuideCount?: number;
    spacingLabelCount?: number;
    predictCount?: number;
    snappedCount?: number;
    anchorEdgeCount?: number;
    spacingChipCount?: number;
    intelligence?: GridEditorIntelligenceDiagnostics;
  };
};

/**
 * L3 module boundary notes:
 * - editor/intelligence owns SSR-safe geometry semantics, candidates, diagnostics and
 *   section/row membership.
 * - editor/commands owns command payload validation and patch computation, but submits
 *   layout changes through controller/history/persistence boundaries.
 * - editor/controller owns command orchestration, beforeCommand, history, dirty state
 *   and persistence.
 * - layout-engine owns generic collision, bounds, fit and operation diagnostics.
 * - VueGridLayout owns pointer/drop coordinate collection, preview/commit adapter
 *   calls and rendering of guide state only.
 * - examples own toolbar styling and labels; core APIs remain headless-first.
 */

export type GridEditorDiagnosticCode = string;

export type GridEditorIntelligenceDegradedReason =
  | "max-items"
  | "max-duration"
  | "collision"
  | "bounds"
  | "maxRows"
  | "locked"
  | "capability"
  | "section-row-policy";

export type GridEditorItemRect = Pick<LayoutItem, "i" | "x" | "y" | "w" | "h"> & {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  area: number;
  sectionId?: string;
  rowId?: string;
};

export type GridEditorGeometryIndex = {
  byId: Record<string, GridEditorItemRect>;
  ids: string[];
  rows: Record<number, string[]>;
  columns: Record<number, string[]>;
};

export type GridEditorNeighborDirection = "before" | "after" | "overlap";

export type GridEditorNeighborRelation = {
  id: string;
  sourceId: string;
  targetId: string;
  axis: GridEditorGuideAxis;
  direction: GridEditorNeighborDirection;
  gap: number;
  overlap: number;
  priority: number;
  sectionId?: string;
  rowId?: string;
};

export type GridEditorSpacingRelation = {
  id: string;
  axis: GridEditorGuideAxis;
  sourceId: string;
  targetId: string;
  side: GridEditorSpacingChipSide;
  start: number;
  end: number;
  position: number;
  distance: number;
  unit: "col" | "row";
  isEqual?: boolean;
  deviation?: number;
  mode?: GridEditorDistributeMode;
  sectionId?: string;
  rowId?: string;
};

export type GridEditorSectionRowKind = "section" | "row";

export type GridEditorSectionRowBoundsPolicy = "fixed" | "content" | "viewport";

export type GridEditorSectionRowDropPolicy = "inside" | "between" | "none";

export type GridEditorSectionRowCrossScopePolicy = "allow" | "block" | "ask";

export type GridEditorSectionRow = {
  id: string;
  kind: GridEditorSectionRowKind;
  label?: string;
  parentId?: string;
  order: number;
  bounds?: { x: number; y: number; w: number; h: number };
  boundsPolicy?: GridEditorSectionRowBoundsPolicy;
  collapsed?: boolean;
  locked?: boolean;
  itemIds?: string[];
  dropPolicy?: GridEditorSectionRowDropPolicy;
  crossScopePolicy?: GridEditorSectionRowCrossScopePolicy;
  allowedDropZones?: Array<"start" | "inside" | "end" | "between">;
};

export type GridEditorSectionRowState = {
  version: 1;
  items: Record<string, GridEditorSectionRow>;
  itemMembership?: Record<string, { sectionId?: string; rowId?: string }>;
};

export type GridEditorResolvedSectionRowState = {
  version: 1;
  items: Record<string, GridEditorSectionRow>;
  itemMembership: Record<string, { sectionId?: string; rowId?: string }>;
  warnings: GridEditorMessage[];
};

export type GridEditorSnapCandidateKind = "edge" | "center" | "spacing" | "section-row";

export type GridEditorSnapCandidate = {
  id: string;
  kind: GridEditorSnapCandidateKind;
  axis: GridEditorGuideAxis;
  sourceIds: string[];
  targetId: string;
  targetEdge: GridEditorGuideEdgeSide;
  sourceEdge?: GridEditorGuideEdgeSide;
  distance: number;
  proximity: number;
  priority: number;
  snapped: boolean;
  geometry: Pick<LayoutItem, "x" | "y" | "w" | "h">;
  guideIds: string[];
  sectionId?: string;
  rowId?: string;
  blocked?: GridEditorBlockedReason;
  filteredReason?: GridEditorDiagnosticCode;
};

export type GridEditorSnapResolution = {
  status: "none" | "snapped" | "blocked" | "disabled" | "degraded";
  candidate?: GridEditorSnapCandidate;
  geometry: Pick<LayoutItem, "x" | "y" | "w" | "h">;
  guideIds: string[];
  previousGuideId?: string;
  nextGuideId?: string;
  snapKind?: GridEditorSnapCandidateKind;
  blocked?: {
    reason: GridEditorBlockedReason;
    itemIds?: string[];
    message?: string;
  };
  diagnostics: GridEditorIntelligenceDiagnostics;
};

export type GridEditorSnapResolveOptions = {
  snap?: boolean;
  layout?: Layout;
  cols?: number;
  maxRows?: number;
  allowOverlap?: boolean;
  metaById?: GridEditorMetaById;
  previousGuideId?: string;
  allowCrossSectionRow?: boolean;
  validate?: (
    geometry: Pick<LayoutItem, "x" | "y" | "w" | "h">,
    candidate: GridEditorSnapCandidate
  ) => GridEditorBlockedReason | null | undefined;
};

export type GridEditorAlignMode =
  | "left"
  | "center-x"
  | "right"
  | "top"
  | "center-y"
  | "bottom";

export type GridEditorAlignTarget =
  | { type: "selection-bounds" }
  | { type: "active-item"; id?: string }
  | { type: "last-selected" }
  | { type: "section-row"; id: string; bounds?: { x: number; y: number; w: number; h: number } }
  | { type: "explicit-line"; axis: GridEditorGuideAxis; position: number };

export type GridEditorCollisionStrategy = "block" | "push" | "skip-blocked";

export type GridEditorAlignPayload = {
  mode: GridEditorAlignMode;
  target?: GridEditorAlignTarget;
  collisionStrategy?: GridEditorCollisionStrategy;
};

export type GridEditorDistributeMode =
  | "horizontal"
  | "vertical"
  | "spacing-x"
  | "spacing-y";

export type GridEditorDistributeStrategy = "edge-to-edge" | "center-to-center";

export type GridEditorDistributePayload = {
  mode: GridEditorDistributeMode;
  strategy?: GridEditorDistributeStrategy;
  bounds?: "selection" | "active-item" | "section-row" | "explicit";
  sectionRowId?: string;
  explicitBounds?: { start: number; end: number };
  collisionStrategy?: GridEditorCollisionStrategy;
};

export type GridEditorTidyPayload = {
  axis?: "x" | "y" | "both";
  scope?: "selection" | "section-row" | "layout";
  sectionRowId?: string;
  minSpacing?: number;
  strategy?: GridEditorDistributeStrategy;
  collisionStrategy?: GridEditorCollisionStrategy;
};

export type GridEditorSectionRowCommandPayload = {
  id?: string;
  ids?: string[];
  itemIds?: string[];
  dy?: number;
  order?: number;
  beforeId?: string;
  afterId?: string;
  deleteItems?: boolean;
};

export type GridEditorDistributionCandidate = {
  id: string;
  mode: GridEditorDistributeMode;
  axis: GridEditorGuideAxis;
  strategy: GridEditorDistributeStrategy;
  itemIds: string[];
  movableIds: string[];
  currentSpacing: number[];
  targetSpacing: number;
  isEqual: boolean;
  deviation: number;
  bounds: { start: number; end: number };
  anchor?: { type: "selection" | "active-item" | "section-row" | "explicit"; id?: string };
  sectionId?: string;
  rowId?: string;
  blocked?: GridEditorBlockedReason;
};

export type GridEditorCommandComputedDiagnostics = {
  targetLine?: {
    axis: GridEditorGuideAxis;
    position: number;
    mode?: GridEditorAlignMode;
  };
  targetSpacing?: {
    axis: GridEditorGuideAxis;
    value: number;
    mode?: GridEditorDistributeMode;
    strategy?: GridEditorDistributeStrategy;
  };
  affectedIds?: string[];
  skippedIds?: string[];
  sectionRowContext?: {
    sectionId?: string;
    rowId?: string;
    source?: "metadata" | "inferred" | "none";
  };
  fallback?: string;
};

export type GridEditorGeometryCommandContext = {
  targetIds?: string[];
  selectedIds?: string[];
  activeId?: string | null;
  metaById?: GridEditorMetaById;
  sectionRows?: GridEditorSectionRowState | null;
  cols?: number;
  maxRows?: number;
  compactType?: import("../utils").CompactType;
  allowOverlap?: boolean;
  preventCollision?: boolean;
  skippedIds?: string[];
};

export type GridEditorGeometryPatchResult = {
  status: "changed" | "noop" | "blocked";
  layout: Layout;
  layoutPatches: LayoutPatch[];
  affectedIds: string[];
  skippedIds?: string[];
  blocked?: {
    reason: GridEditorBlockedReason;
    itemIds?: string[];
    message?: string;
    skippedIds?: string[];
  };
  diagnostics: {
    durationMs: number;
    intelligence?: GridEditorIntelligenceDiagnostics;
    computed?: GridEditorCommandComputedDiagnostics;
    messages?: GridEditorMessage[];
  };
};

export type GridEditorIntelligenceOptions = GridEditorGuidesOptions & {
  allowCrossSectionRow?: boolean;
  sectionRows?: GridEditorSectionRowState | null;
  maxDistributionCandidates?: number;
  maxSnapCandidates?: number;
  diagnostics?: boolean;
  resizeHandle?: ResizeHandleAxis;
};

export type GridEditorIntelligenceInput = {
  layout: Layout;
  activeItem?: LayoutItem | null;
  candidateItem?: LayoutItem | null;
  selectionIds?: string[];
  metaById?: GridEditorMetaById;
  sectionRows?: GridEditorSectionRowState | null;
  cols: number;
  maxRows?: number;
  margin?: number[];
  rowHeight?: number;
  resizeHandle?: ResizeHandleAxis;
  compactType?: "vertical" | "horizontal" | null;
  allowOverlap?: boolean;
  preventCollision?: boolean;
  interaction: GridEditorIntelligenceInteraction;
  startGeometry?: Record<string, Pick<LayoutItem, "x" | "y" | "w" | "h">>;
  options?: GridEditorIntelligenceOptions;
};

export type GridEditorIntelligenceDiagnostics = {
  durationMs: number;
  itemCount: number;
  selectedCount: number;
  candidateCount: number;
  snapCandidateCount: number;
  distributionCandidateCount: number;
  spacingRelationCount: number;
  sectionRowCount: number;
  snapSource?: GridEditorSnapCandidateKind | "none";
  distributionMode?: GridEditorDistributeMode | "none";
  sectionRowSource?: "metadata" | "inferred" | "none";
  degraded?: boolean;
  reason?: GridEditorIntelligenceDegradedReason;
  filtered?: Array<{
    code: GridEditorDiagnosticCode;
    itemIds?: string[];
    reason?: GridEditorBlockedReason;
  }>;
  codes: GridEditorDiagnosticCode[];
};

export type GridEditorIntelligenceState = {
  itemRects: Record<string, GridEditorItemRect>;
  geometryIndex: GridEditorGeometryIndex;
  neighbors: GridEditorNeighborRelation[];
  snapCandidates: GridEditorSnapCandidate[];
  spacingRelations: GridEditorSpacingRelation[];
  distributionCandidates: GridEditorDistributionCandidate[];
  sectionRows: GridEditorResolvedSectionRowState;
  guideState: GridEditorGuideState;
  measurementHud?: GridEditorMeasurementHud | null;
  diagnostics: GridEditorIntelligenceDiagnostics;
};

export type GridEditorCommandAvailability = {
  command: GridEditorCommandType;
  enabled: boolean;
  reason?: GridEditorBlockedReason | "selection-count" | "unsupported-scope";
  requiredSelectionCount?: number;
  blockedIds?: string[];
  messageKey?: string;
};

export type GridEditorToolbarState = {
  commands: Partial<Record<GridEditorCommandType, GridEditorCommandAvailability>>;
  selectionSummary: {
    count: number;
    movableCount: number;
    lockedCount: number;
    hiddenCount: number;
    sectionRowIds: string[];
  };
  intelligenceSummary?: {
    equalSpacing?: boolean;
    distributionMode?: GridEditorDistributeMode;
    snapCandidateCount: number;
    degraded?: boolean;
    reason?: GridEditorIntelligenceDegradedReason;
  };
};

export type GridEditorMaxVisibleGuides =
  | number
  | {
      drag?: number;
      resize?: number;
      drop?: number;
      keyboard?: number;
      api?: number;
    };

export type GridEditorGuidesOptions = {
  enabled?: boolean;
  snap?: boolean;
  cols?: number;
  maxRows?: number;
  margin?: number[];
  rowHeight?: number;
  resizeHandle?: ResizeHandleAxis;
  thresholdPx?: number;
  includeLocked?: boolean;
  includeHidden?: boolean;
  includeStatic?: boolean;
  maxItems?: number;
  maxDurationMs?: number;
  maxVisibleGuides?: GridEditorMaxVisibleGuides;
  showGrid?: boolean | "interaction";
  showSpacingLabels?: boolean;
  debug?: boolean | "layer" | "panel";
  interaction?: GridEditorGuideInteraction;
  predictRadiusX?: number;
  predictRadiusY?: number;
  snapThresholdCells?: number;
  showSpacingChips?: boolean;
  showMeasurementHud?: boolean;
  highlightAlignmentTargets?: boolean;
  detectEqualSpacing?: boolean;
  sectionSnap?: boolean;
  spacingChipMinDistance?: number;
  itemLabels?: Record<string, string>;
  startGeometry?: Record<string, Pick<LayoutItem, "x" | "y" | "w" | "h">>;
  delta?: { dx?: number; dy?: number; dw?: number; dh?: number };
  blocked?: { reason?: GridEditorBlockedReason; message?: string; itemIds?: string[] };
};

export type GridEditorClipboardPayload = {
  version: 1;
  sourceId: string;
  copiedAt: string;
  items: Layout;
  editorMetaById: GridEditorMetaById;
};

export type GridEditorClipboardAdapter = {
  read: () => MaybePromise<GridEditorClipboardPayload | null>;
  write: (payload: GridEditorClipboardPayload) => MaybePromise<void>;
};

export type GridEditorClipboardMode =
  | "internal"
  | "system"
  | GridEditorClipboardAdapter;

export type GridEditorHistorySnapshot =
  | {
      kind: "layout";
      layout: Layout;
      editorMetaById: GridEditorMetaById;
      sectionRows: GridEditorSectionRowState;
      selection: GridEditorSelectionState;
      focusId: string | null;
    }
  | {
      kind: "responsive";
      layouts: LayoutsMap;
      breakpoint: string;
      editorMetaById: GridEditorMetaById;
      sectionRows: GridEditorSectionRowState;
      selection: GridEditorSelectionState;
      focusId: string | null;
    };

export type GridEditorHistoryEntry = {
  id: string;
  commandId?: string;
  commandType?: GridEditorCommandType;
  before: GridEditorHistorySnapshot;
  after: GridEditorHistorySnapshot;
  createdAt: string;
  mergeKey?: string;
};

export type GridEditorHistoryController = {
  canUndo: Ref<boolean>;
  canRedo: Ref<boolean>;
  push: (entry: GridEditorHistoryEntry) => void;
  undo: () => GridEditorHistoryEntry | null;
  redo: () => GridEditorHistoryEntry | null;
  replacePresent: (snapshot: GridEditorHistorySnapshot | null) => void;
  clear: (snapshot?: GridEditorHistorySnapshot | null) => void;
};

export type GridEditorPersistenceEnvelope = {
  version: 1 | 2;
  editorMetaById: GridEditorMetaById;
  sectionRows?: GridEditorSectionRowState;
  toolbar?: {
    lastUsedAlign?: GridEditorAlignMode;
    lastUsedDistribute?: GridEditorDistributeMode;
  };
  updatedAt: string;
};

export type GridEditorPersistenceBridge = {
  meta: () => LayoutPersistenceMeta;
  onPersistenceEvent: (
    event: LayoutPersistenceEvent<Layout | LayoutsMap>
  ) => void;
  save: () => Promise<GridEditorCommandResult>;
  discard: () => GridEditorCommandResult;
  reset: () => GridEditorCommandResult;
};

export type GridEditorKeyboardOptions = {
  enabled?: boolean;
  target?: unknown;
  platform?: "auto" | "mac" | "standard";
  moveStep?: number;
  fastMoveStep?: number;
  resizeStep?: number;
  fastResizeStep?: number;
  ignoredTargets?: Array<string | ((target: unknown) => boolean)>;
  ariaMessage?: (message: GridEditorMessage) => void;
};

export type GridEditorPasteStrategy =
  | "offset"
  | "cursor"
  | "nearest-fit"
  | "first-fit";

export type GridEditorCommandPolicy = "all-or-nothing" | "skip-blocked";

export type UseGridEditorOptions = {
  kind?: "layout" | "responsive";
  layout?: Ref<Layout>;
  layouts?: Ref<LayoutsMap>;
  breakpoint?: Ref<string>;
  mode?: Ref<GridEditorMode>;
  defaultMode?: GridEditorMode;
  selectedIds?: Ref<string[]>;
  activeId?: Ref<string | null>;
  defaultSelectedIds?: string[];
  editorMetaById?: Ref<GridEditorMetaById>;
  defaultEditorMetaById?: GridEditorMetaById;
  sectionRows?: Ref<GridEditorSectionRowState>;
  defaultSectionRows?: GridEditorSectionRowState;
  layoutEngine?: false | GridLayoutEngineProp;
  persistence?:
    | GridLayoutPersistenceProp
    | ResponsiveGridLayoutPersistenceProp
    | GridLayoutPersistenceController<Layout | LayoutsMap>;
  history?: false | GridEditorHistoryController;
  legacyHistoryStore?: GridHistoryStore;
  keyboard?: false | GridEditorKeyboardOptions;
  clipboard?: GridEditorClipboardMode;
  guides?: false | GridEditorGuidesOptions;
  beforeCommand?: GridEditorBeforeCommand;
  guardTimeoutMs?: number;
  idGenerator?: (baseId: string, existingIds: Set<string>) => string;
  pasteStrategy?: GridEditorPasteStrategy;
  commandPolicy?: GridEditorCommandPolicy;
  onEvent?: (event: GridEditorEvent) => void;
};

export type GridEditorProp = Omit<
  UseGridEditorOptions,
  "layout" | "layouts" | "breakpoint"
> & {
  controller?: GridEditorController;
};

export type GridEditorController = {
  mode: Ref<GridEditorMode>;
  state: ComputedRef<GridEditorDerivedState>;
  selection: Ref<GridEditorSelectionState>;
  editorMetaById: Ref<GridEditorMetaById>;
  sectionRows: Ref<GridEditorSectionRowState>;
  dirty: ComputedRef<boolean>;
  conflict: Ref<GridEditorConflict | null>;
  guides: Ref<GridEditorGuideState>;
  lastResult: Ref<GridEditorCommandResult | null>;
  execute: (command: GridEditorCommand) => Promise<GridEditorCommandResult>;
  canExecute: (command: GridEditorCommand) => GridEditorCommandResult;
  getToolbarState: () => GridEditorToolbarState;
  undo: () => Promise<GridEditorCommandResult>;
  redo: () => Promise<GridEditorCommandResult>;
  save: () => Promise<GridEditorCommandResult>;
  discard: () => Promise<GridEditorCommandResult>;
  reset: () => Promise<GridEditorCommandResult>;
  setExternalLayout: (layout: Layout, reason?: string) => void;
  setExternalLayouts: (
    layouts: LayoutsMap,
    breakpoint: string,
    reason?: string
  ) => void;
  stop: () => void;
};

export type GridEditorEvent =
  | {
      type: "mode-change";
      from: GridEditorMode;
      to: GridEditorMode;
      source: string;
      commandId?: string;
    }
  | {
      type: "editor-state-change";
      state: GridEditorDerivedState;
      previous?: GridEditorDerivedState;
      reason: string;
      commandId?: string;
    }
  | {
      type: "selection-change";
      selection: GridEditorSelectionState;
      previous: GridEditorSelectionState;
      requested?: boolean;
    }
  | { type: "command-start"; command: GridEditorCommand }
  | {
      type: "command-commit";
      command: GridEditorCommand;
      result: GridEditorCommandResult;
    }
  | {
      type: "command-blocked";
      command: GridEditorCommand;
      result: GridEditorCommandResult;
    }
  | {
      type: "command-error";
      command: GridEditorCommand;
      result: GridEditorCommandResult;
    }
  | {
      type: "guide-change";
      guides: GridEditorGuide[];
      activeId: string | null;
    }
  | {
      type: "intelligence-change";
      activeId: string | null;
      diagnostics: GridEditorIntelligenceDiagnostics;
    }
  | {
      type: "snap-change";
      activeId: string;
      previousGuideId?: string;
      nextGuideId?: string;
      snapKind?: GridEditorSnapCandidateKind;
      geometry: Pick<LayoutItem, "x" | "y" | "w" | "h">;
    }
  | {
      type: "save-state-change";
      status: LayoutPersistenceStatus;
      dirty: boolean;
      error?: LayoutPersistenceError | null;
    }
  | { type: "conflict"; conflict: GridEditorConflict }
  | {
      type: "focus-change";
      from: string | null;
      to: string | null;
      reason: string;
    }
  | {
      type: "editor-error";
      code: string;
      message: string;
      details?: unknown;
    };

export type GridEditorA11yItemDescription = {
  id: string;
  label: string;
  position: Pick<LayoutItem, "x" | "y" | "w" | "h">;
  locked: boolean;
  selected: boolean;
  commands: GridEditorCommandType[];
};
