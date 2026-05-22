import type { LayoutItem, ResizeHandleAxis } from "./utils";
export type GridItemCapabilitySource = "defaults" | "layout" | "dashboard" | "profile" | "editor" | "derived";
export type GridItemCapabilityDiagnosticCode = "item-capability.conflict" | "item-capability.handle-disabled" | "item-capability.aspect-ratio-invalid" | "item-capability.metrics-missing" | "item-capability.fallback-used" | "item-capability.sidecar-projected" | "item-capability.unsafe-key" | "item-capability.unknown-field";
export type GridItemCapabilityDiagnostic = {
    code: GridItemCapabilityDiagnosticCode;
    level: "info" | "warning" | "error";
    message: string;
    itemId?: string;
    field?: string;
    source?: GridItemCapabilitySource;
    targetSource?: GridItemCapabilitySource;
    details?: unknown;
};
export type GridItemAspectRatioFallbackPolicy = "block" | "grid-cell" | "start-geometry";
export type GridItemResizeMetrics = {
    colWidth: number;
    rowHeight: number;
    margin: [number, number];
    containerPadding?: [number, number];
    renderPrecision?: "integer" | "subpixel";
};
export type GridItemAspectRatioConstraint = {
    enabled: boolean;
    ratio?: number;
    ratioKind: "visual-px";
    source: "explicit" | "start-geometry";
    fallbackPolicy: GridItemAspectRatioFallbackPolicy;
    edgeHandles: ResizeHandleAxis[];
    metrics?: GridItemResizeMetrics;
    startGeometry?: Pick<LayoutItem, "x" | "y" | "w" | "h">;
    ratioTolerance?: number;
};
export type LayoutResizeConstraint = {
    handlePolicy?: {
        allowedHandles?: ResizeHandleAxis[];
        blockedReason?: "handle-disabled" | "capability";
    };
    aspectRatio?: GridItemAspectRatioConstraint;
};
export type GridItemPhysicalCapabilityInput = {
    static?: boolean;
    draggable?: boolean;
    resizable?: boolean;
    bounded?: boolean;
    resizeHandles?: ResizeHandleAxis[];
    preserveAspectRatio?: boolean;
    aspectRatio?: number;
    aspectRatioEdgeHandles?: ResizeHandleAxis[];
    [key: string]: unknown;
};
export type GridItemEditorCapabilityInput = {
    locked?: boolean;
    visible?: boolean;
    editable?: boolean;
    draggable?: boolean;
    resizable?: boolean;
    deletable?: boolean;
    duplicatable?: boolean;
    copyable?: boolean;
    resizeHandles?: ResizeHandleAxis[];
    [key: string]: unknown;
};
export type GridItemCapabilityDefaults = {
    visible?: boolean;
    editable?: boolean;
    draggable?: boolean;
    resizable?: boolean;
    bounded?: boolean;
    resizeHandles?: ResizeHandleAxis[];
    deletable?: boolean;
    duplicatable?: boolean;
    copyable?: boolean;
};
export type ResolveGridItemCapabilityInput = {
    item: LayoutItem;
    dashboard?: GridItemPhysicalCapabilityInput;
    profile?: GridItemPhysicalCapabilityInput;
    editor?: GridItemEditorCapabilityInput;
    defaults?: GridItemCapabilityDefaults;
    metrics?: GridItemResizeMetrics;
    startGeometry?: Pick<LayoutItem, "x" | "y" | "w" | "h">;
    aspectRatioFallbackPolicy?: GridItemAspectRatioFallbackPolicy;
    preserveUnknownFields?: boolean;
};
export type ResolvedGridItemCapability = {
    id: string;
    visible: boolean;
    editable: boolean;
    draggable: boolean;
    resizable: boolean;
    bounded: boolean;
    static: boolean;
    locked: boolean;
    resizeHandles: ResizeHandleAxis[];
    deletable: boolean;
    duplicatable: boolean;
    copyable: boolean;
    aspectRatio?: GridItemAspectRatioConstraint;
    resizeConstraint?: LayoutResizeConstraint;
    sources: Record<string, GridItemCapabilitySource>;
    sourceLists: Record<string, GridItemCapabilitySource[]>;
    diagnostics: GridItemCapabilityDiagnostic[];
    metadata?: Record<string, unknown>;
};
export type GridItemVisualSize = {
    widthPx: number;
    heightPx: number;
};
export type AspectRatioResizeBounds = {
    cols?: number;
    maxRows?: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
};
export type GridItemAspectRatioResizeResult = {
    kind: "allowed" | "degraded";
    candidate: LayoutItem;
    diagnostics: GridItemCapabilityDiagnostic[];
    ratio: number;
} | {
    kind: "blocked";
    reason: "handle-disabled" | "aspect-ratio" | "metrics-missing" | "invalid-input";
    candidate?: LayoutItem;
    diagnostics: GridItemCapabilityDiagnostic[];
};
export declare const isResizeHandleAxis: (value: unknown) => value is ResizeHandleAxis;
export declare const normalizeResizeHandles: (handles: unknown) => ResizeHandleAxis[] | undefined;
export declare const getGridItemVisualSize: (item: Pick<LayoutItem, "w" | "h">, metrics: GridItemResizeMetrics) => GridItemVisualSize;
export declare const isValidAspectRatio: (ratio: unknown) => ratio is number;
export declare const resolveGridItemAspectRatioConstraint: (input: {
    id: string;
    item: Pick<LayoutItem, "x" | "y" | "w" | "h">;
    preserveAspectRatio?: boolean;
    aspectRatio?: number;
    edgeHandles?: ResizeHandleAxis[];
    metrics?: GridItemResizeMetrics;
    startGeometry?: Pick<LayoutItem, "x" | "y" | "w" | "h">;
    fallbackPolicy?: GridItemAspectRatioFallbackPolicy;
    ratioTolerance?: number;
}) => {
    constraint?: GridItemAspectRatioConstraint;
    diagnostics: GridItemCapabilityDiagnostic[];
};
export declare const resolveAspectRatioResizeCandidate: (input: {
    startItem: LayoutItem;
    rawCandidate: LayoutItem;
    handle: ResizeHandleAxis;
    constraint: GridItemAspectRatioConstraint;
    bounds?: AspectRatioResizeBounds;
}) => GridItemAspectRatioResizeResult;
export declare const resolveGridItemCapability: (input: ResolveGridItemCapabilityInput) => ResolvedGridItemCapability;
