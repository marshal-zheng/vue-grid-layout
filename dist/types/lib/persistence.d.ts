import { type Ref } from 'vue';
import { type Layout } from './utils';
export declare const LAYOUT_SCHEMA_VERSION = 1;
export type LayoutPersistenceKind = 'layout' | 'responsive';
export type LayoutPersistenceMeta = Record<string, unknown>;
export type LayoutsMap = Record<string, Layout>;
export type MaybePromise<T> = T | Promise<T>;
export type LayoutValidationMode = 'strict' | 'sanitize';
export type LayoutConflictStrategy = 'manual' | 'newer-wins' | 'keep-local';
export type LayoutPersistenceStatus = 'idle' | 'loading' | 'ready' | 'saving' | 'error' | 'unavailable' | 'conflict';
export type LayoutPersistenceDocument = {
    layoutSchemaVersion: number;
    kind: 'layout';
    key: string;
    revision: string;
    sourceId: string;
    savedAt: string;
    data: {
        layout: Layout;
    };
    meta?: LayoutPersistenceMeta;
} | {
    layoutSchemaVersion: number;
    kind: 'responsive';
    key: string;
    revision: string;
    sourceId: string;
    savedAt: string;
    data: {
        layouts: LayoutsMap;
    };
    meta?: LayoutPersistenceMeta;
};
export type SerializeLayoutOptions = {
    key: string;
    kind: LayoutPersistenceKind;
    sourceId?: string;
    meta?: LayoutPersistenceMeta;
    now?: () => Date;
    revision?: () => string;
};
export type LayoutMigration = (document: unknown, context: {
    fromVersion: number;
    toVersion: number;
}) => unknown;
export type LayoutMigrationMap = Record<number, LayoutMigration>;
export type LayoutMigrationEvent = {
    fromVersion: number;
    toVersion: number;
};
export type LayoutPersistenceErrorCode = 'invalid-json' | 'invalid-document' | 'kind-mismatch' | 'validation' | 'migration-missing' | 'migration-failed' | 'adapter-unavailable' | 'adapter-load-failed' | 'adapter-save-failed' | 'adapter-remove-failed' | 'adapter-subscribe-failed' | 'adapter-timeout';
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
export type DeserializeLayoutOptions<T = Layout | LayoutsMap> = {
    expectedKind?: LayoutPersistenceKind;
    currentVersion?: number;
    migrations?: LayoutMigrationMap;
    validation?: LayoutValidationMode;
    fallback?: T;
};
export type LayoutDeserializeResult<T = Layout | LayoutsMap> = {
    ok: true;
    document: LayoutPersistenceDocument;
    value: T;
    migrations: LayoutMigrationEvent[];
    warnings: LayoutPersistenceWarning[];
    fallback?: never;
    error?: never;
} | {
    ok: false;
    error: LayoutPersistenceError;
    fallback?: T;
    originalPayload: unknown;
    migrations: LayoutMigrationEvent[];
    warnings: LayoutPersistenceWarning[];
    document?: never;
    value?: never;
};
export type LayoutMigrationResult = {
    ok: true;
    document: LayoutPersistenceDocument;
    migrations: LayoutMigrationEvent[];
    originalPayload: unknown;
    warnings: LayoutPersistenceWarning[];
    error?: never;
} | {
    ok: false;
    error: LayoutPersistenceError;
    originalPayload: unknown;
    migrations: LayoutMigrationEvent[];
    warnings: LayoutPersistenceWarning[];
    document?: never;
};
export type LayoutValidationResult<T = Layout | LayoutsMap> = {
    ok: true;
    document: LayoutPersistenceDocument;
    value: T;
    warnings: LayoutPersistenceWarning[];
    error?: never;
} | {
    ok: false;
    error: LayoutPersistenceError;
    warnings: LayoutPersistenceWarning[];
    document?: never;
    value?: never;
};
export type LayoutPersistenceExternalChange = {
    key: string;
    source: 'storage' | 'adapter';
    raw?: unknown;
    oldRaw?: unknown;
    document?: unknown;
    sourceId?: string;
};
export type LayoutPersistenceAdapter = {
    load: (key: string) => MaybePromise<unknown>;
    save: (key: string, document: LayoutPersistenceDocument) => MaybePromise<void>;
    remove: (key: string) => MaybePromise<void>;
    subscribe?: (key: string, callback: (event: LayoutPersistenceExternalChange) => void) => () => void;
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
    source?: 'watch' | 'component' | 'programmatic' | 'external';
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
    reason: 'dirty-external-change';
    localValue: T;
    externalValue: T;
    localDocument: LayoutPersistenceDocument;
    externalDocument: LayoutPersistenceDocument;
    resolve: (action: 'useLocal' | 'useRemote') => Promise<void>;
};
export type LayoutPersistenceEvent<T = Layout | LayoutsMap> = {
    type: 'load-start';
    key: string;
    kind: LayoutPersistenceKind;
} | {
    type: 'load-success';
    key: string;
    kind: LayoutPersistenceKind;
    document: LayoutPersistenceDocument;
    value: T;
    migrations: LayoutMigrationEvent[];
    warnings: LayoutPersistenceWarning[];
} | {
    type: 'load-empty';
    key: string;
    kind: LayoutPersistenceKind;
} | {
    type: 'load-error';
    key: string;
    kind: LayoutPersistenceKind;
    error: LayoutPersistenceError;
    fallback?: T;
} | {
    type: 'save-start';
    key: string;
    kind: LayoutPersistenceKind;
} | {
    type: 'save-success';
    key: string;
    kind: LayoutPersistenceKind;
    document: LayoutPersistenceDocument;
} | {
    type: 'save-error';
    key: string;
    kind: LayoutPersistenceKind;
    error: LayoutPersistenceError;
} | {
    type: 'discard';
    key: string;
    kind: LayoutPersistenceKind;
    value: T;
} | {
    type: 'reset';
    key: string;
    kind: LayoutPersistenceKind;
    value: T;
} | {
    type: 'remove';
    key: string;
    kind: LayoutPersistenceKind;
} | {
    type: 'migration';
    key: string;
    kind: LayoutPersistenceKind;
    migrations: LayoutMigrationEvent[];
} | {
    type: 'conflict';
    key: string;
    kind: LayoutPersistenceKind;
    conflict: LayoutPersistenceConflict<T>;
} | {
    type: 'external-apply';
    key: string;
    kind: LayoutPersistenceKind;
    document: LayoutPersistenceDocument;
    value: T;
    reason: 'clean-external-change' | 'newer-wins' | 'resolve-remote';
} | {
    type: 'error';
    key: string;
    kind: LayoutPersistenceKind;
    error: LayoutPersistenceError;
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
    resolveConflict: (action: 'useLocal' | 'useRemote') => Promise<void>;
    stop: () => void;
};
export type GridLayoutPersistenceProp = false | Omit<UseGridLayoutPersistenceOptions<Layout>, 'target' | 'kind'>;
export type ResponsiveGridLayoutPersistenceProp = false | Omit<UseGridLayoutPersistenceOptions<LayoutsMap>, 'target' | 'kind'>;
export declare const createPersistenceError: (code: LayoutPersistenceErrorCode, message: string, extra?: Partial<LayoutPersistenceError>) => LayoutPersistenceError;
export declare const cloneLayoutsMap: (layouts: LayoutsMap) => LayoutsMap;
export declare function validateLayoutDocument<T = Layout | LayoutsMap>(payload: unknown, options?: {
    expectedKind?: LayoutPersistenceKind;
    currentVersion?: number;
    validation?: LayoutValidationMode;
}): LayoutValidationResult<T>;
export declare function serializeLayoutDocument(input: Layout | LayoutsMap, options: SerializeLayoutOptions): LayoutPersistenceDocument;
export declare function migrateLayoutDocument(payload: unknown, options?: {
    currentVersion?: number;
    migrations?: LayoutMigrationMap;
    expectedKind?: LayoutPersistenceKind;
    validation?: LayoutValidationMode;
}): LayoutMigrationResult;
export declare function deserializeLayoutDocument<T = Layout | LayoutsMap>(payload: unknown, options?: DeserializeLayoutOptions<T>): LayoutDeserializeResult<T>;
export declare function localStorageAdapter(options?: WebStorageAdapterOptions): LayoutPersistenceAdapter;
export declare function sessionStorageAdapter(options?: WebStorageAdapterOptions): LayoutPersistenceAdapter;
export declare function indexedDBAdapter(options?: IndexedDBAdapterOptions): LayoutPersistenceAdapter;
export declare function remoteHttpAdapter(options: RemoteHttpAdapterOptions): LayoutPersistenceAdapter;
export declare function memoryPersistenceAdapter(seed?: Record<string, unknown>): LayoutPersistenceAdapter;
export declare function useGridLayoutPersistence<T extends Layout | LayoutsMap>(options: UseGridLayoutPersistenceOptions<T>): GridLayoutPersistenceController<T>;
