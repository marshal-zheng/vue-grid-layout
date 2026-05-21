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

  export type GridHeightMode = "auto" | "scroll" | "fit" | "fixed";
  export type GridRenderPrecision = "integer" | "subpixel";
  export type GridPointerKind = "mouse" | "pen" | "touch" | "coarse" | "unknown";
  export type GridDragActivationDistance =
    | number
    | {
        mouse?: number;
        pen?: number;
        touch?: number;
        coarse?: number;
        default?: number;
      };
  export type GridHeightSource =
    | "height-mode"
    | "auto-size"
    | "container-height"
    | "measured-parent"
    | "fallback";
  export type GridRowHeightSource =
    | "row-height"
    | "fit"
    | "mobile-row-height"
    | "default"
    | "empty-fit-fallback"
    | "fallback";
  export type GridHeightDiagnosticCode =
    | "missing-container-height"
    | "measurement-unavailable"
    | "fit-min-row-height-fallback"
    | "fixed-container-height-fallback"
    | "scroll-container-height-fallback"
    | "empty-fit-layout"
    | "invalid-height-mode"
    | "invalid-container-height"
    | "invalid-row-height"
    | "invalid-min-row-height"
    | "invalid-render-precision"
    | "mode-alias-conflict"
    | "unsupported-dashboard-field";
  export const GRID_HEIGHT_DIAGNOSTIC_CODES: {
    readonly missingContainerHeight: "missing-container-height";
    readonly measurementUnavailable: "measurement-unavailable";
    readonly fitMinRowHeightFallback: "fit-min-row-height-fallback";
    readonly fixedContainerHeightFallback: "fixed-container-height-fallback";
    readonly scrollContainerHeightFallback: "scroll-container-height-fallback";
    readonly emptyFitLayout: "empty-fit-layout";
    readonly invalidHeightMode: "invalid-height-mode";
    readonly invalidContainerHeight: "invalid-container-height";
    readonly invalidRowHeight: "invalid-row-height";
    readonly invalidMinRowHeight: "invalid-min-row-height";
    readonly invalidRenderPrecision: "invalid-render-precision";
    readonly modeAliasConflict: "mode-alias-conflict";
    readonly unsupportedDashboardField: "unsupported-dashboard-field";
  };
  export type GridHeightDiagnostic = {
    code: GridHeightDiagnosticCode;
    level: "info" | "warning" | "error";
    message: string;
    prop?: string;
    path?: string;
    layoutId?: string;
    profileId?: string;
    targetView?: "desktop" | "mobile";
    itemId?: string;
    details?: unknown;
  };
  export type ResolveGridHeightRuntimeOptions = {
    layout: Layout;
    autoSize?: boolean;
    heightMode?: GridHeightMode | null;
    rowHeight?: number;
    defaultRowHeight?: number;
    minRowHeight?: number;
    margin: [number, number] | number[];
    containerPadding: [number, number] | number[];
    containerHeight?: number | null;
    measuredContainerHeight?: number | null;
    measurementDiagnostics?: GridHeightDiagnostic[];
    autoMeasureContainerHeight?: boolean;
    renderPrecision?: GridRenderPrecision | null;
    context?: {
      layoutId?: string;
      profileId?: string | null;
      targetView?: "desktop" | "mobile";
      source?: "grid" | "dashboard-responsive";
    };
  };
  export type GridHeightRuntime = {
    requestedHeightMode: GridHeightMode;
    effectiveHeightMode: GridHeightMode;
    renderPrecision: GridRenderPrecision;
    rowHeight: number;
    rowHeightSource: GridRowHeightSource;
    containerHeight: number | null;
    containerHeightSource: GridHeightSource;
    contentHeight: number;
    bottomRows: number;
    overflow: "visible" | "hidden" | "auto";
    containerStyle: {
      height: string | null;
      overflow?: "hidden" | "auto";
    };
    fallbackApplied: boolean;
    diagnostics: GridHeightDiagnostic[];
  };

  export type LayoutEngineMode = "default" | "legacy";
  export type LayoutOperationPhase = "preview" | "commit";
  export type LayoutOperation =
    | { type: "move"; id: string; x: number; y: number; userAction?: boolean }
    | { type: "groupMove"; ids: string[]; dx: number; dy: number; activeId?: string; userAction?: boolean }
    | { type: "resize"; id: string; w: number; h: number; x?: number; y?: number; handle: ResizeHandleAxis }
    | { type: "dropFit"; item: Pick<LayoutItem, "w" | "h"> & Partial<Pick<LayoutItem, "i">>; strategy: "cursor" | "auto"; target?: { x: number; y: number } }
    | { type: "compact" }
    | { type: "validate" }
    | { type: "generateResponsiveLayout"; breakpoint: string; sourceBreakpoint?: string; cols: number; layouts?: Record<string, Layout>; breakpoints?: Record<string, number> }
    | { type: "migrateSettings"; previousSettings: LayoutMigrationSettings; nextSettings: LayoutMigrationSettings; policy?: LayoutMigrationPolicy }
    | { type: "repairCollisions"; policy?: LayoutRepairPolicy }
    | { type: "translateLayout"; dx: number; dy: number; clampNegative?: boolean; policy?: LayoutRepairPolicy }
    | { type: "placeItems"; items: LayoutPlacementRequest[]; policy?: LayoutRepairPolicy };
  export type LayoutOperationStatus = "changed" | "noop" | "blocked" | "cancelled" | "stale" | "fallback" | "error";
  export type LayoutPatch =
    | { type: "move"; id: string; from: { x: number; y: number }; to: { x: number; y: number } }
    | { type: "resize"; id: string; from: { w: number; h: number; x: number; y: number }; to: { w: number; h: number; x: number; y: number } }
    | { type: "add"; item: LayoutItem }
    | { type: "remove"; id: string }
    | { type: "compact"; affectedIds: string[] };
  export type LayoutBlockedReason = "collision" | "static-item" | "bounds" | "maxRows" | "missing-item" | "invalid-input" | "unsupported";
  export type LayoutMigrationSettings = {
    cols?: number | null;
    columns?: number | null;
    minColumns?: number | null;
    maxRows?: number | null;
    [key: string]: unknown;
  };
  export type LayoutMigrationAxis = "horizontal" | "xy";
  export type LayoutMigrationRounding = "round";
  export type LayoutRepairStrategy = "none" | "first-fit" | "nearest-fit" | "nearest-then-first" | "heuristic" | "custom";
  export type LayoutRepairObjective = {
    minimizeMovement?: number;
    minimizeResize?: number;
    preserveOrder?: number;
    preserveStatic?: number;
    preserveGroups?: number;
  };
  export type LayoutMigrationPolicy = {
    axis?: LayoutMigrationAxis;
    rounding?: LayoutMigrationRounding;
    sanitizeInvalidItems?: boolean;
    forceRepair?: boolean;
    repair?: LayoutRepairPolicy;
  };
  export type LayoutRepairPolicy = {
    strategy?: LayoutRepairStrategy;
    fallback?: "none" | "first-fit" | "nearest-fit" | "nearest-then-first" | "heuristic";
    objective?: LayoutRepairObjective;
    customRepairSolver?: LayoutRepairSolver;
    customSolverBudgetMs?: number;
    createDiagnostics?: boolean;
  };
  export type LayoutPlacementRequest = {
    item: Pick<LayoutItem, "i" | "w" | "h"> & Partial<LayoutItem>;
    target?: { x: number; y: number };
    strategy?: "target-first" | "first-fit" | "append-after-bottom";
    repair?: LayoutRepairPolicy;
  };
  export type LayoutRepairSolver = (input: LayoutRepairSolverInput) => LayoutRepairSolverResult;
  export type LayoutRepairSolverInput = {
    layout: Layout;
    originalLayout: Layout;
    cols: number;
    maxRows?: number;
    allowOverlap: boolean;
    preventCollision: boolean;
    policy: LayoutRepairPolicy;
    objective: Required<LayoutRepairObjective>;
  };
  export type LayoutRepairSolverResult = {
    layout: Layout;
    diagnostics?: LayoutRepairDiagnostic[];
    summary?: LayoutRepairSummary;
  };
  export type LayoutMigrationSummary = {
    previousCols: number;
    nextCols: number;
    ratio: number;
    axis: LayoutMigrationAxis;
    rounding: LayoutMigrationRounding;
    geometryChanged: boolean;
    visualOnlyChange: boolean;
  };
  export type LayoutRepairSummary = {
    strategy: LayoutRepairStrategy;
    fallback?: string;
    score?: number;
    objective?: Required<LayoutRepairObjective>;
    candidateCount: number;
    movedCount: number;
    resizedCount: number;
    clampedCount: number;
    forcedStaticRepairCount: number;
    unresolvedIds: string[];
    durationMs?: number;
  };
  export type LayoutRepairDiagnosticCode =
    | "settings-invalid"
    | "settings-visual-only"
    | "settings-ratio"
    | "item-invalid"
    | "item-sanitized"
    | "item-clamped"
    | "item-shrunk"
    | "item-expanded"
    | "item-moved"
    | "item-added"
    | "item-skipped"
    | "collision-detected"
    | "repair-fallback"
    | "static-preserved"
    | "forced-static-repair"
    | "unresolved-item"
    | "custom-solver-fallback"
    | "policy-unsupported"
    | "placement-source";
  export type LayoutRepairDiagnostic = {
    code: LayoutRepairDiagnosticCode;
    level: "info" | "warning" | "error";
    message: string;
    itemId?: string;
    before?: Pick<LayoutItem, "x" | "y" | "w" | "h">;
    after?: Pick<LayoutItem, "x" | "y" | "w" | "h">;
    reason?: string;
    details?: unknown;
  };
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
    details?: LayoutRepairDiagnostic[];
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
      migration?: LayoutMigrationSummary;
      repair?: LayoutRepairSummary;
      details?: LayoutRepairDiagnostic[];
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
    migration?: LayoutMigrationSummary;
    repair?: LayoutRepairSummary;
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
    | "placing"
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

  export const DASHBOARD_SCHEMA_VERSION: 1;
  export type DashboardJsonPrimitive = string | number | boolean | null;
  export type DashboardJsonValue =
    | DashboardJsonPrimitive
    | DashboardJsonObject
    | DashboardJsonValue[];
  export type DashboardJsonObject = { [key: string]: DashboardJsonValue };
  export type DashboardDocumentMeta = DashboardJsonObject;
  export type DashboardDiagnosticLevel = "info" | "warning" | "error";
  export type DashboardDiagnostic = {
    code: string;
    level: DashboardDiagnosticLevel;
    message: string;
    path?: string;
    itemId?: string;
    profileId?: string;
    layoutId?: string;
    targetView?: "desktop" | "mobile";
    details?: unknown;
  };
  export type DashboardLayoutDocument = {
    dashboardSchemaVersion: number;
    kind: "dashboard-layout";
    key: string;
    revision: string;
    sourceId: string;
    savedAt: string;
    primaryLayoutId: string;
    layouts: Record<string, DashboardLayoutDefinition>;
    meta?: DashboardDocumentMeta;
    [key: string]: unknown;
  };
  export type DashboardLayoutDefinition = {
    widgets: Record<string, DashboardItemLayout>;
    gridSettings?: DashboardGridSettings;
    profiles?: Record<string, DashboardBreakpointProfile>;
    editor?: DashboardEditorEnvelope;
    extensions?: DashboardJsonObject;
    [key: string]: unknown;
  };
  export type DashboardBreakpointProfile = {
    widgets?: Record<string, DashboardItemLayoutOverride>;
    gridSettings?: DashboardGridSettings;
    editor?: DashboardEditorEnvelope;
    extensions?: DashboardJsonObject;
    [key: string]: unknown;
  };
  export type DashboardItemLayout = {
    col: number;
    row: number;
    sizeX: number;
    sizeY: number;
    minSizeX?: number;
    minSizeY?: number;
    maxSizeX?: number;
    maxSizeY?: number;
    static?: boolean;
    draggable?: boolean;
    resizable?: boolean;
    bounded?: boolean;
    resizeHandles?: ResizeHandleAxis[];
    desktopHide?: boolean;
    mobileHide?: boolean;
    mobileHeight?: number;
    mobileOrder?: number;
    preserveAspectRatio?: boolean;
    aspectRatio?: number;
    extensions?: DashboardJsonObject;
    [key: string]: unknown;
  };
  export type DashboardItemLayoutOverride = Partial<DashboardItemLayout> & {
    extensions?: DashboardJsonObject;
    [key: string]: unknown;
  };
  export type DashboardGridSettings = {
    columns?: number;
    minColumns?: number;
    margin?: number | [number, number];
    outerMargin?: boolean;
    containerPadding?: [number, number];
    viewFormat?: "grid" | "list";
    rowHeight?: number;
    autoFillHeight?: boolean;
    heightMode?: GridHeightMode;
    mobileHeightMode?: GridHeightMode;
    minRowHeight?: number;
    renderPrecision?: GridRenderPrecision;
    mobileRowHeight?: number;
    mobileAutoFillHeight?: boolean;
    mobileDisplayLayoutFirst?: boolean;
    layoutDimension?: {
      type?: "percentage" | "fixed";
      fixedWidth?: number;
      fixedLayout?: string;
      leftWidthPercentage?: number;
      [key: string]: unknown;
    };
    backgroundColor?: string;
    backgroundSizeMode?: string;
    backgroundImageUrl?: string;
    extensions?: DashboardJsonObject;
    [key: string]: unknown;
  };
  export type ResolvedDashboardGridSettings = DashboardGridSettings & {
    columns: number;
    minColumns: number;
    margin: number | [number, number];
    outerMargin: boolean;
    viewFormat: "grid" | "list";
    rowHeight: number;
    autoFillHeight: boolean;
    heightMode?: GridHeightMode;
    mobileHeightMode?: GridHeightMode;
    minRowHeight?: number;
    renderPrecision: GridRenderPrecision;
  };
  export type DashboardEditorEnvelope = {
    version: number;
    editorMetaById?: GridEditorMetaById;
    sectionRows?: unknown;
    updatedAt?: string;
    extensions?: DashboardJsonObject;
    [key: string]: unknown;
  };
  export type DashboardMigration = (
    document: unknown,
    context: { fromVersion: number; toVersion: number }
  ) => unknown;
  export type DashboardMigrationMap = Record<number, DashboardMigration>;
  export type DashboardMigrationEvent = { fromVersion: number; toVersion: number };
  export type DashboardErrorCode =
    | "invalid-json"
    | "invalid-document"
    | "validation"
    | "migration-missing"
    | "migration-failed"
    | "unknown-item";
  export type DashboardDocumentError = {
    code: DashboardErrorCode;
    message: string;
    path?: string;
    recoverable?: boolean;
    details?: unknown;
    cause?: unknown;
    originalPayload?: unknown;
  };
  export type DashboardValidationResult =
    | {
        ok: true;
        document: DashboardLayoutDocument;
        warnings: DashboardDiagnostic[];
        diagnostics: DashboardDiagnostic[];
      }
    | {
        ok: false;
        error: DashboardDocumentError;
        originalPayload: unknown;
        warnings: DashboardDiagnostic[];
        diagnostics: DashboardDiagnostic[];
      };
  export type SerializeDashboardLayoutOptions = {
    key: string;
    sourceId?: string;
    meta?: DashboardDocumentMeta;
    now?: () => Date;
    revision?: () => string;
  };
  export type DeserializeDashboardLayoutOptions = {
    currentVersion?: number;
    migrations?: DashboardMigrationMap;
    validation?: LayoutValidationMode;
    fallback?: DashboardLayoutDocument;
  };
  export type DashboardDeserializeResult =
    | {
        ok: true;
        document: DashboardLayoutDocument;
        migrations: DashboardMigrationEvent[];
        warnings: DashboardDiagnostic[];
        diagnostics: DashboardDiagnostic[];
      }
    | {
        ok: false;
        error: DashboardDocumentError;
        fallback?: DashboardLayoutDocument;
        originalPayload: unknown;
        migrations: DashboardMigrationEvent[];
        warnings: DashboardDiagnostic[];
        diagnostics: DashboardDiagnostic[];
      };
  export type DashboardMigrationResult =
    | {
        ok: true;
        document: DashboardLayoutDocument;
        migrations: DashboardMigrationEvent[];
        originalPayload: unknown;
        warnings: DashboardDiagnostic[];
        diagnostics: DashboardDiagnostic[];
      }
    | {
        ok: false;
        error: DashboardDocumentError;
        originalPayload: unknown;
        migrations: DashboardMigrationEvent[];
        warnings: DashboardDiagnostic[];
        diagnostics: DashboardDiagnostic[];
      };
  export type ProjectDashboardLayoutOptions = {
    layoutId?: string;
    profileId?: string;
    targetView?: "desktop" | "mobile";
    validation?: LayoutValidationMode;
    allowNonPrimary?: boolean;
  };
  export type DashboardGridRuntimeProjection = {
    layout: Layout;
    gridSettings: ResolvedDashboardGridSettings;
    editorMetaById: GridEditorMetaById;
    layoutId: string;
    profileId: string | null;
    fallbackApplied: boolean;
    diagnostics: DashboardDiagnostic[];
  };
  export type DashboardProjectionResult =
    | {
        ok: true;
        projection: DashboardGridRuntimeProjection;
        diagnostics: DashboardDiagnostic[];
      }
    | {
        ok: false;
        error: DashboardDocumentError;
        originalPayload: unknown;
        diagnostics: DashboardDiagnostic[];
      };
  export type WriteDashboardRuntimeOptions = {
    layoutId?: string;
    profileId?: string;
    targetView?: "desktop" | "mobile";
    editorMetaById?: GridEditorMetaById;
    writeItemIds?: string[];
    createMissingItems?: boolean;
    removeMissingItems?: boolean;
    createMissingProfile?: boolean;
    validation?: LayoutValidationMode;
  };
  export type DashboardWriteResult =
    | {
        ok: true;
        document: DashboardLayoutDocument;
        diagnostics: DashboardDiagnostic[];
      }
    | {
        ok: false;
        error: DashboardDocumentError;
        document: DashboardLayoutDocument;
        originalPayload?: unknown;
        diagnostics: DashboardDiagnostic[];
      };
  export type DashboardLayoutSettingsMigrationOptions = {
    layoutId?: string;
    profileId?: string | null;
    previousSettings?: DashboardGridSettings;
    nextSettings: DashboardGridSettings;
    policy?: LayoutMigrationPolicy;
    createMissingProfile?: boolean;
    validation?: LayoutValidationMode;
  };
  export type DashboardLayoutRepairOptions = {
    layoutId?: string;
    profileId?: string | null;
    policy?: LayoutRepairPolicy;
    createMissingProfile?: boolean;
    validation?: LayoutValidationMode;
  };
  export type DashboardLayoutTranslateOptions = DashboardLayoutRepairOptions & {
    dx: number;
    dy: number;
    clampNegative?: boolean;
  };
  export type DashboardLayoutSettingsMigrationResult =
    | {
        ok: true;
        document: DashboardLayoutDocument;
        operation: LayoutOperationResult;
        diagnostics: DashboardDiagnostic[];
        error?: never;
      }
    | {
        ok: false;
        document: DashboardLayoutDocument;
        operation?: LayoutOperationResult;
        error: DashboardDocumentError;
        diagnostics: DashboardDiagnostic[];
      };
  export type DashboardPersistenceExternalChange = {
    key: string;
    source: "storage" | "adapter";
    raw?: unknown;
    oldRaw?: unknown;
    document?: unknown;
    localDocument?: DashboardLayoutDocument;
    externalDocument?: DashboardLayoutDocument;
    diagnostics?: DashboardDiagnostic[];
    sourceId?: string;
  };
  export type DashboardPersistenceAdapter = {
    load: (key: string) => MaybePromise<unknown>;
    save: (key: string, document: DashboardLayoutDocument) => MaybePromise<void>;
    remove: (key: string) => MaybePromise<void>;
    subscribe?: (
      key: string,
      callback: (event: DashboardPersistenceExternalChange) => void
    ) => () => void;
  };
  export type DashboardPersistenceLoadResult = {
    ok: boolean;
    found: boolean;
    document?: DashboardLayoutDocument;
    error?: DashboardDocumentError;
    fallbackApplied?: boolean;
    migrations: DashboardMigrationEvent[];
    warnings: DashboardDiagnostic[];
    diagnostics: DashboardDiagnostic[];
  };
  export type DashboardPersistenceSaveResult = {
    ok: boolean;
    document?: DashboardLayoutDocument;
    error?: DashboardDocumentError;
    diagnostics: DashboardDiagnostic[];
  };
  export type DashboardPersistenceRemoveResult = {
    ok: boolean;
    error?: DashboardDocumentError;
    diagnostics: DashboardDiagnostic[];
  };
  export type DashboardPersistenceConflictDiagnostic = DashboardDiagnostic & {
    code: "dashboard-conflict";
    localDocument?: DashboardLayoutDocument;
    externalDocument?: DashboardLayoutDocument;
  };
  export type ThingsBoardDashboardLayoutLike = {
    widgets?: Record<string, unknown>;
    gridSettings?: Record<string, unknown>;
    breakpoints?: Record<string, unknown>;
    [key: string]: unknown;
  };
  export type DashboardImportResult =
    | {
        ok: true;
        document: DashboardLayoutDocument;
        diagnostics: DashboardDiagnostic[];
      }
    | {
        ok: false;
        error: DashboardDocumentError;
        originalPayload: unknown;
        diagnostics: DashboardDiagnostic[];
      };
  export type DashboardExportResult =
    | {
        ok: true;
        value: ThingsBoardDashboardLayoutLike;
        diagnostics: DashboardDiagnostic[];
      }
    | {
        ok: false;
        error: DashboardDocumentError;
        diagnostics: DashboardDiagnostic[];
      };
  export function serializeDashboardLayoutDocument(
    input: DashboardLayoutDefinition | DashboardLayoutDocument,
    options: SerializeDashboardLayoutOptions
  ): DashboardLayoutDocument;
  export function deserializeDashboardLayoutDocument(
    payload: unknown,
    options?: DeserializeDashboardLayoutOptions
  ): DashboardDeserializeResult;
  export function validateDashboardLayoutDocument(
    payload: unknown,
    options?: {
      currentVersion?: number;
      validation?: LayoutValidationMode;
    }
  ): DashboardValidationResult;
  export function migrateDashboardLayoutDocument(
    payload: unknown,
    options?: {
      currentVersion?: number;
      migrations?: DashboardMigrationMap;
      validation?: LayoutValidationMode;
    }
  ): DashboardMigrationResult;
  export function projectDashboardLayoutDocument(
    document: DashboardLayoutDocument,
    options?: ProjectDashboardLayoutOptions
  ): DashboardProjectionResult;
  export function writeDashboardRuntimeToDocument(
    document: DashboardLayoutDocument,
    runtime: {
      layout: Layout;
      editorMetaById?: GridEditorMetaById;
      gridSettings?: Partial<DashboardGridSettings>;
    },
    options?: WriteDashboardRuntimeOptions
  ): DashboardWriteResult;
  export function migrateDashboardLayoutSettings(
    document: DashboardLayoutDocument,
    options: DashboardLayoutSettingsMigrationOptions
  ): DashboardLayoutSettingsMigrationResult;
  export function repairDashboardLayoutCollisions(
    document: DashboardLayoutDocument,
    options?: DashboardLayoutRepairOptions
  ): DashboardLayoutSettingsMigrationResult;
  export function translateDashboardLayout(
    document: DashboardLayoutDocument,
    options: DashboardLayoutTranslateOptions
  ): DashboardLayoutSettingsMigrationResult;
  export function importThingsBoardDashboardLayout(
    input: ThingsBoardDashboardLayoutLike,
    options?: Partial<SerializeDashboardLayoutOptions>
  ): DashboardImportResult;
  export function exportThingsBoardDashboardLayout(
    document: DashboardLayoutDocument,
    options?: { layoutId?: string }
  ): DashboardExportResult;
  export const dashboard: {
    DASHBOARD_SCHEMA_VERSION: typeof DASHBOARD_SCHEMA_VERSION;
    serializeDashboardLayoutDocument: typeof serializeDashboardLayoutDocument;
    deserializeDashboardLayoutDocument: typeof deserializeDashboardLayoutDocument;
    validateDashboardLayoutDocument: typeof validateDashboardLayoutDocument;
    migrateDashboardLayoutDocument: typeof migrateDashboardLayoutDocument;
    projectDashboardLayoutDocument: typeof projectDashboardLayoutDocument;
    writeDashboardRuntimeToDocument: typeof writeDashboardRuntimeToDocument;
    migrateDashboardLayoutSettings: typeof migrateDashboardLayoutSettings;
    repairDashboardLayoutCollisions: typeof repairDashboardLayoutCollisions;
    translateDashboardLayout: typeof translateDashboardLayout;
    importThingsBoardDashboardLayout: typeof importThingsBoardDashboardLayout;
    exportThingsBoardDashboardLayout: typeof exportThingsBoardDashboardLayout;
  };
  export const dashboardMigration: {
    migrateDashboardLayoutSettings: typeof migrateDashboardLayoutSettings;
    repairDashboardLayoutCollisions: typeof repairDashboardLayoutCollisions;
    translateDashboardLayout: typeof translateDashboardLayout;
  };
  export type DashboardTargetView = "desktop" | "mobile";
  export type DashboardResponsiveMode = "view" | "edit";
  export type DashboardTargetViewSource =
    | "explicit"
    | "resolver"
    | "breakpoint-id"
    | "width"
    | "default";
  export type DashboardResponsiveDiagnosticCode =
    | "profile-fallback"
    | "unknown-profile-item"
    | "unsupported-profile-field"
    | "missing-profile-write-blocked"
    | "projection-validation-failed"
    | "slot-widget-mismatch"
    | "invalid-breakpoint"
    | "target-view-default"
    | "settings-default"
    | "list-height-source"
    | "list-height-default"
    | "legacy-responsive-deferred"
    | "mode-alias-conflict"
    | "write-back-noop";
  export const DASHBOARD_RESPONSIVE_DIAGNOSTIC_CODES: {
    readonly profileFallback: "profile-fallback";
    readonly unknownProfileItem: "unknown-profile-item";
    readonly unsupportedProfileField: "unsupported-profile-field";
    readonly missingProfileWriteBlocked: "missing-profile-write-blocked";
    readonly projectionValidationFailed: "projection-validation-failed";
    readonly slotWidgetMismatch: "slot-widget-mismatch";
  };
  export type DashboardTargetViewRule = {
    mobileBreakpointIds?: string[];
    mobileMaxWidth?: number;
    resolve?: (context: {
      width: number;
      requestedBreakpoint: string;
      breakpoints: Record<string, number>;
    }) => DashboardTargetView | null | undefined;
  };
  export type ResolveDashboardResponsiveProfileOptions = {
    layoutId?: string;
    width: number;
    breakpoints: Record<string, number>;
    breakpoint?: string | null;
    targetView?: DashboardTargetView | null;
    targetViewRule?: DashboardTargetViewRule;
    mode?: DashboardResponsiveMode;
    validation?: LayoutValidationMode;
    allowUnknownProfileItems?: boolean;
  };
  export type DashboardHeightOptionOverrides = {
    heightMode?: GridHeightMode | null;
    containerHeight?: number | null;
    autoMeasureContainerHeight?: boolean;
    minRowHeight?: number;
    rowHeight?: number;
    renderPrecision?: GridRenderPrecision | null;
  };
  export type DashboardResponsiveRuntime = {
    layout: Layout;
    gridSettings: ResolvedDashboardGridSettings;
    editorMetaById: GridEditorMetaById;
    layoutId: string;
    requestedBreakpoint: string;
    resolvedProfileId: string | null;
    targetView: DashboardTargetView;
    targetViewSource: DashboardTargetViewSource;
    mode: DashboardResponsiveMode;
    viewFormat: "grid" | "list";
    heightOptions: DashboardHeightOptionOverrides;
    heightRuntime?: GridHeightRuntime;
    fallbackApplied: boolean;
    allItemIds: string[];
    activeItemIds: string[];
    renderItemIds: string[];
    hiddenItemIds: string[];
    diagnostics: DashboardDiagnostic[];
  };
  export type DashboardResponsiveProfileResult =
    | { ok: true; runtime: DashboardResponsiveRuntime; diagnostics: DashboardDiagnostic[] }
    | { ok: false; error: DashboardDocumentError; previousRuntime?: DashboardResponsiveRuntime; diagnostics: DashboardDiagnostic[] };
  export type WriteDashboardResponsiveRuntimeOptions = {
    layoutId?: string;
    requestedBreakpoint?: string;
    resolvedProfileId?: string | null;
    targetView?: DashboardTargetView;
    mode?: DashboardResponsiveMode;
    viewFormat?: "grid" | "list";
    editorMetaById?: GridEditorMetaById;
    writeItemIds?: string[];
    createMissingProfileOnEdit?: boolean;
    createMissingItems?: boolean;
    removeMissingItems?: boolean;
    validation?: LayoutValidationMode;
  };
  export type DashboardResponsiveWriteResult = DashboardWriteResult;
  export type CreateDashboardDocumentFromResponsiveLayoutsOptions = {
    key: string;
    layouts: Record<string, Layout>;
    breakpoints: Record<string, number>;
    cols?: Record<string, number>;
    margin?: Record<string, [number, number] | null> | [number, number];
    containerPadding?: Record<string, [number, number] | null> | [number, number] | null;
    defaultBreakpoint?: string;
    sourceId?: string;
  };
  export type DashboardResponsiveMigrationResult =
    | {
        ok: true;
        document: DashboardLayoutDocument;
        defaultBreakpoint: string;
        profileIds: string[];
        diagnostics: DashboardDiagnostic[];
      }
    | { ok: false; error: DashboardDocumentError; diagnostics: DashboardDiagnostic[] };
  export type DashboardResponsiveProfileEvent =
    | { type: "breakpointChange"; requestedBreakpoint: string; previous: string | null }
    | { type: "profileChange"; resolvedProfileId: string | null; previous: string | null; fallbackApplied: boolean }
    | { type: "projectionChange"; runtime: DashboardResponsiveRuntime }
    | { type: "diagnosticsChange"; diagnostics: DashboardDiagnostic[] }
    | { type: "documentChange"; document: DashboardLayoutDocument; runtime: DashboardResponsiveRuntime }
    | { type: "projectionError"; error: DashboardDocumentError; diagnostics: DashboardDiagnostic[] };
  export type UseDashboardResponsiveProfileModelOptions = {
    document: Ref<DashboardLayoutDocument> | DashboardLayoutDocument;
    width: Ref<number> | number;
    breakpoints: Ref<Record<string, number>> | Record<string, number>;
    breakpoint?: Ref<string | null | undefined> | string | null;
    targetView?: Ref<DashboardTargetView | null | undefined> | DashboardTargetView | null;
    targetViewRule?: DashboardTargetViewRule;
    mode?: Ref<DashboardResponsiveMode | undefined> | DashboardResponsiveMode;
    validation?: LayoutValidationMode;
    layoutEngine?: false | GridLayoutEngineProp;
    editor?: false | GridEditorProp;
    createMissingProfileOnEdit?: boolean;
    allowUnknownProfileItems?: boolean;
    onEvent?: (event: DashboardResponsiveProfileEvent) => void;
  };
  export type DashboardResponsiveProfileModel = {
    state: Readonly<Ref<DashboardResponsiveRuntime>>;
    editorController: GridEditorController | null;
    getInnerEditorProp: () => false | GridEditorProp;
    onLayoutChange: (layout: Layout) => void;
    onHeightRuntimeChange: (heightRuntime: GridHeightRuntime) => void;
    refresh: (reason?: string) => void;
    stop: () => void;
  };
  export type DashboardResponsiveVueGridLayoutProps = {
    document: DashboardLayoutDocument;
    width: number;
    breakpoints: Record<string, number>;
    breakpoint?: string | null;
    targetView?: DashboardTargetView | null;
    targetViewRule?: DashboardTargetViewRule;
    mode?: DashboardResponsiveMode;
    validation?: LayoutValidationMode;
    allowUnknownProfileItems?: boolean;
    createMissingProfileOnEdit?: boolean;
    layoutEngine?: false | GridLayoutEngineProp;
    editor?: false | GridEditorProp;
    heightMode?: GridHeightMode | null;
    containerHeight?: number | null;
    autoMeasureContainerHeight?: boolean;
    minRowHeight?: number;
    rowHeight?: number;
    renderPrecision?: GridRenderPrecision | null;
    dragActivationDistance?: GridDragActivationDistance;
  };
  export function createDashboardResponsiveDiagnostic(
    code: string,
    level: DashboardDiagnosticLevel,
    message: string,
    extra?: {
      path?: string;
      itemId?: string;
      profileId?: string;
      layoutId?: string;
      details?: unknown;
    }
  ): DashboardDiagnostic;
  export const DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE: "grid-height-runtime";
  export function isDashboardHeightDiagnostic(
    diagnostic: DashboardDiagnostic
  ): boolean;
  export function createDashboardHeightDiagnostic(
    diagnostic: GridHeightDiagnostic,
    runtime: Pick<DashboardResponsiveRuntime, "layoutId" | "resolvedProfileId" | "targetView">
  ): DashboardDiagnostic;
  export function resolveDashboardResponsiveProfile(
    document: DashboardLayoutDocument,
    options: ResolveDashboardResponsiveProfileOptions
  ): DashboardResponsiveProfileResult;
  export function resolveDashboardHeightOptions(
    settings: ResolvedDashboardGridSettings,
    context: {
      targetView: DashboardTargetView;
      explicit?: DashboardHeightOptionOverrides;
      diagnostics: DashboardDiagnostic[];
      layoutId: string;
      profileId: string | null;
    }
  ): DashboardHeightOptionOverrides;
  export function writeDashboardResponsiveRuntimeToDocument(
    document: DashboardLayoutDocument,
    runtime: DashboardResponsiveRuntime,
    committedLayout: Layout,
    options?: WriteDashboardResponsiveRuntimeOptions
  ): DashboardResponsiveWriteResult;
  export function createDashboardDocumentFromResponsiveLayouts(
    options: CreateDashboardDocumentFromResponsiveLayoutsOptions
  ): DashboardResponsiveMigrationResult;
  export function useDashboardResponsiveProfileModel(
    options: UseDashboardResponsiveProfileModelOptions
  ): DashboardResponsiveProfileModel;
  export const DashboardResponsiveVueGridLayout: DefineComponent<DashboardResponsiveVueGridLayoutProps>;
  export const dashboardResponsive: {
    DASHBOARD_RESPONSIVE_DIAGNOSTIC_CODES: typeof DASHBOARD_RESPONSIVE_DIAGNOSTIC_CODES;
    DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE: typeof DASHBOARD_HEIGHT_DIAGNOSTIC_SOURCE;
    createDashboardResponsiveDiagnostic: typeof createDashboardResponsiveDiagnostic;
    createDashboardHeightDiagnostic: typeof createDashboardHeightDiagnostic;
    isDashboardHeightDiagnostic: typeof isDashboardHeightDiagnostic;
    resolveDashboardResponsiveProfile: typeof resolveDashboardResponsiveProfile;
    resolveDashboardHeightOptions: typeof resolveDashboardHeightOptions;
    writeDashboardResponsiveRuntimeToDocument: typeof writeDashboardResponsiveRuntimeToDocument;
    createDashboardDocumentFromResponsiveLayouts: typeof createDashboardDocumentFromResponsiveLayouts;
    useDashboardResponsiveProfileModel: typeof useDashboardResponsiveProfileModel;
  };

  export type DashboardEditorShellActionStatus =
    | "success"
    | "noop"
    | "blocked"
    | "cancelled"
    | "unsupported"
    | "timeout"
    | "error";
  export type DashboardEditorShellActionType =
    | "resolve-position"
    | "paste"
    | "select"
    | "highlight"
    | "reset-highlight"
    | "scroll-to-item"
    | "prepare-dashboard-menu"
    | "prepare-widget-menu"
    | "close-menu"
    | "copy-widget"
    | "cut-widget"
    | "place-clipboard"
    | "paste-widget"
    | "duplicate-widget"
    | "remove-widget"
    | "copy-reference"
    | "paste-reference"
    | "replace-reference"
    | "open-palette"
    | "add-widget"
    | "external-drop"
    | "move-all"
    | "undo"
    | "redo"
    | "keyboard"
    | "cleanup";
  export type DashboardEditorShellActionSource =
    | "api"
    | "context-menu"
    | "keyboard"
    | "toolbar"
    | "palette"
    | "drop"
    | "pointer"
    | "lifecycle";
  export type DashboardEditorShellBlockedReason =
    | "mode-readonly"
    | "capability"
    | "locked"
    | "hidden"
    | "missing-item"
    | "missing-editor"
    | "missing-runtime"
    | "missing-grid-element"
    | "clipboard-unavailable"
    | "clipboard-permission"
    | "clipboard-invalid"
    | "adapter-unavailable"
    | "adapter-rejected"
    | "validation"
    | "profile-write-back"
    | "collision"
    | "bounds"
    | "maxRows"
    | "confirm-cancelled"
    | "guard-blocked"
    | "unsupported"
    | "invalid-input"
    | "dom-unavailable";
  export type DashboardEditorShellDiagnostic = {
    code: string;
    level: "info" | "warning" | "error";
    message: string;
    actionId?: string;
    actionType?: DashboardEditorShellActionType;
    source?: DashboardEditorShellActionSource | string;
    reason?: DashboardEditorShellBlockedReason | string;
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
    reason?: DashboardEditorShellBlockedReason | string;
    hidden?: boolean;
    diagnostics?: DashboardEditorShellDiagnostic[];
    metadata?: Record<string, unknown>;
  };
  export type DashboardEditorShellPositionSource =
    | "event"
    | "active-item"
    | "selection"
    | "last-menu"
    | "last-pointer"
    | "viewport-center"
    | "fallback"
    | "strategy"
    | "list"
    | "none";
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
  export type DashboardEditorShellPositionInput = Partial<
    Pick<DashboardEditorShellResolvedPosition, "x" | "y" | "source" | "list" | "clientX" | "clientY">
  >;
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
  export type DashboardEditorShellPositionResult =
    | { ok: true; position: DashboardEditorShellResolvedPosition; diagnostics: DashboardEditorShellDiagnostic[] }
    | { ok: false; status: "blocked" | "error"; reason: DashboardEditorShellBlockedReason | string; diagnostics: DashboardEditorShellDiagnostic[] };
  export type DashboardEditorShellMenuTarget =
    | { type: "dashboard"; position?: DashboardEditorShellResolvedPosition }
    | { type: "widget"; itemId: string; position?: DashboardEditorShellResolvedPosition };
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
  export type DashboardEditorShellPlacementStrategy =
    | "cursor"
    | "nearest-fit"
    | "first-fit"
    | "insert-top-shift"
    | "offset";
  export type DashboardEditorShellPlacementIntent =
    | "auto"
    | "here"
    | "selection"
    | "viewport";
  export type DashboardEditorShellPlacementSummary = {
    strategy: DashboardEditorShellPlacementStrategy;
    placementSource: DashboardEditorShellPlacementStrategy | "none";
    insertedIds: string[];
    shiftedIds: string[];
    delta?: { dx: number; dy: number };
    before: Array<{ id: string; x: number; y: number; w: number; h: number }>;
    after: Array<{ id: string; x: number; y: number; w: number; h: number }>;
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
  export type DashboardEditorShellAddWidgetOptions = DashboardEditorShellPlacementOptions;
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
  export type DashboardEditorShellAdapterResult = {
    ok: boolean;
    status?: DashboardEditorShellActionStatus;
    reason?: DashboardEditorShellBlockedReason | string;
    sourceIds?: string[];
    newIds?: string[];
    idMap?: Record<string, string>;
    metadata?: Record<string, unknown>;
    diagnostics?: DashboardEditorShellDiagnostic[];
    error?: { code?: string; message: string; cause?: unknown };
  };
  export type DashboardEditorShellCommitContext = DashboardEditorShellAdapterContext & {
    commandResult?: GridEditorCommandResult;
    writeResult?: DashboardResponsiveWriteResult | DashboardWriteResult;
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
  export type DashboardEditorShellConfirm = (ctx: DashboardEditorShellAdapterContext) => MaybePromise<boolean | DashboardEditorShellAvailability | DashboardEditorShellAdapterResult>;
  export type DashboardEditorShellGuard = (ctx: DashboardEditorShellAdapterContext) => MaybePromise<boolean | DashboardEditorShellAvailability | DashboardEditorShellAdapterResult | void>;
  export type DashboardEditorShellMessage = {
    code: string;
    level: "info" | "warning" | "error";
    message: string;
    itemIds?: string[];
    recoverable?: boolean;
  };
  export type DashboardEditorShellKeyboardPlacementOptions =
    | DashboardEditorShellPlacementOptions
    | (() => DashboardEditorShellPlacementOptions);
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
    moveAllStep?: { dx: number; dy: number };
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
  export type DashboardEditorShellProfileContext = {
    layoutId: string | null;
    requestedBreakpoint: string | null;
    resolvedProfileId: string | null;
    targetView: DashboardTargetView | null;
    viewFormat: "grid" | "list" | null;
  };
  export type DashboardEditorShellAdapterStageResult = {
    stage: DashboardEditorShellTransactionStage;
    ok: boolean;
    status?: DashboardEditorShellActionStatus;
    reason?: DashboardEditorShellBlockedReason | string;
    preparedId?: string;
    sourceIds?: string[];
    newIds?: string[];
    idMap?: Record<string, string>;
    metadata?: Record<string, unknown>;
    diagnostics?: DashboardEditorShellDiagnostic[];
    error?: { code?: string; message: string };
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
    writeResult?: DashboardResponsiveWriteResult | DashboardWriteResult;
    adapter?: DashboardEditorShellAdapterStageResult;
    placement?: DashboardEditorShellPlacementSummary;
    proposedDocument?: DashboardLayoutDocument;
    idMap?: Record<string, string>;
    patches?: LayoutPatch[];
    diagnostics: DashboardEditorShellDiagnostic[];
    data?: T;
  };
  export type DashboardEditorShellTransactionStage = "prepare" | "mutate" | "commit" | "rollback" | "complete";
  export type DashboardEditorShellEvent =
    | { type: "action-start"; actionId: string; actionType: DashboardEditorShellActionType; source: DashboardEditorShellActionSource; itemIds: string[]; profile: DashboardEditorShellProfileContext; position?: DashboardEditorShellResolvedPosition; diagnostics: DashboardEditorShellDiagnostic[] }
    | { type: "action-result"; actionId: string; actionType: DashboardEditorShellActionType; source: DashboardEditorShellActionSource; status: DashboardEditorShellActionStatus; ok: boolean; itemIds: string[]; affectedIds: string[]; profile: DashboardEditorShellProfileContext; position?: DashboardEditorShellResolvedPosition; commandResult?: GridEditorCommandResult; adapter?: DashboardEditorShellAdapterStageResult; placement?: DashboardEditorShellPlacementSummary; diagnostics: DashboardEditorShellDiagnostic[] }
    | { type: "documentChange"; event: DashboardEditorShellDocumentChangeEvent }
    | { type: "highlight-change"; actionId: string; itemId: string | null; previous: string | null; profile: DashboardEditorShellProfileContext }
    | { type: "menu-change"; actionId: string; menu: DashboardEditorShellPreparedMenu | null; reason?: string; profile: DashboardEditorShellProfileContext }
    | { type: "cleanup"; actionId: string; diagnostics: DashboardEditorShellDiagnostic[] };
  export type DashboardEditorShellState = {
    ready: boolean;
    degraded: boolean;
    runtime: DashboardResponsiveRuntime | null;
    layoutId: string | null;
    requestedBreakpoint: string | null;
    resolvedProfileId: string | null;
    targetView: DashboardTargetView | null;
    viewFormat: "grid" | "list" | null;
    gridSettings: ResolvedDashboardGridSettings | null;
    heightRuntime: GridHeightRuntime | null;
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
  export type DashboardEditorShellActionOptions = {
    source?: DashboardEditorShellActionSource;
    diagnostics?: DashboardEditorShellDiagnostic[];
  };
  export type DashboardEditorShellCommitPlacementOptions = DashboardEditorShellActionOptions &
    Omit<GridEditorCommitPlacementInput, "source">;
  export type DashboardEditorShellPasteOptions = DashboardEditorShellPlacementOptions;
  export type DashboardEditorShellPaletteOptions = DashboardEditorShellPlacementOptions & {
    autoAddReturnedTemplate?: boolean;
  };
  export type DashboardEditorShellActions = {
    getEventGridPosition(event?: Event | null, options?: DashboardEditorShellPositionRequest): DashboardEditorShellPositionResult;
    pasteAtEvent(event?: Event | null, options?: DashboardEditorShellPasteOptions): Promise<DashboardEditorShellActionResult>;
    pasteAtGridPosition(position: DashboardEditorShellPositionInput, options?: DashboardEditorShellPasteOptions): Promise<DashboardEditorShellActionResult>;
    selectItem(id: string, options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    highlightItem(id: string, options?: DashboardEditorShellActionOptions & { durationMs?: number; scroll?: boolean }): DashboardEditorShellActionResult;
    resetHighlight(): DashboardEditorShellActionResult;
    scrollToItem(id: string, options?: DashboardEditorShellActionOptions & { behavior?: ScrollBehavior; block?: ScrollLogicalPosition; inline?: ScrollLogicalPosition; retry?: boolean; selector?: string | ((itemId: string) => string); revealIfHidden?: boolean }): Promise<DashboardEditorShellActionResult>;
    prepareDashboardContextMenu(event?: Event | null, options?: { source?: DashboardEditorShellActionSource; includeHidden?: boolean; customItems?: DashboardEditorShellMenuDescriptor[] }): DashboardEditorShellPreparedMenu;
    prepareWidgetContextMenu(event: Event | null, itemId: string, options?: { source?: DashboardEditorShellActionSource; includeHidden?: boolean; customItems?: DashboardEditorShellMenuDescriptor[] }): DashboardEditorShellPreparedMenu;
    closeMenu(reason?: string): void;
    copyWidget(itemIds?: string | string[], options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    cutWidget(itemIds?: string | string[], options?: DashboardEditorShellActionOptions & { skipConfirm?: boolean }): Promise<DashboardEditorShellActionResult>;
    placeClipboard(target?: Event | DashboardEditorShellPositionInput | null, options?: DashboardEditorShellPasteOptions): Promise<DashboardEditorShellActionResult>;
    commitPlacement(options?: DashboardEditorShellCommitPlacementOptions): Promise<DashboardEditorShellActionResult>;
    pasteWidget(target?: Event | DashboardEditorShellPositionInput | null, options?: DashboardEditorShellPasteOptions): Promise<DashboardEditorShellActionResult>;
    duplicateWidget(itemIds?: string | string[], options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    removeWidget(itemIds?: string | string[], options?: DashboardEditorShellActionOptions & { skipConfirm?: boolean }): Promise<DashboardEditorShellActionResult>;
    copyWidgetReference(itemId: string, options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    pasteWidgetReference(target?: Event | DashboardEditorShellPositionInput | null, options?: DashboardEditorShellPasteOptions): Promise<DashboardEditorShellActionResult>;
    replaceReferenceWithWidgetCopy(itemId: string, options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    openWidgetPalette(target?: Event | DashboardEditorShellPositionInput | null, options?: DashboardEditorShellPaletteOptions): Promise<DashboardEditorShellActionResult>;
    addWidgetFromTemplate(template: DashboardEditorShellWidgetTemplate, target?: Event | DashboardEditorShellPositionInput | null, options?: DashboardEditorShellAddWidgetOptions): Promise<DashboardEditorShellActionResult>;
    handleExternalDrop(payload: DashboardEditorShellDropPayload, event: DragEvent | PointerEvent, options?: DashboardEditorShellPlacementOptions): Promise<DashboardEditorShellActionResult>;
    moveAllWidgets(dx: number, dy: number, options?: DashboardEditorShellActionOptions & { repair?: LayoutRepairPolicy; clampNegative?: boolean; commandPolicy?: "all-or-nothing" | "skip-blocked" }): Promise<DashboardEditorShellActionResult>;
    undo(options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    redo(options?: DashboardEditorShellActionOptions): Promise<DashboardEditorShellActionResult>;
    bindKeyboard(target?: HTMLElement | Window | Document): () => void;
    stop(): void;
  };
  export type DashboardEditorShellOptions = {
    document?: Ref<DashboardLayoutDocument | null | undefined> | DashboardLayoutDocument | null;
    model?: DashboardResponsiveProfileModel | null;
    runtime?: Ref<DashboardResponsiveRuntime | null | undefined> | DashboardResponsiveRuntime | null;
    editor?: GridEditorController | null;
    gridElement?: Ref<HTMLElement | null | undefined> | HTMLElement | null;
    mode?: Ref<DashboardResponsiveMode | GridEditorMode | undefined> | DashboardResponsiveMode | GridEditorMode;
    sourceId?: string;
    controlled?: boolean;
    position?: { fallback?: DashboardEditorShellPositionInput };
    keyboard?: false | DashboardEditorShellKeyboardOptions;
    menu?: {
      customDashboardItems?: DashboardEditorShellMenuDescriptor[] | ((ctx: unknown) => DashboardEditorShellMenuDescriptor[]);
      customWidgetItems?: DashboardEditorShellMenuDescriptor[] | ((ctx: unknown) => DashboardEditorShellMenuDescriptor[]);
      defaultAddStrategy?: DashboardEditorShellPlacementStrategy;
      defaultPasteStrategy?: DashboardEditorShellPlacementStrategy;
      defaultReferencePasteStrategy?: DashboardEditorShellPlacementStrategy;
      labelFactory?: (id: string, ctx: unknown) => string | undefined;
      shortcuts?: Partial<Record<DashboardEditorShellActionType, string>>;
    };
    widgetAdapter?: DashboardEditorShellWidgetAdapter;
    referenceAdapter?: DashboardEditorShellReferenceAdapter;
    palette?: DashboardEditorShellPaletteAdapter;
    confirm?: DashboardEditorShellConfirm;
    guards?: DashboardEditorShellGuard[];
    scrollAdapter?: (ctx: { itemId: string; itemElement: HTMLElement | null; gridElement: HTMLElement | null; options: unknown; runtime: DashboardResponsiveRuntime | null }) => MaybePromise<DashboardEditorShellAvailability | void>;
    idGenerator?: (baseId: string, existingIds: Set<string>) => string;
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
  export type DashboardEditorShellTransactionInput<T = unknown> = {
    actionId: string;
    actionType: DashboardEditorShellActionType;
    source: DashboardEditorShellActionSource;
    itemIds?: string[];
    position?: DashboardEditorShellResolvedPosition;
    context: DashboardEditorShellAdapterContext;
    prepare?: (ctx: DashboardEditorShellAdapterContext) => MaybePromise<DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult | null | undefined>;
    mutate: (prepared: DashboardEditorShellPreparedMutation | null, ctx: DashboardEditorShellAdapterContext) => MaybePromise<{ status?: DashboardEditorShellActionStatus; commandResult?: GridEditorCommandResult; writeResult?: DashboardResponsiveWriteResult | DashboardWriteResult; proposedDocument?: DashboardLayoutDocument; affectedIds?: string[]; patches?: LayoutPatch[]; placement?: DashboardEditorShellPlacementSummary; data?: T; diagnostics?: DashboardEditorShellDiagnostic[] }>;
    commit?: (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellCommitContext) => MaybePromise<DashboardEditorShellAdapterResult | void>;
    rollback?: (prepared: DashboardEditorShellPreparedMutation, ctx: DashboardEditorShellRollbackContext) => MaybePromise<DashboardEditorShellAdapterResult | void>;
    emit?: (event: DashboardEditorShellEvent) => void;
    profile: DashboardEditorShellProfileContext;
  };
  export function useDashboardEditorShell(options?: DashboardEditorShellOptions): DashboardEditorShell;
  export function getEventGridPosition(input: DashboardEditorShellPositionHelperInput): DashboardEditorShellPositionResult;
  export function resolveShellPosition(input: DashboardEditorShellPositionHelperInput): DashboardEditorShellPositionResult;
  export function buildDashboardContextMenu(input: unknown): DashboardEditorShellPreparedMenu;
  export function buildWidgetContextMenu(input: unknown): DashboardEditorShellPreparedMenu;
  export function runDashboardEditorShellTransaction<T = unknown>(input: DashboardEditorShellTransactionInput<T>): Promise<DashboardEditorShellActionResult<T>>;
  export function createDashboardEditorShellDiagnostic(code: string, level: "info" | "warning" | "error", message: string, extra?: Partial<DashboardEditorShellDiagnostic>): DashboardEditorShellDiagnostic;
  export function createDashboardEditorShellActionId(actionType: DashboardEditorShellActionType): string;
  export const dashboardEditorShell: {
    useDashboardEditorShell: typeof useDashboardEditorShell;
    getEventGridPosition: typeof getEventGridPosition;
    resolveShellPosition: typeof resolveShellPosition;
    buildDashboardContextMenu: typeof buildDashboardContextMenu;
    buildWidgetContextMenu: typeof buildWidgetContextMenu;
    runDashboardEditorShellTransaction: typeof runDashboardEditorShellTransaction;
    createDashboardEditorShellDiagnostic: typeof createDashboardEditorShellDiagnostic;
    createDashboardEditorShellActionId: typeof createDashboardEditorShellActionId;
  };
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
  export type GridEditorHistoryMode =
    | "record"
    | "ignore"
    | "record-preserveRedoStack"
    | "replace"
    | "clear";
  export type GridEditorHistoryPolicy = {
    mode?: GridEditorHistoryMode;
    mergeKey?: string;
    mergeWindowMs?: number;
    preserveRedoStack?: boolean;
    skip?: boolean;
    reason?: string;
  };
  export type GridEditorExternalApplyOptions = {
    origin?: string;
    history?: GridEditorHistoryMode | GridEditorHistoryPolicy;
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
    | "persistence"
    | "drop"
    | "external"
    | "remote"
    | "system";
  export type GridEditorCommand = {
    id?: string;
    type: GridEditorCommandType;
    targetIds?: string[];
    payload?: unknown;
    source?: GridEditorCommandSource;
    origin?: string;
    history?: GridEditorHistoryMode | GridEditorHistoryPolicy;
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
    | "command-pending"
    | "guard-aborted"
    | "stale-command"
    | "multi-resize-unsupported"
    | "persistence-error"
    | "conflict"
    | "invalid-input";
  export type GridEditorTransactionSummary = {
    layoutSize?: number;
    layoutCount?: number;
    metadataCount?: number;
    sectionRowCount?: number;
    selectionCount?: number;
    focusId?: string | null;
  };
  export type GridEditorSectionRowPatch =
    | { type: "set"; id: string; previous?: GridEditorSectionRow; next: GridEditorSectionRow }
    | { type: "remove"; id: string; previous?: GridEditorSectionRow };
  export type GridEditorTransactionPreview = {
    layoutPatches: LayoutPatch[];
    metadataPatches: GridEditorMetadataPatch[];
    sectionRowPatches?: GridEditorSectionRowPatch[];
    affectedIds: string[];
    beforeSummary: GridEditorTransactionSummary;
    afterSummary: GridEditorTransactionSummary;
    risk?: "normal" | "destructive" | "persistence" | "external";
  };
  export type GridEditorTransaction = {
    id: string;
    commandId: string;
    command: GridEditorCommand;
    source: GridEditorCommandSource;
    origin?: string;
    scope: string;
    before: GridEditorHistorySnapshot;
    after: GridEditorHistorySnapshot;
    preview: GridEditorTransactionPreview;
    history: GridEditorHistoryPolicy;
  };
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
      pendingScope?: string;
      stateRevision?: number;
      stale?: boolean;
      historyMode?: GridEditorHistoryMode;
      source?: GridEditorCommandSource;
      origin?: string;
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
    source: GridEditorCommandSource;
    origin?: string;
    targetIds: string[];
    layout: Layout;
    layouts?: LayoutsMap;
    editorMetaById: GridEditorMetaById;
    sectionRows: GridEditorSectionRowState;
    selection: GridEditorSelectionState;
    mode: GridEditorMode;
    history: {
      canUndo: boolean;
      canRedo: boolean;
    };
    preview?: GridEditorTransactionPreview;
    signal?: AbortSignal;
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
    export type GridEditorGuideInteraction = "drag" | "resize" | "drop" | "placement" | "keyboard" | "api";
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
  export type GridEditorPlacementStrategy =
    | "offset"
    | "cursor"
    | "nearest-fit"
    | "first-fit"
    | "insert-top-shift";
  export type GridEditorPlacementAnchor = "nearest" | "top-left";
  export type GridEditorPlacementDiagnostic = {
    code: string;
    level: "info" | "warning" | "error";
    message: string;
    reason?: GridEditorBlockedReason | string;
    itemIds?: string[];
    details?: unknown;
  };
  export type GridEditorPlacementGeometry = {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  export type GridEditorPlacementSummary = {
    strategy: GridEditorPlacementStrategy;
    placementSource: GridEditorPlacementStrategy | "none";
    collisionPolicy?: GridEditorPlacementCollisionPolicy;
    sessionId?: string;
    source?: string;
    insertedIds: string[];
    shiftedIds: string[];
    delta?: { dx: number; dy: number };
    before: GridEditorPlacementGeometry[];
    after: GridEditorPlacementGeometry[];
    diagnostics: GridEditorPlacementDiagnostic[];
  };
  export type GridEditorPlacementResult = {
    layout: Layout;
    failed: boolean;
    blocked?: { reason: GridEditorBlockedReason; itemIds?: string[]; message?: string };
    summary: GridEditorPlacementSummary;
  };
  export type GridEditorCommandComputedDiagnostics = {
    targetLine?: { axis: GridEditorGuideAxis; position: number; mode?: GridEditorAlignMode };
      targetSpacing?: { axis: GridEditorGuideAxis; value: number; mode?: GridEditorDistributeMode; strategy?: GridEditorDistributeStrategy };
      affectedIds?: string[];
      skippedIds?: string[];
      sectionRowContext?: { sectionId?: string; rowId?: string; source?: "metadata" | "inferred" | "none" };
      fallback?: string;
      placement?: GridEditorPlacementSummary;
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
    commands: Partial<Record<GridEditorCommandType, { command: GridEditorCommandType; enabled: boolean; reason?: GridEditorBlockedReason | "selection-count" | "unsupported-scope"; requiredSelectionCount?: number; blockedIds?: string[]; labelKey?: string; shortcuts?: string[]; messageKey?: string }>>;
    selectionSummary: { count: number; movableCount: number; lockedCount: number; hiddenCount: number; sectionRowIds: string[] };
    intelligenceSummary?: { equalSpacing?: boolean; distributionMode?: GridEditorDistributeMode; snapCandidateCount: number; degraded?: boolean; reason?: GridEditorIntelligenceDegradedReason };
  };
  export type GridEditorCommandAffects = {
    layout?: boolean;
    layouts?: boolean;
    metadata?: boolean;
    sectionRows?: boolean;
    selection?: boolean;
    focus?: boolean;
    persistence?: boolean;
	  };
	  export type GridEditorMutualExclusionScope = "layout" | "selection" | "persistence" | "global";
	  export type GridEditorResolveTargets = (command: GridEditorCommand) => string[];
	  export type GridEditorValidatePayload = (
	    command: GridEditorCommand
	  ) => { ok: true } | { ok: false; message?: string };
	  export type GridEditorBuildTransaction = (
	    command: GridEditorCommand
	  ) => GridEditorTransactionPreview;
	  export type GridEditorCommandDescriptor = {
	    type: GridEditorCommandType;
	    labelKey: string;
	    shortcuts?: string[];
	    defaultSource?: GridEditorCommandSource;
	    defaultHistory: GridEditorHistoryPolicy;
	    affects: GridEditorCommandAffects;
	    risk?: "normal" | "destructive" | "persistence" | "external";
	    mutualExclusionScope?: GridEditorMutualExclusionScope;
	    resolveTargets?: GridEditorResolveTargets;
	    validatePayload?: GridEditorValidatePayload;
	    buildTransaction?: GridEditorBuildTransaction;
	  };
  export type GridEditorClipboardSourceContext = {
    cols?: number;
    breakpoint?: string;
    layoutId?: string;
    viewFormat?: string;
  };
  export type GridEditorClipboardGeometry = Pick<LayoutItem, "x" | "y" | "w" | "h">;
  export type GridEditorClipboardOriginalGeometryById = Record<string, GridEditorClipboardGeometry>;
  export type GridEditorClipboardPayloadV1 = {
    version: 1;
    sourceId: string;
    copiedAt: string;
    items: Layout;
    editorMetaById: GridEditorMetaById;
  };
  export type GridEditorClipboardPayloadV2 = {
    version: 2;
    sourceId: string;
    copiedAt: string;
    items: Layout;
    editorMetaById: GridEditorMetaById;
    source?: GridEditorClipboardSourceContext;
    originalGeometryById?: GridEditorClipboardOriginalGeometryById;
  };
  export type GridEditorClipboardPayload =
    | GridEditorClipboardPayloadV1
    | GridEditorClipboardPayloadV2;
  export type GridEditorClipboardAdapter = {
    read: () => MaybePromise<GridEditorClipboardPayload | null>;
    write: (payload: GridEditorClipboardPayload) => MaybePromise<void>;
  };
  export type GridEditorClipboardTargetContext = {
    cols?: number;
    scale?: boolean;
  };
  export type GridEditorClipboardNormalizationResult = {
    items: Layout;
    scaled: boolean;
    sourceCols?: number;
    targetCols?: number;
  };
  export type CreateGridEditorClipboardPayloadInput = {
    version?: 1 | 2;
    sourceId: string;
    copiedAt?: string;
    items: Layout;
    editorMetaById: GridEditorMetaById;
    source?: GridEditorClipboardSourceContext;
    originalGeometryById?: GridEditorClipboardOriginalGeometryById;
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
    source?: GridEditorCommandSource;
    origin?: string;
    targetIds?: string[];
    affectedIds?: string[];
    historyMode?: GridEditorHistoryMode;
  };
  export type GridEditorHistoryPushOptions = { preserveRedoStack?: boolean };
  export type GridEditorHistoryReplaceOptions = { preserveRedoStack?: boolean };
  export type GridEditorHistoryMark = {
    id: string;
    snapshot: GridEditorHistorySnapshot;
    revision: number;
  };
  export type GridEditorHistoryController = {
    canUndo: Ref<boolean>;
    canRedo: Ref<boolean>;
    push: (entry: GridEditorHistoryEntry, options?: GridEditorHistoryPushOptions) => void;
    undo: () => GridEditorHistoryEntry | null;
    redo: () => GridEditorHistoryEntry | null;
    replacePresent: (snapshot: GridEditorHistorySnapshot | null, options?: GridEditorHistoryReplaceOptions) => void;
    clear: (snapshot?: GridEditorHistorySnapshot | null) => void;
    mark: (snapshot: GridEditorHistorySnapshot, revision: number) => GridEditorHistoryMark;
    bailToMark: (mark: GridEditorHistoryMark) => GridEditorHistorySnapshot;
    squashToMark: (mark: GridEditorHistoryMark, entry: GridEditorHistoryEntry, options?: GridEditorHistoryPushOptions) => void;
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
    pasteMode?: "immediate" | "interactive";
    moveStep?: number;
    fastMoveStep?: number;
    resizeStep?: number;
    fastResizeStep?: number;
    placementNudgeStep?: number;
    placementFastNudgeStep?: number;
    ignoredTargets?: Array<string | ((target: unknown) => boolean)>;
    ariaMessage?: (message: GridEditorMessage) => void;
  };
  export type GridEditorPasteStrategy =
    | "offset"
    | "cursor"
    | "nearest-fit"
    | "first-fit"
    | "insert-top-shift";
  export type GridEditorPlacementSessionSource = "paste" | "add" | "drop" | "palette" | "template" | "api";
  export type GridEditorPlacementSessionPhase = "starting" | "preview" | "blocked" | "committing";
  export type GridEditorPlacementCollisionPolicy = "block" | "layout";
  export type GridEditorPlacementCursor = {
    x: number;
    y: number;
    source?: "pointer" | "menu" | "keyboard" | "api" | "strategy";
    clientX?: number;
    clientY?: number;
  };
  export type GridEditorPlacementGhost = {
    id: string;
    item: LayoutItem;
    state: "preview" | "blocked" | "committing";
    sourceId?: string;
  };
  export type GridEditorPlacementAffectedOutline = {
    id: string;
    before: Pick<LayoutItem, "x" | "y" | "w" | "h">;
    after: Pick<LayoutItem, "x" | "y" | "w" | "h">;
    kind: "shift" | "collision" | "predicted";
  };
  export type GridEditorResolvedPastePayload = {
    items: Layout;
    editorMetaById?: GridEditorMetaById;
    sourceId?: string;
    source?: GridEditorClipboardSourceContext;
    originalGeometryById?: GridEditorClipboardOriginalGeometryById;
    responsive?: {
      scaled: boolean;
      sourceCols?: number;
      targetCols?: number;
    };
    mapped?: true;
  };
  export type GridEditorPlacementSession = {
    id: string;
    phase: GridEditorPlacementSessionPhase;
    source: GridEditorPlacementSessionSource;
    commandType: "add" | "paste";
    baseRevision: number;
    baseLayout: Layout;
    items: Layout;
    editorMetaById: GridEditorMetaById;
    resolvedClipboardPayload?: GridEditorResolvedPastePayload;
    strategy: GridEditorPasteStrategy;
    collisionPolicy: GridEditorPlacementCollisionPolicy;
    placementIntent?: "auto" | "here" | "selection" | "viewport";
    placementAnchor?: "nearest" | "top-left";
    compactType?: CompactType;
    allowOverlap?: boolean;
    preventCollision?: boolean;
    cursor?: GridEditorPlacementCursor;
    candidateLayout?: Layout;
    ghostItems: GridEditorPlacementGhost[];
    affectedOutlines: GridEditorPlacementAffectedOutline[];
    diagnostics: GridEditorPlacementDiagnostic[];
    blocked?: { reason: GridEditorBlockedReason; itemIds?: string[]; message?: string; recoverable: boolean };
    createdAt: number;
    updatedAt: number;
    previewSeq: number;
  };
  export type GridEditorBeginPlacementInput = {
    source: GridEditorPlacementSessionSource;
    commandType?: "add" | "paste";
    item?: Partial<LayoutItem>;
    items?: Partial<LayoutItem>[];
    editorMetaById?: GridEditorMetaById;
    resolvedClipboardPayload?: GridEditorResolvedPastePayload;
    strategy?: GridEditorPasteStrategy;
    collisionPolicy?: GridEditorPlacementCollisionPolicy;
    placementIntent?: "auto" | "here" | "selection" | "viewport";
    placementAnchor?: "nearest" | "top-left";
    compactType?: CompactType;
    allowOverlap?: boolean;
    preventCollision?: boolean;
    cursor?: GridEditorPlacementCursor;
    cols?: number;
    maxRows?: number;
    origin?: string;
  };
  export type GridEditorUpdatePlacementInput = {
    cursor?: GridEditorPlacementCursor;
    strategy?: GridEditorPasteStrategy;
    collisionPolicy?: GridEditorPlacementCollisionPolicy;
    compactType?: CompactType;
    allowOverlap?: boolean;
    preventCollision?: boolean;
    cols?: number;
    maxRows?: number;
  };
  export type GridEditorCommitPlacementInput = {
    source?: GridEditorCommandSource;
    autoCancelOnBlocked?: boolean;
  };
  export type GridEditorPlacementSessionResult = {
    status: "started" | "updated" | "blocked" | "cancelled" | "noop";
    session?: GridEditorPlacementSession;
    blocked?: GridEditorCommandResult["blocked"];
    diagnostics?: GridEditorCommandResult["diagnostics"];
  };
  export type GridEditorCommandPolicy = "all-or-nothing" | "skip-blocked";
  export type GridEditorLayoutOperationRunner = (input: {
    commandId: string;
    layout: Layout;
    operation: LayoutOperation;
    phase: "preview" | "commit";
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
    placementSession: Ref<GridEditorPlacementSession | null>;
    dirty: ComputedRef<boolean>;
    conflict: Ref<GridEditorConflict | null>;
    guides: Ref<GridEditorGuideState>;
    lastResult: Ref<GridEditorCommandResult | null>;
    execute: (command: GridEditorCommand) => Promise<GridEditorCommandResult>;
    canExecute: (command: GridEditorCommand) => GridEditorCommandResult;
    beginPlacement: (input: GridEditorBeginPlacementInput) => Promise<GridEditorPlacementSessionResult>;
    updatePlacement: (input: GridEditorUpdatePlacementInput) => GridEditorPlacementSessionResult;
    commitPlacement: (input?: GridEditorCommitPlacementInput) => Promise<GridEditorCommandResult>;
    cancelPlacement: (reason?: string) => GridEditorPlacementSessionResult;
    getToolbarState: () => GridEditorToolbarState;
    undo: () => Promise<GridEditorCommandResult>;
    redo: () => Promise<GridEditorCommandResult>;
    save: () => Promise<GridEditorCommandResult>;
    discard: () => Promise<GridEditorCommandResult>;
    reset: () => Promise<GridEditorCommandResult>;
    setExternalLayout: (layout: Layout, reason?: string, options?: GridEditorExternalApplyOptions) => void;
    setExternalLayouts: (
      layouts: LayoutsMap,
      breakpoint: string,
      reason?: string,
      options?: GridEditorExternalApplyOptions
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
    | { type: "placement-start"; session: GridEditorPlacementSession }
    | { type: "placement-update"; session: GridEditorPlacementSession }
    | { type: "placement-cancel"; sessionId: string; reason: string }
    | { type: "placement-commit"; sessionId: string; result: GridEditorCommandResult }
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
  export function getGridEditorCommandDescriptor(type: GridEditorCommandType): GridEditorCommandDescriptor | undefined;
  export function getGridEditorCommandDescriptors(): GridEditorCommandDescriptor[];
  export function createGridEditorTransactionPreview(
    before: GridEditorHistorySnapshot,
    after: GridEditorHistorySnapshot,
    input?: {
      metadataPatches?: GridEditorMetadataPatch[];
      sectionRowPatches?: GridEditorSectionRowPatch[];
      risk?: GridEditorTransactionPreview["risk"];
    }
  ): GridEditorTransactionPreview;
  export const internalGridEditorClipboard: GridEditorClipboardAdapter & { clear: () => void };
  export function parseGridEditorClipboardPayload(raw: unknown): GridEditorClipboardPayload | null;
  export function systemClipboardAdapter(): GridEditorClipboardAdapter;
  export function createGridEditorClipboardPayload(
    input: CreateGridEditorClipboardPayloadInput
  ): GridEditorClipboardPayload;
  export function normalizeGridEditorClipboardItemsForTarget(
    payload: GridEditorClipboardPayload | Pick<GridEditorClipboardPayload, "items">,
    target?: GridEditorClipboardTargetContext
  ): GridEditorClipboardNormalizationResult;
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
  export function placeGridEditorNewItems(
    sourceLayout: Layout,
    items: Layout,
    strategy: string,
    payload?: Record<string, unknown>
  ): GridEditorPlacementResult;
  export function createGridEditorPlacementSession(
    input: GridEditorBeginPlacementInput,
    context: { baseLayout: Layout; baseRevision: number; defaultStrategy?: GridEditorPasteStrategy; cols?: number; maxRows?: number; id?: string; now?: () => number }
  ): GridEditorPlacementSession;
  export function updateGridEditorPlacementSession(
    session: GridEditorPlacementSession,
    input?: GridEditorUpdatePlacementInput,
    context?: { now?: () => number }
  ): GridEditorPlacementSession;
  export function buildGridEditorPlacementCommitCommand(
    session: GridEditorPlacementSession,
    input?: GridEditorCommitPlacementInput
  ): GridEditorCommand;
  export function cancelGridEditorPlacementSession(
    session: GridEditorPlacementSession,
    reason?: string,
    context?: { now?: () => number }
  ): GridEditorPlacementSessionResult;
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
    heightMode?: GridHeightMode | null;
    containerHeight?: number | null;
    autoMeasureContainerHeight?: boolean;
    minRowHeight?: number;
    renderPrecision?: GridRenderPrecision | null;
    autoScroll?: boolean | AutoScrollOptions;
    dragActivationDistance?: GridDragActivationDistance;
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
    onHeightRuntimeChange?: (runtime: GridHeightRuntime) => void;
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
    dragActivationDistance?: GridDragActivationDistance;
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

  export function resolveGridHeightRuntime(
    options: ResolveGridHeightRuntimeOptions
  ): GridHeightRuntime;
  export const gridHeight: {
    GRID_HEIGHT_DIAGNOSTIC_CODES: typeof GRID_HEIGHT_DIAGNOSTIC_CODES;
    resolveGridHeightRuntime: typeof resolveGridHeightRuntime;
  };

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

  export type LayoutSettingsMigrationOptions = {
    previousSettings: LayoutMigrationSettings;
    nextSettings: LayoutMigrationSettings;
    policy?: LayoutMigrationPolicy;
    engineOptions: GridLayoutEngineOptions;
    id?: string;
    phase?: LayoutOperationPhase;
    debug?: boolean;
  };
  export type LayoutRepairCollisionsOptions = {
    policy?: LayoutRepairPolicy;
    engineOptions: GridLayoutEngineOptions;
    id?: string;
    phase?: LayoutOperationPhase;
    debug?: boolean;
  };
  export type LayoutTranslateOptions = {
    dx: number;
    dy: number;
    clampNegative?: boolean;
    policy?: LayoutRepairPolicy;
    engineOptions: GridLayoutEngineOptions;
    id?: string;
    phase?: LayoutOperationPhase;
    debug?: boolean;
  };
  export type LayoutPlaceItemsOptions = {
    items: LayoutPlacementRequest[];
    policy?: LayoutRepairPolicy;
    engineOptions: GridLayoutEngineOptions;
    id?: string;
    phase?: LayoutOperationPhase;
    debug?: boolean;
  };
  export function createLayoutEngine(
    options: GridLayoutEngineOptions,
    layout?: Layout
  ): GridLayoutEngine;
  export function executeLayoutOperation(request: LayoutOperationRequest): LayoutOperationResult;
  export function migrateLayoutSettings(
    layout: Layout,
    options: LayoutSettingsMigrationOptions
  ): LayoutOperationResult;
  export function repairLayoutCollisions(
    layout: Layout,
    options: LayoutRepairCollisionsOptions
  ): LayoutOperationResult;
  export function translateLayout(
    layout: Layout,
    options: LayoutTranslateOptions
  ): LayoutOperationResult;
  export function placeLayoutItems(
    layout: Layout,
    options: LayoutPlaceItemsOptions
  ): LayoutOperationResult;
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
    executeLayoutOperation: typeof executeLayoutOperation;
    migrateLayoutSettings: typeof migrateLayoutSettings;
    repairLayoutCollisions: typeof repairLayoutCollisions;
    translateLayout: typeof translateLayout;
    placeLayoutItems: typeof placeLayoutItems;
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
    placeGridEditorNewItems: typeof placeGridEditorNewItems;
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
