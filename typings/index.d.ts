declare module "@marsio/vue-grid-layout" {
  import type { ComputedRef, CSSProperties, DefineComponent, Ref, VNode } from "vue";
  import type { Pinia, Store } from "pinia";

  export type ResizeHandleAxis =
    | "s"
    | "w"
    | "e"
    | "n"
    | "sw"
    | "nw"
    | "se"
    | "ne";

  export type CompactType = "horizontal" | "vertical" | null;

  export type LayoutItem = {
    w: number;
    h: number;
    x: number;
    y: number;
    i: string;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    moved?: boolean;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
    resizeHandles?: Array<ResizeHandleAxis>;
    isBounded?: boolean;
  };

  export type Layout = LayoutItem[];

  export type LayoutEngineMode = "default" | "legacy";
  export type LayoutOperationPhase = "preview" | "commit";
  export type LayoutOperation =
    | { type: "move"; id: string; x: number; y: number; userAction?: boolean }
    | { type: "groupMove"; ids: string[]; dx: number; dy: number; activeId?: string; userAction?: boolean }
    | { type: "resize"; id: string; w: number; h: number; x?: number; y?: number; handle: ResizeHandleAxis }
    | { type: "dropFit"; item: Pick<LayoutItem, "w" | "h"> & Partial<Pick<LayoutItem, "i">>; strategy: "cursor" | "auto"; target?: { x: number; y: number } }
    | { type: "compact" }
    | { type: "validate" }
    | { type: "generateResponsiveLayout"; breakpoint: string; sourceBreakpoint?: string; cols: number; layouts?: Record<string, Layout>; breakpoints?: Record<string, number> };
  export type LayoutOperationStatus = "changed" | "noop" | "blocked" | "cancelled" | "stale" | "fallback" | "error";
  export type LayoutPatch =
    | { type: "move"; id: string; from: { x: number; y: number }; to: { x: number; y: number } }
    | { type: "resize"; id: string; from: { w: number; h: number; x: number; y: number }; to: { w: number; h: number; x: number; y: number } }
    | { type: "add"; item: LayoutItem }
    | { type: "remove"; id: string }
    | { type: "compact"; affectedIds: string[] };
  export type LayoutBlockedReason = "collision" | "static-item" | "bounds" | "maxRows" | "missing-item" | "invalid-input" | "unsupported";
  export type InteractionSchedulerMode = "eager" | "raf" | "commitOnly" | "auto";
  export type LayoutExecutorKind = "main-thread" | "worker" | "custom";
  export type LayoutDiagnostics = {
    operationId: string;
    operationType: LayoutOperation["type"];
    phase: LayoutOperationPhase;
    layoutSize: number;
    affectedCount: number;
    collisionCount: number;
    indexHit: boolean;
    schedulerMode?: InteractionSchedulerMode;
    executorKind?: LayoutExecutorKind;
    durationMs: number;
    queueMs?: number;
    computeMs?: number;
    stale?: boolean;
    debug?: LayoutDebugSummary;
  };
  export type LayoutDebugSummary = {
    cols: number;
    maxRows?: number;
    compactType: CompactType;
    allowOverlap?: boolean;
    preventCollision?: boolean;
    operation: LayoutOperation;
    result: {
      status: LayoutOperationStatus;
      affectedIds: string[];
      collisionIds: string[];
      blockedReason?: LayoutBlockedReason;
    };
  };
  export type LayoutOperationResult = {
    id: string;
    status: LayoutOperationStatus;
    layout: Layout;
    patches: LayoutPatch[];
    affectedIds: string[];
    collisions: LayoutItem[];
    blocked?: { reason: LayoutBlockedReason; itemIds: string[] };
    placeholder?: LayoutItem;
    diagnostics?: LayoutDiagnostics;
    drop?: {
      position: { x: number; y: number } | null;
      strategy: "cursor" | "auto";
      fallback?: "first-fit" | "nearest-fit" | "none";
      reason?: "collision" | "bounds" | "maxRows" | "invalid-input" | "no-fit";
    };
    error?: { message: string; cause?: unknown };
  };
  export type LayoutIndexOptions = {
    cols: number;
    maxRows?: number;
    compactType?: CompactType;
    allowOverlap?: boolean;
    preventCollision?: boolean;
  };
  export type LayoutIndex = {
    readonly name: string;
    queryFirstCollision(item: LayoutItem): LayoutItem | undefined;
    queryAllCollisions(item: LayoutItem): LayoutItem[];
    canPlace(item: LayoutItem): boolean;
    findFirstFit(item: Pick<LayoutItem, "w" | "h">): { x: number; y: number } | null;
    findNearestFit(item: Pick<LayoutItem, "w" | "h">, target: { x: number; y: number }): { x: number; y: number } | null;
    insert(item: LayoutItem): void;
    remove(id: string): void;
    update(before: LayoutItem, after: LayoutItem): void;
    rebuild(layout: Layout): void;
    getLayout(): Layout;
  };
  export type LayoutIndexStrategy = {
    name: string;
    build(layout: Layout, options: LayoutIndexOptions): LayoutIndex;
  };
  export type InteractionSchedulerOptions = {
    mode?: InteractionSchedulerMode;
    maxPreviewItems?: number;
    commitOnStop?: boolean;
    maxTaskMs?: number;
    stalePolicy?: "drop" | "latest-wins";
    auto?: {
      eagerMaxItems?: number;
      rafMaxItems?: number;
      workerMinItems?: number;
      densityThreshold?: number;
    };
  };
  export type LayoutAbortSignal = {
    readonly aborted: boolean;
    addEventListener?: (type: "abort", listener: () => void, options?: { once?: boolean }) => void;
    removeEventListener?: (type: "abort", listener: () => void) => void;
  };
  export type LayoutExecutor = {
    kind: LayoutExecutorKind;
    available: () => boolean;
    execute: (request: LayoutOperationRequest, signal?: LayoutAbortSignal) => Promise<LayoutOperationResult>;
    dispose?: () => void;
  };
  export type LayoutWorkerLike = {
    postMessage: (message: unknown) => void;
    terminate: () => void;
    onmessage: ((event: { data: unknown }) => void) | null;
    onerror: ((event: unknown) => void) | null;
  };
  export type LayoutExecutorOptions =
    | { kind?: "main-thread" }
    | { kind: "worker"; workerUrl?: string; workerFactory?: () => LayoutWorkerLike; timeoutMs?: number }
    | { kind: "custom"; executor: LayoutExecutor };
  export type LayoutDiagnosticsOptions = {
    debug?: boolean;
    includeOperation?: boolean;
    budgetMs?: number;
  };
  export type GridLayoutEngineOptions = {
    cols: number;
    maxRows?: number;
    compactType: CompactType;
    allowOverlap?: boolean;
    preventCollision?: boolean;
    indexStrategy?: LayoutIndexStrategy;
    scheduler?: InteractionSchedulerOptions;
    executor?: LayoutExecutor;
    compareLegacy?: boolean;
    legacyFallback?: boolean;
    diagnostics?: boolean | LayoutDiagnosticsOptions;
    onEvent?: (event: LayoutEngineEvent) => void;
  };
  export type GridLayoutEngineProp = {
    mode?: LayoutEngineMode;
    scheduler?: InteractionSchedulerOptions;
    executor?: LayoutExecutor | LayoutExecutorOptions;
    compareLegacy?: boolean;
    legacyFallback?: boolean;
    diagnostics?: boolean | LayoutDiagnosticsOptions;
    onEvent?: (event: LayoutEngineEvent) => void;
  };
  export type LayoutOperationRequest = {
    id: string;
    phase: LayoutOperationPhase;
    layout: Layout;
    operation: LayoutOperation;
    options: GridLayoutEngineOptions;
    baseRevision?: string;
    deadlineMs?: number;
    heavy?: boolean;
    debug?: boolean;
  };
  export type LayoutEngineEvent =
    | { type: "operation"; id: string; operationType: LayoutOperation["type"]; phase: LayoutOperationPhase; diagnostics: LayoutDiagnostics }
    | { type: "blocked"; id: string; reason: LayoutBlockedReason; itemIds: string[]; diagnostics?: LayoutDiagnostics }
    | { type: "fallback" | "worker-error" | "stale-result" | "timeout" | "budget-warning" | "interaction-cancelled" | "legacy-mismatch" | "scheduler"; id: string; message?: string; diagnostics?: LayoutDiagnostics; details?: unknown };
  export type GridLayoutEngine = {
    getLayout: () => Layout;
    getRevision: () => string;
    setLayout: (layout: Layout) => void;
    execute: (request: Omit<LayoutOperationRequest, "layout" | "options">) => LayoutOperationResult;
    executeRequest: (request: LayoutOperationRequest) => LayoutOperationResult;
    compareLegacy?: (request: LayoutOperationRequest) => LayoutOperationResult | null;
  };
  export type InteractionControllerState = {
    committed: Layout;
    preview: LayoutOperationResult | null;
    interaction: {
      id: string;
      type: "drag" | "resize" | "drop";
      itemId: string;
      startRevision: string;
      tickRevision: number;
    } | null;
    externalRevision: number;
  };
  export type ScheduledLayoutTask = {
    id: string;
    request: LayoutOperationRequest;
    cancel: () => void;
  };
  export type InteractionType = "drag" | "resize" | "drop";
  export type InteractionController = {
    getState: () => InteractionControllerState;
    getCommitted: () => Layout;
    setCommitted: (layout: Layout, reason?: string) => void;
    start: (interaction: { id: string; type: InteractionType; itemId: string }) => InteractionControllerState;
    preparePreview: (request: Omit<LayoutOperationRequest, "layout" | "options" | "phase">) => LayoutOperationRequest;
    prepareCommit: (request: Omit<LayoutOperationRequest, "layout" | "options" | "phase">) => LayoutOperationRequest;
    preview: (request: Omit<LayoutOperationRequest, "layout" | "options" | "phase">) => LayoutOperationResult;
    commit: (request: Omit<LayoutOperationRequest, "layout" | "options" | "phase">) => LayoutOperationResult;
    applyAsyncResult: (result: LayoutOperationResult) => LayoutOperationResult;
    rebase: (layout: Layout) => LayoutOperationResult | null;
    cancel: (reason?: string) => Layout;
    dispose: () => void;
  };
  export type InteractionScheduler = {
    getMode: (request: LayoutOperationRequest) => InteractionSchedulerMode;
    schedule: (
      request: LayoutOperationRequest,
      runner: (request: LayoutOperationRequest) => Promise<LayoutOperationResult> | LayoutOperationResult,
      onResult: (result: LayoutOperationResult) => void
    ) => ScheduledLayoutTask;
    cancel: (reason?: string) => void;
    recordDuration: (durationMs: number) => void;
  };
  export type BenchmarkScenario =
    | "dense"
    | "sparse"
    | "static-mixed"
    | "preventCollision"
    | "allowOverlap"
    | "drag-across-rows"
    | "north-west-resize"
    | "external-drop-fit"
    | "compact-commit";
  export type BenchmarkResult = {
    scenario: BenchmarkScenario;
    itemCount: number;
    operationCount: number;
    meanMs: number;
    p95Ms: number;
    maxMs: number;
    schedulerMode?: InteractionSchedulerMode;
    executorKind?: LayoutExecutorKind;
    workerComputeMs?: number;
    queueMs?: number;
    endToEndMs?: number;
    budgetStatus?: "pass" | "fail" | "record-only";
  };

  export const LAYOUT_SCHEMA_VERSION: 1;

  export type LayoutPersistenceKind = "layout" | "responsive";
  export type LayoutsMap = Record<string, Layout>;
  export type LayoutPersistenceMeta = Record<string, unknown>;
  export type MaybePromise<T> = T | Promise<T>;
  export type LayoutValidationMode = "strict" | "sanitize";
  export type LayoutConflictStrategy = "manual" | "newer-wins" | "keep-local";
  export type LayoutPersistenceStatus =
    | "idle"
    | "loading"
    | "ready"
    | "saving"
    | "error"
    | "unavailable"
    | "conflict";

  export type LayoutPersistenceDocument =
    | {
        layoutSchemaVersion: number;
        kind: "layout";
        key: string;
        revision: string;
        sourceId: string;
        savedAt: string;
        data: { layout: Layout };
        meta?: LayoutPersistenceMeta;
      }
    | {
        layoutSchemaVersion: number;
        kind: "responsive";
        key: string;
        revision: string;
        sourceId: string;
        savedAt: string;
        data: { layouts: LayoutsMap };
        meta?: LayoutPersistenceMeta;
      };

  export type LayoutMigration = (
    document: unknown,
    context: { fromVersion: number; toVersion: number }
  ) => unknown;
  export type LayoutMigrationMap = Record<number, LayoutMigration>;
  export type LayoutMigrationEvent = { fromVersion: number; toVersion: number };

  export type LayoutPersistenceErrorCode =
    | "invalid-json"
    | "invalid-document"
    | "kind-mismatch"
    | "validation"
    | "migration-missing"
    | "migration-failed"
    | "adapter-unavailable"
    | "adapter-load-failed"
    | "adapter-save-failed"
    | "adapter-remove-failed"
    | "adapter-subscribe-failed"
    | "adapter-timeout";

  export type LayoutPersistenceError = {
    code: LayoutPersistenceErrorCode;
    message: string;
    key?: string;
    kind?: LayoutPersistenceKind;
    path?: string;
    recoverable?: boolean;
    details?: unknown;
    cause?: unknown;
    originalPayload?: unknown;
  };

  export type LayoutPersistenceWarning = {
    code: string;
    message: string;
    path?: string;
    details?: unknown;
  };

  export type SerializeLayoutOptions = {
    key: string;
    kind: LayoutPersistenceKind;
    sourceId?: string;
    meta?: LayoutPersistenceMeta;
    now?: () => Date;
    revision?: () => string;
  };

  export type DeserializeLayoutOptions<T = Layout | LayoutsMap> = {
    expectedKind?: LayoutPersistenceKind;
    currentVersion?: number;
    migrations?: LayoutMigrationMap;
    validation?: LayoutValidationMode;
    fallback?: T;
  };

  export type LayoutDeserializeResult<T = Layout | LayoutsMap> =
    | {
        ok: true;
        document: LayoutPersistenceDocument;
        value: T;
        migrations: LayoutMigrationEvent[];
        warnings: LayoutPersistenceWarning[];
      }
    | {
        ok: false;
        error: LayoutPersistenceError;
        fallback?: T;
        originalPayload: unknown;
        migrations: LayoutMigrationEvent[];
        warnings: LayoutPersistenceWarning[];
      };

  export type LayoutPersistenceExternalChange = {
    key: string;
    source: "storage" | "adapter";
    raw?: unknown;
    oldRaw?: unknown;
    document?: unknown;
    sourceId?: string;
  };

  export type LayoutPersistenceAdapter = {
    load: (key: string) => MaybePromise<unknown>;
    save: (key: string, document: LayoutPersistenceDocument) => MaybePromise<void>;
    remove: (key: string) => MaybePromise<void>;
    subscribe?: (
      key: string,
      callback: (event: LayoutPersistenceExternalChange) => void
    ) => () => void;
  };

  export type WebStorageAdapterOptions = {
    storage?: Storage;
    prefix?: string;
    sourceId?: string;
  };

  export type IndexedDBAdapterOptions = {
    indexedDB?: IDBFactory;
    dbName?: string;
    storeName?: string;
    version?: number;
    prefix?: string;
    timeoutMs?: number;
    broadcast?: boolean;
    broadcastChannel?: typeof BroadcastChannel;
    channelName?: string;
    sourceId?: string;
  };

  export type RemoteHttpAdapterOptions = {
    endpoint: string | ((key: string) => string);
    fetch?: typeof fetch;
    headers?: HeadersInit | (() => HeadersInit);
    credentials?: RequestCredentials;
    timeoutMs?: number;
    loadMethod?: string;
    saveMethod?: string;
    removeMethod?: string;
    parse?: (response: Response) => MaybePromise<unknown>;
    serialize?: (document: LayoutPersistenceDocument) => BodyInit;
  };

  export type LayoutPersistenceCommitContext = {
    source?: "watch" | "component" | "programmatic" | "external";
    reason?: string;
  };

  export type LayoutPersistenceLoadResult<T> = {
    ok: boolean;
    found: boolean;
    value?: T;
    document?: LayoutPersistenceDocument;
    error?: LayoutPersistenceError;
    fallbackApplied?: boolean;
    migrations: LayoutMigrationEvent[];
    warnings: LayoutPersistenceWarning[];
  };

  export type LayoutPersistenceSaveResult = {
    ok: boolean;
    document?: LayoutPersistenceDocument;
    error?: LayoutPersistenceError;
  };

  export type LayoutPersistenceConflict<T> = {
    key: string;
    reason: "dirty-external-change";
    localValue: T;
    externalValue: T;
    localDocument: LayoutPersistenceDocument;
    externalDocument: LayoutPersistenceDocument;
    resolve: (action: "useLocal" | "useRemote") => Promise<void>;
  };

  export type LayoutPersistenceEvent<T = Layout | LayoutsMap> =
    | { type: "load-start"; key: string; kind: LayoutPersistenceKind }
    | { type: "load-empty"; key: string; kind: LayoutPersistenceKind }
    | {
        type: "load-success";
        key: string;
        kind: LayoutPersistenceKind;
        document: LayoutPersistenceDocument;
        value: T;
        migrations: LayoutMigrationEvent[];
        warnings: LayoutPersistenceWarning[];
      }
    | {
        type: "load-error" | "save-error" | "error";
        key: string;
        kind: LayoutPersistenceKind;
        error: LayoutPersistenceError;
        fallback?: T;
      }
    | { type: "save-start"; key: string; kind: LayoutPersistenceKind }
    | {
        type: "save-success";
        key: string;
        kind: LayoutPersistenceKind;
        document: LayoutPersistenceDocument;
      }
    | { type: "discard" | "reset"; key: string; kind: LayoutPersistenceKind; value: T }
    | { type: "remove"; key: string; kind: LayoutPersistenceKind }
    | {
        type: "migration";
        key: string;
        kind: LayoutPersistenceKind;
        migrations: LayoutMigrationEvent[];
      }
    | {
        type: "conflict";
        key: string;
        kind: LayoutPersistenceKind;
        conflict: LayoutPersistenceConflict<T>;
      }
    | {
        type: "external-apply";
        key: string;
        kind: LayoutPersistenceKind;
        document: LayoutPersistenceDocument;
        value: T;
        reason: "clean-external-change" | "newer-wins" | "resolve-remote";
      };

  export type UseGridLayoutPersistenceOptions<T> = {
    key: string;
    kind: LayoutPersistenceKind;
    target: Ref<T>;
    adapter?: LayoutPersistenceAdapter;
    autoSave?: boolean;
    debounceMs?: number;
    validation?: LayoutValidationMode;
    migrations?: LayoutMigrationMap;
    fallback?: T;
    conflictStrategy?: LayoutConflictStrategy;
    meta?: LayoutPersistenceMeta | (() => LayoutPersistenceMeta);
    onEvent?: (event: LayoutPersistenceEvent<T>) => void;
    onError?: (error: LayoutPersistenceError) => void;
    watchTarget?: boolean;
    sourceId?: string;
    timeoutMs?: number;
  };

  export type GridLayoutPersistenceController<T> = {
    status: Ref<LayoutPersistenceStatus>;
    dirty: Ref<boolean>;
    error: Ref<LayoutPersistenceError | null>;
    lastSavedAt: Ref<string | null>;
    conflict: Ref<LayoutPersistenceConflict<T> | null>;
    load: () => Promise<LayoutPersistenceLoadResult<T>>;
    commit: (nextValue?: T, context?: LayoutPersistenceCommitContext) => void;
    save: () => Promise<LayoutPersistenceSaveResult>;
    discard: () => void;
    reset: (nextValue?: T) => void;
    remove: () => Promise<void>;
    resolveConflict: (action: "useLocal" | "useRemote") => Promise<void>;
    stop: () => void;
  };

  export type GridLayoutPersistenceProp =
    | false
    | Omit<UseGridLayoutPersistenceOptions<Layout>, "target" | "kind">;

  export type ResponsiveGridLayoutPersistenceProp =
    | false
    | Omit<UseGridLayoutPersistenceOptions<LayoutsMap>, "target" | "kind">;

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
    | { type: "set"; id: string; previous?: GridEditorItemMeta; next: GridEditorItemMeta }
    | { type: "remove"; id: string; previous?: GridEditorItemMeta };
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
    history?: { mergeKey?: string; mergeWindowMs?: number; skip?: boolean };
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
    | "unsupported"
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
  export type GridEditorMessageLevel = "info" | "warning" | "error";
  export type GridEditorMessage = {
    code: string;
    level: GridEditorMessageLevel;
    message: string;
    itemIds?: string[];
    recoverable?: boolean;
  };
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
    error?: { message: string; cause?: unknown };
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
    export type GridEditorGuide = {
      id: string;
      kind: GridEditorGuideKind;
      axis: GridEditorGuideAxis;
    position: number;
    sourceIds: string[];
      targetId: string;
      distance: number;
      priority: number;
      display?: GridEditorGuideDisplay;
    };
    export type GridEditorGuideInteraction = "drag" | "resize" | "drop" | "keyboard" | "api";
    export type GridEditorGuideState = {
      activeId: string | null;
      interaction?: GridEditorGuideInteraction;
      guides: GridEditorGuide[];
      displayGuides?: GridEditorGuide[];
      debugGuides?: GridEditorGuide[];
      snappedGuideIds: string[];
      spacingLabelGuideIds?: string[];
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
      showSpacingChips?: boolean;
      showMeasurementHud?: boolean;
      startGeometry?: Record<string, Pick<LayoutItem, "x" | "y" | "w" | "h">>;
      selectionCount?: number;
      delta?: { dx?: number; dy?: number; dw?: number; dh?: number };
      blocked?: { reason?: GridEditorBlockedReason; message?: string; itemIds?: string[] };
    };
  export type GridEditorIntelligenceInteraction = GridEditorGuideInteraction | "toolbar";
  export type GridEditorDiagnosticCode = string;
  export type GridEditorIntelligenceDegradedReason = "max-items" | "max-duration" | "collision" | "bounds" | "maxRows" | "locked" | "capability" | "section-row-policy";
  export type GridEditorSectionRowKind = "section" | "row";
  export type GridEditorSectionRow = {
    id: string;
    kind: GridEditorSectionRowKind;
    label?: string;
    parentId?: string;
    order: number;
    bounds?: { x: number; y: number; w: number; h: number };
    boundsPolicy?: "fixed" | "content" | "viewport";
    collapsed?: boolean;
    locked?: boolean;
    itemIds?: string[];
    dropPolicy?: "inside" | "between" | "none";
    crossScopePolicy?: "allow" | "block" | "ask";
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
  export type GridEditorAlignMode = "left" | "center-x" | "right" | "top" | "center-y" | "bottom";
  export type GridEditorAlignTarget =
    | { type: "selection-bounds" }
    | { type: "active-item"; id?: string }
    | { type: "last-selected" }
    | { type: "section-row"; id: string; bounds?: { x: number; y: number; w: number; h: number } }
    | { type: "explicit-line"; axis: GridEditorGuideAxis; position: number };
  export type GridEditorAlignPayload = { mode: GridEditorAlignMode; target?: GridEditorAlignTarget; collisionStrategy?: "block" | "push" | "skip-blocked" };
  export type GridEditorDistributeMode = "horizontal" | "vertical" | "spacing-x" | "spacing-y";
  export type GridEditorDistributeStrategy = "edge-to-edge" | "center-to-center";
  export type GridEditorDistributePayload = {
    mode: GridEditorDistributeMode;
    strategy?: GridEditorDistributeStrategy;
    bounds?: "selection" | "active-item" | "section-row" | "explicit";
    sectionRowId?: string;
    explicitBounds?: { start: number; end: number };
    collisionStrategy?: "block" | "push" | "skip-blocked";
  };
    export type GridEditorTidyPayload = {
      axis?: "x" | "y" | "both";
      scope?: "selection" | "section-row" | "layout";
      sectionRowId?: string;
      minSpacing?: number;
      strategy?: GridEditorDistributeStrategy;
      collisionStrategy?: "block" | "push" | "skip-blocked";
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
      filtered?: Array<{ code: GridEditorDiagnosticCode; itemIds?: string[]; reason?: GridEditorBlockedReason }>;
      codes: GridEditorDiagnosticCode[];
    };
  export type GridEditorCommandComputedDiagnostics = {
    targetLine?: { axis: GridEditorGuideAxis; position: number; mode?: GridEditorAlignMode };
      targetSpacing?: { axis: GridEditorGuideAxis; value: number; mode?: GridEditorDistributeMode; strategy?: GridEditorDistributeStrategy };
      affectedIds?: string[];
      skippedIds?: string[];
      sectionRowContext?: { sectionId?: string; rowId?: string; source?: "metadata" | "inferred" | "none" };
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
    compactType?: CompactType;
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
  export type GridEditorIntelligenceState = {
    itemRects: Record<string, GridEditorItemRect>;
    geometryIndex: GridEditorGeometryIndex;
    neighbors: GridEditorNeighborRelation[];
    spacingRelations: GridEditorSpacingRelation[];
    snapCandidates: GridEditorSnapCandidate[];
    distributionCandidates: GridEditorDistributionCandidate[];
    sectionRows: GridEditorResolvedSectionRowState;
    guideState: GridEditorGuideState;
    measurementHud?: GridEditorMeasurementHud | null;
    diagnostics: GridEditorIntelligenceDiagnostics;
  };
	  export type GridEditorSnapResolution = {
	    status: "none" | "snapped" | "blocked" | "disabled" | "degraded";
	    candidate?: GridEditorSnapCandidate;
	    geometry: Pick<LayoutItem, "x" | "y" | "w" | "h">;
	    guideIds: string[];
	    previousGuideId?: string;
	    nextGuideId?: string;
	    snapKind?: GridEditorSnapCandidateKind;
	    blocked?: { reason: GridEditorBlockedReason; itemIds?: string[]; message?: string };
	    diagnostics: GridEditorIntelligenceDiagnostics;
	  };
  export type GridEditorToolbarState = {
    commands: Partial<Record<GridEditorCommandType, { command: GridEditorCommandType; enabled: boolean; reason?: GridEditorBlockedReason | "selection-count" | "unsupported-scope"; requiredSelectionCount?: number; blockedIds?: string[]; messageKey?: string }>>;
    selectionSummary: { count: number; movableCount: number; lockedCount: number; hiddenCount: number; sectionRowIds: string[] };
    intelligenceSummary?: { equalSpacing?: boolean; distributionMode?: GridEditorDistributeMode; snapCandidateCount: number; degraded?: boolean; reason?: GridEditorIntelligenceDegradedReason };
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
    updatedAt: string;
  };
  export type GridEditorPersistenceBridge = {
    meta: () => LayoutPersistenceMeta;
    onPersistenceEvent: (event: LayoutPersistenceEvent<Layout | LayoutsMap>) => void;
    save: () => Promise<GridEditorCommandResult>;
    discard: () => GridEditorCommandResult;
    reset: () => GridEditorCommandResult;
  };
  export type GridEditorKeyboardOptions = {
    enabled?: boolean;
    target?: HTMLElement | Window | string;
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
  export type GridEditorLayoutOperationRunner = (input: {
    commandId: string;
    layout: Layout;
    operation: LayoutOperation;
    phase: "commit";
    source: GridEditorCommandSource;
  }) => MaybePromise<LayoutOperationResult>;
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
    layoutEngineOptions?: GridLayoutEngineOptions | (() => GridLayoutEngineOptions);
    layoutOperationRunner?: GridEditorLayoutOperationRunner;
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
    | { type: "mode-change"; from: GridEditorMode; to: GridEditorMode; source: string; commandId?: string }
    | { type: "editor-state-change"; state: GridEditorDerivedState; previous?: GridEditorDerivedState; reason: string; commandId?: string }
    | { type: "selection-change"; selection: GridEditorSelectionState; previous: GridEditorSelectionState; requested?: boolean }
    | { type: "command-start"; command: GridEditorCommand }
    | { type: "command-commit"; command: GridEditorCommand; result: GridEditorCommandResult }
    | { type: "command-blocked"; command: GridEditorCommand; result: GridEditorCommandResult }
    | { type: "command-error"; command: GridEditorCommand; result: GridEditorCommandResult }
    | { type: "guide-change"; guides: GridEditorGuide[]; activeId: string | null }
    | { type: "intelligence-change"; activeId: string | null; diagnostics: GridEditorIntelligenceDiagnostics }
    | { type: "snap-change"; activeId: string; previousGuideId?: string; nextGuideId?: string; snapKind?: GridEditorSnapCandidateKind; geometry: Pick<LayoutItem, "x" | "y" | "w" | "h"> }
    | { type: "save-state-change"; status: LayoutPersistenceStatus; dirty: boolean; error?: LayoutPersistenceError | null }
    | { type: "conflict"; conflict: GridEditorConflict }
    | { type: "focus-change"; from: string | null; to: string | null; reason: string }
    | { type: "editor-error"; code: string; message: string; details?: unknown };
  export type GridEditorA11yItemDescription = {
    id: string;
    label: string;
    position: Pick<LayoutItem, "x" | "y" | "w" | "h">;
    locked: boolean;
    selected: boolean;
    commands: GridEditorCommandType[];
  };

  export function useGridEditor(options: UseGridEditorOptions): GridEditorController;
  export function createGridEditorController(options: UseGridEditorOptions): GridEditorController;
  export function createGridEditorHistory(options?: {
    maxSize?: number;
    mergeWindowMs?: number;
  }): GridEditorHistoryController;
  export const internalGridEditorClipboard: GridEditorClipboardAdapter & { clear: () => void };
  export function systemClipboardAdapter(): GridEditorClipboardAdapter;
  export function normalizeEditorMetaById(
    input: unknown,
    options?: { layout?: Layout; removeOrphans?: boolean }
  ): GridEditorMetaById;
  export function validateEditorMetaById(
    input: unknown,
    options?: { layout?: Layout; removeOrphans?: boolean }
  ): {
    ok: boolean;
    value: GridEditorMetaById;
    errors: Array<{ code: string; path: string; message: string }>;
    warnings: Array<{ code: string; path: string; message: string }>;
  };
  export function sanitizeEditorMetaById(
    input: unknown,
    options?: { layout?: Layout; removeOrphans?: boolean }
  ): GridEditorMetaById;
  export function resolveEditorItemCapability(
    item: LayoutItem,
    meta?: GridEditorItemMeta,
    options?: {
      isDraggable?: boolean;
      isResizable?: boolean;
      isBounded?: boolean;
      defaultDeletable?: boolean;
      defaultDuplicatable?: boolean;
      defaultCopyable?: boolean;
    }
  ): GridEditorResolvedCapability;
    export function computeGridEditorGuides(
      layout: Layout,
      activeItem: LayoutItem,
      candidateItem: LayoutItem,
      metaById?: GridEditorMetaById,
      options?: GridEditorGuidesOptions
    ): GridEditorGuideState;
    export function filterGridEditorDisplayGuides(
      guides: GridEditorGuide[],
      options?: GridEditorGuidesOptions,
      snappedGuideIds?: string[]
    ): GridEditorGuide[];
  export function computeGridEditorIntelligence(input: GridEditorIntelligenceInput): GridEditorIntelligenceState;
  export function computeGridEditorDistribution(input: GridEditorIntelligenceInput): GridEditorDistributionCandidate[];
  export function applyGridEditorAlign(
    layout: Layout,
    payload: GridEditorAlignPayload,
    context?: GridEditorGeometryCommandContext
  ): GridEditorGeometryPatchResult;
  export function applyGridEditorDistribute(
    layout: Layout,
    payload: GridEditorDistributePayload,
    context?: GridEditorGeometryCommandContext
  ): GridEditorGeometryPatchResult;
  export function applyGridEditorTidy(
    layout: Layout,
    payload: GridEditorTidyPayload,
    context?: GridEditorGeometryCommandContext
  ): GridEditorGeometryPatchResult;
  export function resolveGridEditorSnap(
    state: GridEditorIntelligenceState,
    candidateItem: LayoutItem,
    options?: { snap?: boolean; layout?: Layout; cols?: number; maxRows?: number; allowOverlap?: boolean; metaById?: GridEditorMetaById; previousGuideId?: string }
  ): GridEditorSnapResolution;
  export function normalizeGridEditorSectionRows(
    input?: GridEditorSectionRowState | null,
    layout?: Layout
  ): GridEditorResolvedSectionRowState;
  export function emptyGridEditorSectionRows(): GridEditorSectionRowState;
  export function deriveGridEditorToolbarState(controller: GridEditorController): GridEditorToolbarState;
    export function bindGridEditorKeyboard(
    controller: GridEditorController,
    options?: GridEditorKeyboardOptions
  ): () => void;
  export function createGridEditorPersistenceEnvelope(
    editorMetaById: GridEditorMetaById,
    sectionRowsOrUpdatedAt?: GridEditorSectionRowState | string,
    updatedAt?: string
  ): GridEditorPersistenceEnvelope;

  export type GridHistorySnapshot = Layout;
  export type GridHistoryState = {
    past: Layout[];
    present: Layout | null;
    future: Layout[];
    maxSize: number;
  };
  export type GridHistoryGetters = {
    canUndo(state: GridHistoryState): boolean;
    canRedo(state: GridHistoryState): boolean;
  };
  export type GridHistoryActions = {
    push: (layout: Layout) => void;
    replacePresent: (layout: Layout | null) => void;
    undo: () => Layout | null;
    redo: () => Layout | null;
    clear: (snapshot?: Layout | null) => void;
  };
  export type GridHistoryStore = Store<string, GridHistoryState, GridHistoryGetters, GridHistoryActions>;
  export type GridHistoryOptions = {
    id?: string;
    pinia?: Pinia;
    maxSize?: number;
    clone?: (layout: Layout) => Layout;
    equals?: (a: Layout | null, b: Layout | null) => boolean;
  };

  export type KeyboardShortcutOptions = {
    /** Target element or selector to listen on. Defaults to window. */
    target?: HTMLElement | Window | string;
    /** Custom undo key combination. Defaults to Ctrl+Z (Win) / Cmd+Z (Mac) */
    undoKeys?: {
      key: string;
      ctrl?: boolean;
      meta?: boolean;
      shift?: boolean;
      alt?: boolean;
    };
    /** Custom redo key combination. Defaults to Ctrl+Y or Ctrl+Shift+Z (Win) / Cmd+Shift+Z (Mac) */
    redoKeys?: {
      key: string;
      ctrl?: boolean;
      meta?: boolean;
      shift?: boolean;
      alt?: boolean;
    }[];
    /** Callback when undo is triggered */
    onUndo?: (layout: Layout | null) => void;
    /** Callback when redo is triggered */
    onRedo?: (layout: Layout | null) => void;
    /** Filter function to determine if shortcuts should be active. Return false to skip. */
    filter?: (event: KeyboardEvent) => boolean;
  };

  export type VueRef<T extends HTMLElement> = Ref<T | null>;

  export type ResizeHandle =
    | VNode
    | ((resizeHandleAxis: ResizeHandleAxis, ref: VueRef<HTMLElement>) => VNode);

  export type AutoScrollOptions = { margin?: number; speed?: number };

  export type ItemCallback = (
    layout: Layout,
    oldItem?: LayoutItem | null,
    newItem?: LayoutItem | null,
    placeholder?: LayoutItem,
    event?: Event,
    element?: HTMLElement
  ) => void;

  export type GridLayoutInteractionEventProps = {
    onDragStart?: ItemCallback;
    onDrag?: ItemCallback;
    onDragStop?: ItemCallback;
    onResizeStart?: ItemCallback;
    onResize?: ItemCallback;
    onResizeStop?: ItemCallback;
    onDrop?: (layout: Layout, e: Event, item?: LayoutItem) => void;
    onDropDragOver?: (e: DragEvent) => { w?: number; h?: number } | false;
  };

  export type VueGridLayoutProps = GridLayoutInteractionEventProps & {
    class?: string;
    style?: CSSProperties;
    width?: number;
    autoSize?: boolean;
    autoScroll?: boolean | AutoScrollOptions;
    cols?: number;
    draggableCancel?: string;
    draggableHandle?: string;
    verticalCompact?: boolean;
    compactType?: CompactType;
    modelValue?: Layout;
    margin?: [number, number];
    containerPadding?: [number, number] | null;
    rowHeight?: number;
    maxRows?: number;
    isBounded?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
    isDroppable?: boolean;
    dropStrategy?: "cursor" | "auto";
    preventCollision?: boolean;
    useCSSTransforms?: boolean;
    transformScale?: number;
    droppingItem?: { i: string; w: number; h: number };
    resizeHandles?: ResizeHandleAxis[];
    resizeHandle?: ResizeHandle;
    allowOverlap?: boolean;
    historyStore?: GridHistoryStore;
    persistence?: GridLayoutPersistenceProp;
    layoutEngine?: false | GridLayoutEngineProp;
    editor?: false | GridEditorProp;
    innerRef?: Ref<HTMLElement | null>;
    onLayoutChange?: (layout: Layout) => void;
  };

  export type WidthProviderProps = {
    measureBeforeMount?: boolean;
    class?: string;
    style?: CSSProperties;
  };

  export type ResponsiveProps = GridLayoutInteractionEventProps & {
    breakpoint?: string | null;
    breakpoints?: Record<string, number>;
    cols?: Record<string, number>;
    layouts?: Record<string, Layout>;
    width?: number;
    margin?: Record<string, [number, number]> | [number, number];
    containerPadding?:
      | Record<string, [number, number] | null>
      | [number, number]
      | null;
    allowOverlap?: boolean;
    verticalCompact?: boolean;
    compactType?: CompactType;
    persistence?: ResponsiveGridLayoutPersistenceProp;
    layoutEngine?: false | GridLayoutEngineProp;
    editor?: false | GridEditorProp;
    onLayoutChange?: (currentLayout: Layout, allLayouts: Record<string, Layout>) => void;
    "onUpdate:layouts"?: (layouts: Record<string, Layout>) => void;
    onBreakpointChange?: (newBreakpoint: string, newCols: number) => void;
    onWidthChange?: (
      containerWidth: number,
      margin: [number, number] | null,
      cols: number,
      containerPadding: [number, number] | null
    ) => void;
  };

  export const VueGridLayout: DefineComponent<VueGridLayoutProps>;
  export default VueGridLayout;

  export function createGridHistoryStore(options?: GridHistoryOptions): GridHistoryStore;
  export function useGridHistoryStore(options?: GridHistoryOptions): GridHistoryStore;
  export function bindKeyboardShortcuts(
    store: GridHistoryStore,
    options?: KeyboardShortcutOptions
  ): () => void;

  export const history: {
    createGridHistoryStore: typeof createGridHistoryStore;
    useGridHistoryStore: typeof useGridHistoryStore;
    bindKeyboardShortcuts: typeof bindKeyboardShortcuts;
  };

  export function createLayoutEngine(
    options: GridLayoutEngineOptions,
    layout?: Layout
  ): GridLayoutEngine;
  export function rowColumnOccupancyStrategy(): LayoutIndexStrategy;
  export function createLayoutExecutor(
    options?: LayoutExecutor | LayoutExecutorOptions
  ): LayoutExecutor;
  export function mainThreadLayoutExecutor(): LayoutExecutor;
  export function workerLayoutExecutor(options?: {
    workerUrl?: string;
    workerFactory?: () => LayoutWorkerLike;
    timeoutMs?: number;
  }): LayoutExecutor;
  export function createInteractionScheduler(
    options?: InteractionSchedulerOptions
  ): InteractionScheduler;
  export function createInteractionController(
    layout: Layout,
    options: GridLayoutEngineOptions
  ): InteractionController;
  export const layoutEngine: {
    createLayoutEngine: typeof createLayoutEngine;
    rowColumnOccupancyStrategy: typeof rowColumnOccupancyStrategy;
    createLayoutExecutor: typeof createLayoutExecutor;
    mainThreadLayoutExecutor: typeof mainThreadLayoutExecutor;
    workerLayoutExecutor: typeof workerLayoutExecutor;
    createInteractionScheduler: typeof createInteractionScheduler;
    createInteractionController: typeof createInteractionController;
  };

  export function serializeLayoutDocument(
    input: Layout | LayoutsMap,
    options: SerializeLayoutOptions
  ): LayoutPersistenceDocument;
  export function deserializeLayoutDocument<T = Layout | LayoutsMap>(
    payload: unknown,
    options?: DeserializeLayoutOptions<T>
  ): LayoutDeserializeResult<T>;
  export function validateLayoutDocument<T = Layout | LayoutsMap>(
    payload: unknown,
    options?: {
      expectedKind?: LayoutPersistenceKind;
      currentVersion?: number;
      validation?: LayoutValidationMode;
    }
  ): { ok: boolean; document?: LayoutPersistenceDocument; value?: T; error?: LayoutPersistenceError; warnings: LayoutPersistenceWarning[] };
  export function migrateLayoutDocument(
    payload: unknown,
    options?: {
      currentVersion?: number;
      migrations?: LayoutMigrationMap;
      expectedKind?: LayoutPersistenceKind;
      validation?: LayoutValidationMode;
    }
  ): {
    ok: boolean;
    document?: LayoutPersistenceDocument;
    error?: LayoutPersistenceError;
    originalPayload: unknown;
    migrations: LayoutMigrationEvent[];
    warnings: LayoutPersistenceWarning[];
  };
  export function localStorageAdapter(options?: WebStorageAdapterOptions): LayoutPersistenceAdapter;
  export function sessionStorageAdapter(options?: WebStorageAdapterOptions): LayoutPersistenceAdapter;
  export function indexedDBAdapter(options?: IndexedDBAdapterOptions): LayoutPersistenceAdapter;
  export function remoteHttpAdapter(options: RemoteHttpAdapterOptions): LayoutPersistenceAdapter;
  export function memoryPersistenceAdapter(seed?: Record<string, unknown>): LayoutPersistenceAdapter;
  export function useGridLayoutPersistence<T extends Layout | LayoutsMap>(
    options: UseGridLayoutPersistenceOptions<T>
  ): GridLayoutPersistenceController<T>;
  export const persistence: {
    LAYOUT_SCHEMA_VERSION: typeof LAYOUT_SCHEMA_VERSION;
    serializeLayoutDocument: typeof serializeLayoutDocument;
    deserializeLayoutDocument: typeof deserializeLayoutDocument;
    validateLayoutDocument: typeof validateLayoutDocument;
    migrateLayoutDocument: typeof migrateLayoutDocument;
    localStorageAdapter: typeof localStorageAdapter;
    sessionStorageAdapter: typeof sessionStorageAdapter;
    indexedDBAdapter: typeof indexedDBAdapter;
    remoteHttpAdapter: typeof remoteHttpAdapter;
    memoryPersistenceAdapter: typeof memoryPersistenceAdapter;
    useGridLayoutPersistence: typeof useGridLayoutPersistence;
  };

  export const editor: {
    useGridEditor: typeof useGridEditor;
    createGridEditorController: typeof createGridEditorController;
    createGridEditorHistory: typeof createGridEditorHistory;
    internalGridEditorClipboard: typeof internalGridEditorClipboard;
    systemClipboardAdapter: typeof systemClipboardAdapter;
    normalizeEditorMetaById: typeof normalizeEditorMetaById;
    validateEditorMetaById: typeof validateEditorMetaById;
    sanitizeEditorMetaById: typeof sanitizeEditorMetaById;
    resolveEditorItemCapability: typeof resolveEditorItemCapability;
    computeGridEditorGuides: typeof computeGridEditorGuides;
    computeGridEditorIntelligence: typeof computeGridEditorIntelligence;
    computeGridEditorDistribution: typeof computeGridEditorDistribution;
    applyGridEditorAlign: typeof applyGridEditorAlign;
    applyGridEditorDistribute: typeof applyGridEditorDistribute;
    applyGridEditorTidy: typeof applyGridEditorTidy;
    resolveGridEditorSnap: typeof resolveGridEditorSnap;
    normalizeGridEditorSectionRows: typeof normalizeGridEditorSectionRows;
    emptyGridEditorSectionRows: typeof emptyGridEditorSectionRows;
    deriveGridEditorToolbarState: typeof deriveGridEditorToolbarState;
    bindGridEditorKeyboard: typeof bindGridEditorKeyboard;
    createGridEditorPersistenceEnvelope: typeof createGridEditorPersistenceEnvelope;
  };

  export const Responsive: DefineComponent<ResponsiveProps>;
  export const ResponsiveVueGridLayout: typeof Responsive;

  export function findFirstFit(
    layout: Layout,
    item: Pick<LayoutItem, "w" | "h">,
    cols: number,
    maxRows?: number
  ): { x: number; y: number } | null;

  export function findNearestFit(
    layout: Layout,
    item: Pick<LayoutItem, "w" | "h">,
    cols: number,
    targetX: number,
    targetY: number,
    maxRows?: number
  ): { x: number; y: number } | null;

  export const utils: {
    findFirstFit: typeof findFirstFit;
    findNearestFit: typeof findNearestFit;
    [key: string]: unknown;
  };
  export const calculateUtils: unknown;

  export function WidthProvider<P = Record<string, unknown>>(
    ComposedComponent: DefineComponent<P>
  ): DefineComponent<P & WidthProviderProps>;
}
