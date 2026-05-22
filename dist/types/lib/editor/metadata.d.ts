import type { Layout, LayoutItem } from "../utils";
import type { GridEditorItemMeta, GridEditorMetaById, GridEditorMetadataPatch, GridEditorResolvedCapability } from "./types";
export type GridEditorMetaValidationIssue = {
    code: "invalid-root" | "invalid-id" | "unsafe-key" | "invalid-field" | "non-json-value" | "orphan-meta";
    path: string;
    message: string;
};
export type GridEditorMetaValidationResult = {
    ok: boolean;
    value: GridEditorMetaById;
    errors: GridEditorMetaValidationIssue[];
    warnings: GridEditorMetaValidationIssue[];
};
export type NormalizeEditorMetaOptions = {
    layout?: Layout;
    removeOrphans?: boolean;
};
export type ResolveEditorCapabilityOptions = {
    isDraggable?: boolean;
    isResizable?: boolean;
    isBounded?: boolean;
    defaultDeletable?: boolean;
    defaultDuplicatable?: boolean;
    defaultCopyable?: boolean;
};
export declare const validateEditorMetaById: (input: unknown, options?: NormalizeEditorMetaOptions) => GridEditorMetaValidationResult;
export declare const sanitizeEditorMetaById: (input: unknown, options?: NormalizeEditorMetaOptions) => GridEditorMetaById;
export declare const normalizeEditorMetaById: (input: unknown, options?: NormalizeEditorMetaOptions) => GridEditorMetaById;
export declare const removeOrphanEditorMeta: (metaById: GridEditorMetaById, layout: Layout) => GridEditorMetaById;
export declare const createEditorMetadataPatch: (id: string, previous: GridEditorItemMeta | undefined, next: GridEditorItemMeta | undefined) => GridEditorMetadataPatch | null;
export declare const applyEditorMetadataPatches: (metaById: GridEditorMetaById, patches: GridEditorMetadataPatch[]) => GridEditorMetaById;
export declare const patchEditorMeta: (metaById: GridEditorMetaById, id: string, patch: Partial<GridEditorItemMeta> | null) => {
    metaById: GridEditorMetaById;
    patch: GridEditorMetadataPatch | null;
};
export declare const isEditorItemVisible: (metaById: GridEditorMetaById, id: string) => boolean;
export declare const getVisibleLayout: (layout: Layout, metaById: GridEditorMetaById) => Layout;
export declare const resolveEditorItemCapability: (item: LayoutItem, meta: GridEditorItemMeta | undefined, options?: ResolveEditorCapabilityOptions) => GridEditorResolvedCapability;
export declare const resolveEditorCapabilities: (layout: Layout, metaById: GridEditorMetaById, options?: ResolveEditorCapabilityOptions) => Record<string, GridEditorResolvedCapability>;
export declare const hasUnsafeEditorMetaKeys: (input: unknown) => boolean;
export declare const hasEditorMeta: (metaById: GridEditorMetaById, id: string, key: keyof GridEditorItemMeta) => boolean;
