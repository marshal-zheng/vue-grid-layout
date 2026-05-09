declare module "@marsio/vue-grid-layout" {
  import type { CSSProperties, DefineComponent, Ref, VNode } from "vue";
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
  export type LayoutBlockedReason = "collision" | "static-item" | "bounds" | "maxRows" | "missing-item" | "invalid-input";
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

  export type VueGridLayoutProps = {
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
    innerRef?: Ref<HTMLElement | null>;
    onLayoutChange?: (layout: Layout) => void;
    onDragStart?: ItemCallback;
    onDrag?: ItemCallback;
    onDragStop?: ItemCallback;
    onResizeStart?: ItemCallback;
    onResize?: ItemCallback;
    onResizeStop?: ItemCallback;
    onDrop?: (layout: Layout, e: Event, item?: LayoutItem) => void;
    onDropDragOver?: (e: DragEvent) => { w?: number; h?: number } | false;
  };

  export type WidthProviderProps = {
    measureBeforeMount?: boolean;
    class?: string;
    style?: CSSProperties;
  };

  export type ResponsiveProps = {
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
