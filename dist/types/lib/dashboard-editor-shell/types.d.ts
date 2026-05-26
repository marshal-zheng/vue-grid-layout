import type { Ref } from "vue";
import type { DashboardDocumentWriteBackOwner, DashboardLayoutDocument, DashboardWriteResult } from "../dashboard";
import type { DashboardResponsiveMode, DashboardResponsiveProfileModel, DashboardResponsiveRuntime, DashboardTargetView, MaybeRef } from "../dashboard-responsive";
import type { GridEditorCommand, GridEditorCommandResult, GridEditorCommitPlacementInput, GridEditorConflict, GridEditorBlockedReason, GridEditorController, GridEditorMode, GridEditorSelectionState, GridEditorToolbarState } from "../editor";
import type { GridEditorPlacementCollisionPolicy, GridEditorPlacementSummary } from "../editor/placement";
import type { LayoutPatch, LayoutRepairPolicy } from "../layout-engine";
import type { MaybePromise } from "../persistence";
import type { GridHistoryStore } from "../history";
import type { CompactType, Layout, LayoutItem } from "../utils";
export type DashboardEditorShellActionStatus = "success" | "noop" | "blocked" | "cancelled" | "unsupported" | "timeout" | "error";
export type DashboardEditorShellActionType = "pointer-move" | "pointer-resize" | "resolve-position" | "paste" | "select" | "highlight" | "reset-highlight" | "scroll-to-item" | "prepare-dashboard-menu" | "prepare-widget-menu" | "close-menu" | "copy-widget" | "cut-widget" | "place-clipboard" | "paste-widget" | "duplicate-widget" | "remove-widget" | "copy-reference" | "paste-reference" | "replace-reference" | "open-palette" | "add-widget" | "external-drop" | "move-all" | "undo" | "redo" | "keyboard" | "cleanup";
export type DashboardEditorShellSyntheticCommitData = {
    commandId: string;
    commandType: GridEditorCommand["type"];
    historyEntryId?: string;
    synthesized: true;
};
export type DashboardEditorShellActionSource = "api" | "context-menu" | "keyboard" | "toolbar" | "palette" | "drop" | "pointer" | "lifecycle";
export type DashboardEditorShellBlockedReason = GridEditorBlockedReason | "mode-readonly" | "capability" | "locked" | "hidden" | "missing-item" | "missing-editor" | "missing-runtime" | "missing-grid-element" | "clipboard-unavailable" | "clipboard-permission" | "clipboard-invalid" | "adapter-unavailable" | "adapter-rejected" | "validation" | "profile-write-back" | "collision" | "bounds" | "maxRows" | "confirm-cancelled" | "guard-blocked" | "unsupported" | "invalid-input" | "dom-unavailable";
export type DashboardEditorShellDiagnosticLevel = "info" | "warning" | "error";
export type DashboardEditorShellDiagnostic = {
    code: string;
    level: DashboardEditorShellDiagnosticLevel;
    message: string;
    actionId?: string;
    actionType?: DashboardEditorShellActionType;
    source?: DashboardEditorShellActionSource;
    reason?: DashboardEditorShellBlockedReason;
    recoverable?: boolean;
    hint?: string;
    itemId?: string;
    itemIds?: string[];
    layoutId?: string | null;
    resolvedProfileId?: string | null;
    requestedBreakpoint?: string | null;
    targetView?: DashboardTargetView | null;
    viewFormat?: "grid" | "list" | null;
    path?: string;
    details?: unknown;
};
export type DashboardEditorShellAvailability = {
    available: boolean;
    reason?: DashboardEditorShellBlockedReason;
    hidden?: boolean;
    diagnostics?: DashboardEditorShellDiagnostic[];
    metadata?: Record<string, unknown>;
};
export type DashboardEditorShellPositionSource = "event" | "active-item" | "selection" | "last-menu" | "last-pointer" | "viewport-center" | "fallback" | "strategy" | "list" | "none";
export type DashboardEditorShellListInsertion = {
    listIndex: number;
    beforeId?: string;
    afterId?: string;
};
export type DashboardEditorShellResolvedPosition = {
    x: number;
    y: number;
    source: DashboardEditorShellPositionSource;
    list?: DashboardEditorShellListInsertion;
    clientX?: number;
    clientY?: number;
    left?: number;
    top?: number;
    cols?: number;
    rowHeight?: number;
};
export type DashboardEditorShellPositionInput = Partial<Pick<DashboardEditorShellResolvedPosition, "x" | "y" | "source" | "list" | "clientX" | "clientY">>;
export type DashboardEditorShellPositionRequest = {
    source?: DashboardEditorShellActionSource;
    fallback?: DashboardEditorShellPositionInput | null;
    activeItemId?: string | null;
    itemSize?: Pick<LayoutItem, "w" | "h">;
    clamp?: boolean;
    listIndex?: number;
};
export type DashboardEditorShellPositionHelperInput = DashboardEditorShellPositionRequest & {
    event?: Event | null;
    runtime?: DashboardResponsiveRuntime | null;
    layout?: Layout | null;
    selection?: GridEditorSelectionState | null;
    gridElement?: HTMLElement | null;
    lastMenuPosition?: DashboardEditorShellResolvedPosition | null;
    lastPointerPosition?: DashboardEditorShellResolvedPosition | null;
};
export type DashboardEditorShellPositionResult = {
    ok: true;
    position: DashboardEditorShellResolvedPosition;
    diagnostics: DashboardEditorShellDiagnostic[];
} | {
    ok: false;
    status: "blocked" | "error";
    reason: DashboardEditorShellBlockedReason;
    diagnostics: DashboardEditorShellDiagnostic[];
    position?: never;
};
export type DashboardEditorShellMenuTarget = {
    type: "dashboard";
    position?: DashboardEditorShellResolvedPosition;
} | {
    type: "widget";
    itemId: string;
    position?: DashboardEditorShellResolvedPosition;
};
export type DashboardEditorShellMenuDescriptor = {
    id: string;
    type?: "item" | "separator" | "group";
    label?: string;
    labelKey?: string;
    icon?: string;
    shortcut?: string;
    enabled?: boolean;
    hidden?: boolean;
    checked?: boolean;
    danger?: boolean;
    reason?: string;
    target?: DashboardEditorShellMenuTarget;
    metadata?: Record<string, unknown>;
    children?: DashboardEditorShellMenuDescriptor[];
    action?: () => MaybePromise<DashboardEditorShellActionResult>;
};
export type DashboardEditorShellPreparedMenu = {
    id: string;
    target: DashboardEditorShellMenuTarget;
    position?: DashboardEditorShellResolvedPosition;
    items: DashboardEditorShellMenuDescriptor[];
    diagnostics: DashboardEditorShellDiagnostic[];
};
export type DashboardEditorShellMenuRequest = {
    source?: DashboardEditorShellActionSource;
    includeHidden?: boolean;
    customItems?: DashboardEditorShellMenuDescriptor[];
};
export type DashboardEditorShellMenuOptions = {
    customDashboardItems?: DashboardEditorShellMenuDescriptor[] | ((ctx: DashboardEditorShellMenuContext) => DashboardEditorShellMenuDescriptor[]);
    customWidgetItems?: DashboardEditorShellMenuDescriptor[] | ((ctx: DashboardEditorShellMenuContext) => DashboardEditorShellMenuDescriptor[]);
    defaultAddStrategy?: DashboardEditorShellPlacementStrategy;
    defaultPasteStrategy?: DashboardEditorShellPlacementStrategy;
    defaultReferencePasteStrategy?: DashboardEditorShellPlacementStrategy;
    labelFactory?: (id: string, ctx: DashboardEditorShellMenuContext) => string | undefined;
    shortcuts?: Partial<Record<DashboardEditorShellActionType, string>>;
};
export type DashboardEditorShellMenuContext = {
    target: DashboardEditorShellMenuTarget;
    runtime: DashboardResponsiveRuntime | null;
    mode: GridEditorMode | DashboardResponsiveMode | null;
    readonly: boolean;
    editor: GridEditorController | null;
};
export type DashboardEditorShellAdapterContext = {
    actionId: string;
    actionType: DashboardEditorShellActionType;
    source: DashboardEditorShellActionSource;
    itemIds: string[];
    runtime: DashboardResponsiveRuntime | null;
    document: DashboardLayoutDocument | null;
    position?: DashboardEditorShellResolvedPosition;
    placementIntent?: DashboardEditorShellPlacementIntent;
    template?: DashboardEditorShellWidgetTemplate;
    payload?: unknown;
    idMap?: Record<string, string>;
    diagnostics: DashboardEditorShellDiagnostic[];
};
export type DashboardEditorShellPreparedMutation = {
    id: string;
    kind: "widget" | "reference";
    sourceIds?: string[];
    newIds?: string[];
    idMap?: Record<string, string>;
    metadata?: Record<string, unknown>;
    opaque?: unknown;
    diagnostics?: DashboardEditorShellDiagnostic[];
};
export type DashboardEditorShellAdapterResult = {
    ok: boolean;
    status?: DashboardEditorShellActionStatus;
    reason?: DashboardEditorShellBlockedReason;
    sourceIds?: string[];
    newIds?: string[];
    idMap?: Record<string, string>;
    metadata?: Record<string, unknown>;
    diagnostics?: DashboardEditorShellDiagnostic[];
    error?: {
        code?: string;
        message: string;
        cause?: unknown;
    };
};
export type DashboardEditorShellAdapterStageResult = {
    stage: DashboardEditorShellTransactionStage;
    ok: boolean;
    status?: DashboardEditorShellActionStatus;
    reason?: DashboardEditorShellBlockedReason;
    preparedId?: string;
    sourceIds?: string[];
    newIds?: string[];
    idMap?: Record<string, string>;
    metadata?: Record<string, unknown>;
    diagnostics?: DashboardEditorShellDiagnostic[];
    error?: {
        code?: string;
        message: string;
    };
};
export type DashboardEditorShellCommitContext = DashboardEditorShellAdapterContext & {
    commandResult?: GridEditorCommandResult;
    writeResult?: DashboardWriteResult;
    proposedDocument?: DashboardLayoutDocument;
};
export type DashboardEditorShellRollbackContext = DashboardEditorShellCommitContext & {
    error?: unknown;
    stage: DashboardEditorShellTransactionStage;
};
export type DashboardEditorShellWidgetAdapter = {
    canCopyWidget?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellAvailability>;
    copyWidget?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellAdapterResult>;
    preparePasteWidget?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult>;
    prepareDuplicateWidget?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult>;
    prepareRemoveWidget?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult>;
    prepareAddWidget?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult>;
    commit?: (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellCommitContext) => MaybePromise<DashboardEditorShellAdapterResult>;
    rollback?: (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellRollbackContext) => MaybePromise<DashboardEditorShellAdapterResult | void>;
};
export type DashboardEditorShellReferenceAdapter = {
    canCopyReference?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellAvailability>;
    copyReference?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellAdapterResult>;
    canPasteReference?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellAvailability>;
    preparePasteReference?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult>;
    canReplaceReference?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellAvailability>;
    prepareReplaceReferenceWithWidgetCopy?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult>;
    commit?: (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellCommitContext) => MaybePromise<DashboardEditorShellAdapterResult>;
    rollback?: (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellRollbackContext) => MaybePromise<DashboardEditorShellAdapterResult | void>;
};
export type DashboardEditorShellPaletteAdapter = {
    open?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellWidgetTemplate | DashboardEditorShellWidgetTemplate[] | DashboardEditorShellAdapterResult | void>;
};
export type DashboardEditorShellWidgetTemplate = Partial<LayoutItem> & {
    id?: string;
    label?: string;
    metadata?: Record<string, unknown>;
    payload?: unknown;
};
export type DashboardEditorShellDropPayload = {
    template?: DashboardEditorShellWidgetTemplate;
    payload?: unknown;
    preview?: boolean;
    metadata?: Record<string, unknown>;
};
export type DashboardEditorShellConfirm = (ctx: DashboardEditorShellAdapterContext) => MaybePromise<boolean | DashboardEditorShellAvailability | DashboardEditorShellAdapterResult>;
export type DashboardEditorShellGuard = (ctx: DashboardEditorShellAdapterContext) => MaybePromise<boolean | DashboardEditorShellAvailability | DashboardEditorShellAdapterResult | void>;
export type DashboardEditorShellMessage = {
    code: string;
    level: "info" | "warning" | "error";
    message: string;
    itemIds?: string[];
    recoverable?: boolean;
};
export type DashboardEditorShellScrollAdapter = (ctx: DashboardEditorShellScrollContext) => MaybePromise<DashboardEditorShellAvailability | void>;
export type DashboardEditorShellScrollContext = {
    itemId: string;
    itemElement: HTMLElement | null;
    gridElement: HTMLElement | null;
    options: DashboardEditorShellScrollOptions;
    runtime: DashboardResponsiveRuntime | null;
};
export type DashboardEditorShellKeyboardPlacementOptions = DashboardEditorShellPlacementOptions | (() => DashboardEditorShellPlacementOptions);
export type DashboardEditorShellKeyboardShortcut = {
    key: string;
    action: DashboardEditorShellActionType;
    primary?: boolean;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    source?: DashboardEditorShellActionSource;
    placementOptions?: DashboardEditorShellKeyboardPlacementOptions;
    args?: unknown;
};
export type DashboardEditorShellKeyboardOptions = {
    enabled?: boolean;
    target?: Window | Document | HTMLElement | string | null;
    platform?: "auto" | "mac" | "standard";
    ignoredTargets?: Array<string | ((target: unknown) => boolean)>;
    shortcuts?: DashboardEditorShellKeyboardShortcut[];
    placementOptions?: DashboardEditorShellKeyboardPlacementOptions;
    moveAllStep?: {
        dx: number;
        dy: number;
    };
};
export type DashboardEditorShellEmptyAddState = {
    enabled: boolean;
    reason?: string;
    target: {
        layoutId: string | null;
        requestedBreakpoint: string | null;
        resolvedProfileId: string | null;
        targetView: DashboardTargetView | null;
        viewFormat: "grid" | "list" | null;
    };
    descriptors: DashboardEditorShellMenuDescriptor[];
};
export type DashboardEditorShellDocumentChangeEvent = {
    type: "documentChange";
    actionId: string;
    document: DashboardLayoutDocument;
    runtime: DashboardResponsiveRuntime | null;
    controlled: boolean;
    persist: false;
};
export type DashboardEditorShellEvent = {
    type: "action-start";
    actionId: string;
    actionType: DashboardEditorShellActionType;
    source: DashboardEditorShellActionSource;
    itemIds: string[];
    profile: DashboardEditorShellProfileContext;
    position?: DashboardEditorShellResolvedPosition;
    diagnostics: DashboardEditorShellDiagnostic[];
} | {
    type: "action-result";
    actionId: string;
    actionType: DashboardEditorShellActionType;
    source: DashboardEditorShellActionSource;
    status: DashboardEditorShellActionStatus;
    ok: boolean;
    itemIds: string[];
    affectedIds: string[];
    profile: DashboardEditorShellProfileContext;
    position?: DashboardEditorShellResolvedPosition;
    commandResult?: GridEditorCommandResult;
    writeResult?: DashboardWriteResult;
    adapter?: DashboardEditorShellAdapterStageResult;
    placement?: DashboardEditorShellPlacementSummary;
    proposedDocument?: DashboardLayoutDocument;
    patches?: LayoutPatch[];
    data?: unknown;
    diagnostics: DashboardEditorShellDiagnostic[];
} | {
    type: "documentChange";
    event: DashboardEditorShellDocumentChangeEvent;
} | {
    type: "highlight-change";
    actionId: string;
    itemId: string | null;
    previous: string | null;
    profile: DashboardEditorShellProfileContext;
} | {
    type: "menu-change";
    actionId: string;
    menu: DashboardEditorShellPreparedMenu | null;
    reason?: string;
    profile: DashboardEditorShellProfileContext;
} | {
    type: "cleanup";
    actionId: string;
    diagnostics: DashboardEditorShellDiagnostic[];
};
export type DashboardEditorShellProfileContext = {
    layoutId: string | null;
    requestedBreakpoint: string | null;
    resolvedProfileId: string | null;
    targetView: DashboardTargetView | null;
    viewFormat: "grid" | "list" | null;
};
export type DashboardEditorShellActionResult<T = unknown> = {
    ok: boolean;
    status: DashboardEditorShellActionStatus;
    actionId: string;
    actionType: DashboardEditorShellActionType;
    source: DashboardEditorShellActionSource;
    itemIds: string[];
    affectedIds: string[];
    position?: DashboardEditorShellResolvedPosition;
    commandResult?: GridEditorCommandResult;
    writeResult?: DashboardWriteResult;
    adapter?: DashboardEditorShellAdapterStageResult;
    placement?: DashboardEditorShellPlacementSummary;
    proposedDocument?: DashboardLayoutDocument;
    idMap?: Record<string, string>;
    patches?: LayoutPatch[];
    diagnostics: DashboardEditorShellDiagnostic[];
    data?: T;
};
export type DashboardEditorShellTransactionStage = "prepare" | "mutate" | "commit" | "rollback" | "complete";
export type DashboardEditorShellTransactionInput<T = unknown> = {
    actionId: string;
    actionType: DashboardEditorShellActionType;
    source: DashboardEditorShellActionSource;
    itemIds?: string[];
    position?: DashboardEditorShellResolvedPosition;
    context: DashboardEditorShellAdapterContext;
    prepare?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult | null | undefined>;
    mutate: (prepared: DashboardEditorShellPreparedMutation | null, ctx: DashboardEditorShellAdapterContext) => MaybePromise<{
        status?: DashboardEditorShellActionStatus;
        commandResult?: GridEditorCommandResult;
        writeResult?: DashboardWriteResult;
        proposedDocument?: DashboardLayoutDocument;
        affectedIds?: string[];
        patches?: LayoutPatch[];
        placement?: DashboardEditorShellPlacementSummary;
        data?: T;
        diagnostics?: DashboardEditorShellDiagnostic[];
    }>;
    commit?: (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellCommitContext) => MaybePromise<DashboardEditorShellAdapterResult | void>;
    rollback?: (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellRollbackContext) => MaybePromise<DashboardEditorShellAdapterResult | void>;
    emit?: (event: DashboardEditorShellEvent) => void;
    profile: DashboardEditorShellProfileContext;
};
export type DashboardEditorShellPlacementStrategy = "cursor" | "nearest-fit" | "first-fit" | "insert-top-shift" | "offset";
export type DashboardEditorShellPlacementIntent = "auto" | "here" | "selection" | "viewport";
export type DashboardEditorShellPlacementSummary = Omit<GridEditorPlacementSummary, "strategy" | "diagnostics"> & {
    strategy: DashboardEditorShellPlacementStrategy;
    diagnostics: DashboardEditorShellDiagnostic[];
};
export type DashboardEditorShellPlacementOptions = DashboardEditorShellActionOptions & {
    strategy?: DashboardEditorShellPlacementStrategy;
    collisionPolicy?: GridEditorPlacementCollisionPolicy;
    placementIntent?: DashboardEditorShellPlacementIntent;
    placementMode?: "immediate" | "interactive";
    compactType?: CompactType;
    allowOverlap?: boolean;
    preventCollision?: boolean;
    itemSize?: Pick<LayoutItem, "w" | "h">;
};
export type DashboardEditorShellPasteOptions = DashboardEditorShellPlacementOptions;
export type DashboardEditorShellActionOptions = {
    source?: DashboardEditorShellActionSource;
    diagnostics?: DashboardEditorShellDiagnostic[];
};
export type DashboardEditorShellCommitPlacementOptions = DashboardEditorShellActionOptions & Omit<GridEditorCommitPlacementInput, "source">;
export type DashboardEditorShellHighlightOptions = DashboardEditorShellActionOptions & {
    durationMs?: number;
    scroll?: boolean;
};
export type DashboardEditorShellScrollOptions = DashboardEditorShellActionOptions & {
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
    retry?: boolean;
    selector?: string | ((itemId: string) => string);
    revealIfHidden?: boolean;
};
export type DashboardEditorShellRemoveOptions = DashboardEditorShellActionOptions & {
    skipConfirm?: boolean;
};
export type DashboardEditorShellPaletteOptions = DashboardEditorShellPlacementOptions & {
    autoAddReturnedTemplate?: boolean;
};
export type DashboardEditorShellAddWidgetOptions = DashboardEditorShellPlacementOptions;
export type DashboardEditorShellMoveAllOptions = DashboardEditorShellActionOptions & {
    repair?: LayoutRepairPolicy;
    clampNegative?: boolean;
    commandPolicy?: "all-or-nothing" | "skip-blocked";
};
export type DashboardEditorShellPositionOptions = {
    fallback?: DashboardEditorShellPositionInput;
};
export type DashboardEditorShellState = {
    ready: boolean;
    degraded: boolean;
    runtime: DashboardResponsiveRuntime | null;
    layoutId: string | null;
    requestedBreakpoint: string | null;
    resolvedProfileId: string | null;
    targetView: DashboardTargetView | null;
    viewFormat: "grid" | "list" | null;
    gridSettings: DashboardResponsiveRuntime["gridSettings"] | null;
    heightRuntime: DashboardResponsiveRuntime["heightRuntime"] | null;
    activeItemIds: string[];
    renderItemIds: string[];
    hiddenItemIds: string[];
    mode: GridEditorMode | DashboardResponsiveMode | null;
    selection: GridEditorSelectionState | null;
    dirty: boolean;
    conflict: GridEditorConflict | null;
    lastResult: GridEditorCommandResult | null;
    toolbar: GridEditorToolbarState | null;
    lastPointerPosition: DashboardEditorShellResolvedPosition | null;
    lastMenuPosition: DashboardEditorShellResolvedPosition | null;
    menu: DashboardEditorShellPreparedMenu | null;
    highlightedId: string | null;
    emptyAdd: DashboardEditorShellEmptyAddState;
    diagnostics: DashboardEditorShellDiagnostic[];
};
export type DashboardEditorShellActions = {
    getEventGridPosition(event?: Event | null, options?: DashboardEditorShellPositionRequest): DashboardEditorShellPositionResult;
    pasteAtEvent(event?: Event | null, options?: DashboardEditorShellPasteOptions): Promise<DashboardEditorShellActionResult>;
    pasteAtGridPosition(position: DashboardEditorShellPositionInput, options?: DashboardEditorShellPasteOptions): Promise<DashboardEditorShellActionResult>;
    selectItem(id: string, options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    highlightItem(id: string, options?: DashboardEditorShellHighlightOptions): DashboardEditorShellActionResult;
    resetHighlight(): DashboardEditorShellActionResult;
    scrollToItem(id: string, options?: DashboardEditorShellScrollOptions): Promise<DashboardEditorShellActionResult>;
    prepareDashboardContextMenu(event?: Event | null, options?: DashboardEditorShellMenuRequest): DashboardEditorShellPreparedMenu;
    prepareWidgetContextMenu(event: Event | null, itemId: string, options?: DashboardEditorShellMenuRequest): DashboardEditorShellPreparedMenu;
    closeMenu(reason?: string): void;
    copyWidget(itemIds?: string | string[], options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    cutWidget(itemIds?: string | string[], options?: DashboardEditorShellRemoveOptions): Promise<DashboardEditorShellActionResult>;
    placeClipboard(target?: Event | DashboardEditorShellPositionInput | null, options?: DashboardEditorShellPasteOptions): Promise<DashboardEditorShellActionResult>;
    commitPlacement(options?: DashboardEditorShellCommitPlacementOptions): Promise<DashboardEditorShellActionResult>;
    pasteWidget(target?: Event | DashboardEditorShellPositionInput | null, options?: DashboardEditorShellPasteOptions): Promise<DashboardEditorShellActionResult>;
    duplicateWidget(itemIds?: string | string[], options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    removeWidget(itemIds?: string | string[], options?: DashboardEditorShellRemoveOptions): Promise<DashboardEditorShellActionResult>;
    copyWidgetReference(itemId: string, options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    pasteWidgetReference(target?: Event | DashboardEditorShellPositionInput | null, options?: DashboardEditorShellPasteOptions): Promise<DashboardEditorShellActionResult>;
    replaceReferenceWithWidgetCopy(itemId: string, options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    openWidgetPalette(target?: Event | DashboardEditorShellPositionInput | null, options?: DashboardEditorShellPaletteOptions): Promise<DashboardEditorShellActionResult>;
    addWidgetFromTemplate(template: DashboardEditorShellWidgetTemplate, target?: Event | DashboardEditorShellPositionInput | null, options?: DashboardEditorShellAddWidgetOptions): Promise<DashboardEditorShellActionResult>;
    handleExternalDrop(payload: DashboardEditorShellDropPayload, event: DragEvent | PointerEvent, options?: DashboardEditorShellPlacementOptions): Promise<DashboardEditorShellActionResult>;
    moveAllWidgets(dx: number, dy: number, options?: DashboardEditorShellMoveAllOptions): Promise<DashboardEditorShellActionResult>;
    undo(options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    redo(options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    bindKeyboard(target?: HTMLElement | Window | Document): () => void;
    stop(): void;
};
export type DashboardEditorShellOptions = {
    document?: MaybeRef<DashboardLayoutDocument | null | undefined>;
    model?: DashboardResponsiveProfileModel | null;
    runtime?: MaybeRef<DashboardResponsiveRuntime | null | undefined>;
    editor?: GridEditorController | null;
    gridElement?: MaybeRef<HTMLElement | null | undefined>;
    mode?: MaybeRef<DashboardResponsiveMode | GridEditorMode | undefined>;
    sourceId?: string;
    controlled?: boolean;
    position?: DashboardEditorShellPositionOptions;
    keyboard?: false | DashboardEditorShellKeyboardOptions;
    menu?: DashboardEditorShellMenuOptions;
    widgetAdapter?: DashboardEditorShellWidgetAdapter;
    referenceAdapter?: DashboardEditorShellReferenceAdapter;
    palette?: DashboardEditorShellPaletteAdapter;
    confirm?: DashboardEditorShellConfirm;
    guards?: DashboardEditorShellGuard[];
    scrollAdapter?: DashboardEditorShellScrollAdapter;
    idGenerator?: (baseId: string, existingIds: Set<string>) => string;
    documentWriteBack?: DashboardDocumentWriteBackOwner;
    legacyHistoryStore?: GridHistoryStore;
    createMissingProfileOnEdit?: boolean;
    onEvent?: (event: DashboardEditorShellEvent) => void;
    onDocumentChange?: (event: DashboardEditorShellDocumentChangeEvent) => void;
    onMessage?: (message: DashboardEditorShellMessage) => void;
};
export type DashboardEditorShell = {
    state: Readonly<Ref<DashboardEditorShellState>>;
    actions: DashboardEditorShellActions;
    stop: () => void;
};
export type DashboardEditorShellActionRuntime = {
    actionId: string;
    actionType: DashboardEditorShellActionType;
    source: DashboardEditorShellActionSource;
    profile: DashboardEditorShellProfileContext;
    runtime: DashboardResponsiveRuntime | null;
};
export type DashboardEditorShellCommandMutationResult = {
    commandResult: GridEditorCommandResult;
    writeResult?: DashboardWriteResult;
    proposedDocument?: DashboardLayoutDocument;
    layout: Layout;
    command: GridEditorCommand;
};
