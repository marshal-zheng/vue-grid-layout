import type { CompactType, Layout, LayoutItem, ResizeHandleAxis } from "../utils";
import type { GridItemAspectRatioConstraint, LayoutResizeConstraint } from "../item-capabilities";
export type LayoutEngineMode = "default" | "legacy";
export type LayoutOperationPhase = "preview" | "commit";
export type LayoutOperation = {
    type: "move";
    id: string;
    x: number;
    y: number;
    userAction?: boolean;
} | {
    type: "groupMove";
    ids: string[];
    dx: number;
    dy: number;
    activeId?: string;
    userAction?: boolean;
} | {
    type: "resize";
    id: string;
    w: number;
    h: number;
    x?: number;
    y?: number;
    handle: ResizeHandleAxis;
    constraint?: LayoutResizeConstraint;
} | {
    type: "dropFit";
    item: Pick<LayoutItem, "w" | "h"> & Partial<Pick<LayoutItem, "i">>;
    strategy: "cursor" | "auto";
    target?: {
        x: number;
        y: number;
    };
} | {
    type: "compact";
} | {
    type: "validate";
} | {
    type: "generateResponsiveLayout";
    breakpoint: string;
    sourceBreakpoint?: string;
    cols: number;
    layouts?: Record<string, Layout>;
    breakpoints?: Record<string, number>;
} | {
    type: "migrateSettings";
    previousSettings: LayoutMigrationSettings;
    nextSettings: LayoutMigrationSettings;
    policy?: LayoutMigrationPolicy;
} | {
    type: "repairCollisions";
    policy?: LayoutRepairPolicy;
} | {
    type: "translateLayout";
    dx: number;
    dy: number;
    clampNegative?: boolean;
    policy?: LayoutRepairPolicy;
} | {
    type: "placeItems";
    items: LayoutPlacementRequest[];
    policy?: LayoutRepairPolicy;
};
export type LayoutOperationStatus = "changed" | "noop" | "blocked" | "cancelled" | "stale" | "fallback" | "error";
export type LayoutPatch = {
    type: "move";
    id: string;
    from: {
        x: number;
        y: number;
    };
    to: {
        x: number;
        y: number;
    };
} | {
    type: "resize";
    id: string;
    from: {
        w: number;
        h: number;
        x: number;
        y: number;
    };
    to: {
        w: number;
        h: number;
        x: number;
        y: number;
    };
} | {
    type: "add";
    item: LayoutItem;
} | {
    type: "remove";
    id: string;
} | {
    type: "compact";
    affectedIds: string[];
};
export type LayoutBlockedReason = "collision" | "static-item" | "bounds" | "maxRows" | "missing-item" | "invalid-input" | "handle-disabled" | "aspect-ratio" | "metrics-missing" | "unsupported";
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
    target?: {
        x: number;
        y: number;
    };
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
export type LayoutRepairDiagnosticCode = "settings-invalid" | "settings-visual-only" | "settings-ratio" | "item-invalid" | "item-sanitized" | "item-clamped" | "item-shrunk" | "item-expanded" | "item-moved" | "item-added" | "item-skipped" | "collision-detected" | "repair-fallback" | "static-preserved" | "forced-static-repair" | "unresolved-item" | "custom-solver-fallback" | "policy-unsupported" | "placement-source" | "item-capability.conflict" | "item-capability.handle-disabled" | "item-capability.aspect-ratio-invalid" | "item-capability.metrics-missing" | "item-capability.fallback-used" | "item-capability.sidecar-projected" | "item-capability.unsafe-key" | "item-capability.unknown-field";
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
    blocked?: {
        reason: LayoutBlockedReason;
        itemIds: string[];
    };
    placeholder?: LayoutItem;
    diagnostics?: LayoutDiagnostics;
    drop?: {
        position: {
            x: number;
            y: number;
        } | null;
        strategy: "cursor" | "auto";
        fallback?: "first-fit" | "nearest-fit" | "none";
        reason?: "collision" | "bounds" | "maxRows" | "invalid-input" | "no-fit";
    };
    migration?: LayoutMigrationSummary;
    repair?: LayoutRepairSummary;
    error?: {
        message: string;
        cause?: unknown;
    };
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
export type { GridItemAspectRatioConstraint, LayoutResizeConstraint };
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
    findFirstFit(item: Pick<LayoutItem, "w" | "h">): {
        x: number;
        y: number;
    } | null;
    findNearestFit(item: Pick<LayoutItem, "w" | "h">, target: {
        x: number;
        y: number;
    }): {
        x: number;
        y: number;
    } | null;
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
export type InteractionSchedulerMode = "eager" | "raf" | "commitOnly" | "auto";
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
export type LayoutExecutorKind = "main-thread" | "worker" | "custom";
export type LayoutAbortSignal = {
    readonly aborted: boolean;
    addEventListener?: (type: "abort", listener: () => void, options?: {
        once?: boolean;
    }) => void;
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
    onmessage: ((event: {
        data: unknown;
    }) => void) | null;
    onerror: ((event: unknown) => void) | null;
};
export type LayoutExecutorOptions = {
    kind?: "main-thread";
} | {
    kind: "worker";
    workerUrl?: string;
    workerFactory?: () => LayoutWorkerLike;
    timeoutMs?: number;
} | {
    kind: "custom";
    executor: LayoutExecutor;
};
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
export type LayoutEngineEvent = {
    type: "operation";
    id: string;
    operationType: LayoutOperation["type"];
    phase: LayoutOperationPhase;
    diagnostics: LayoutDiagnostics;
} | {
    type: "blocked";
    id: string;
    reason: LayoutBlockedReason;
    itemIds: string[];
    diagnostics?: LayoutDiagnostics;
} | {
    type: "fallback" | "worker-error" | "stale-result" | "timeout" | "budget-warning" | "interaction-cancelled" | "legacy-mismatch" | "scheduler";
    id: string;
    message?: string;
    diagnostics?: LayoutDiagnostics;
    details?: unknown;
};
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
    start: (interaction: {
        id: string;
        type: InteractionType;
        itemId: string;
    }) => InteractionControllerState;
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
    schedule: (request: LayoutOperationRequest, runner: (request: LayoutOperationRequest) => Promise<LayoutOperationResult> | LayoutOperationResult, onResult: (result: LayoutOperationResult) => void) => ScheduledLayoutTask;
    cancel: (reason?: string) => void;
    recordDuration: (durationMs: number) => void;
};
export type BenchmarkScenario = "dense" | "sparse" | "static-mixed" | "preventCollision" | "allowOverlap" | "drag-across-rows" | "north-west-resize" | "external-drop-fit" | "compact-commit";
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
