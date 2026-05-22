import type { Ref } from "vue";
import { type GridItemAspectRatioConstraint, type GridItemResizeMetrics, type ResolvedGridItemCapability } from "../item-capabilities";
import { type GridLayoutPersistenceController, type GridLayoutPersistenceProp } from "../persistence";
import type { CompactType, Layout, LayoutItem, ResizeHandleAxis } from "../utils";
import type { GridEditorController, GridEditorBlockedReason, GridEditorGuidesOptions, GridEditorProp, GridEditorCommandResult } from "../editor/types";
import type { GridLayoutEngineBridge } from "./gridInteractionTypes";
import type { LayoutOperationResult, LayoutResizeConstraint } from "../layout-engine";
type GridEditorRuntimeProps = {
    allowOverlap: boolean;
    cols: number;
    compactType: CompactType;
    editor?: false | GridEditorProp;
    persistence?: false | GridLayoutPersistenceProp | GridLayoutPersistenceController<Layout>;
    width?: number;
    margin: number[];
    containerPadding?: number[] | null;
    maxRows: number;
    preventCollision: boolean;
    rowHeight: number;
    renderPrecision?: "integer" | "subpixel" | null;
    transformScale: number;
    verticalCompact: boolean;
    itemCapabilities?: Record<string, ResolvedGridItemCapability>;
    resizeConstraints?: Record<string, GridItemAspectRatioConstraint>;
};
type GridEditorInteractionSnapshot = {
    activeDragId: string | null;
    activeResizeId: string | null;
    dragBlocked: boolean;
    dragBlockedReason?: GridEditorBlockedReason | null;
    dragBlockedItemIds?: string[];
    dragBlockedMessage?: string | null;
    resizeBlocked: boolean;
};
type GridEditorItemDefaults = {
    isBounded: boolean;
    isDraggable: boolean;
    isResizable: boolean;
};
type UseGridEditorRuntimeOptions = {
    props: GridEditorRuntimeProps;
    layoutRef: Ref<Layout>;
    persistenceController: unknown;
    engineBridge: GridLayoutEngineBridge;
    getLayout: () => Layout;
    getOldDragItem: () => LayoutItem | null | undefined;
    getOldResizeItem: () => LayoutItem | null | undefined;
    isDropping: () => boolean;
    getInteractionState: () => GridEditorInteractionSnapshot | null;
};
export declare function useGridEditorRuntime({ props, layoutRef, persistenceController, engineBridge, getLayout, getOldDragItem, getOldResizeItem, isDropping, getInteractionState }: UseGridEditorRuntimeOptions): {
    config: GridEditorProp | null;
    controller: GridEditorController | null;
    isEnabled: () => boolean;
    isViewMode: () => boolean;
    isEditMode: () => boolean;
    guidesEnabled: () => boolean;
    getMetaById: () => import("../editor/types").GridEditorMetaById;
    clearGuides: () => void;
    resetSnap: () => void;
    snapCandidate: (activeId: string, activeItem: LayoutItem, candidateItem: LayoutItem, validationLayout?: Layout, resizeHandle?: ResizeHandleAxis) => LayoutItem;
    updateIntelligence: (activeId: string, activeItem: LayoutItem, candidateItem: LayoutItem, resizeHandle?: ResizeHandleAxis) => {
        intelligence: import("../editor/types").GridEditorIntelligenceState;
        options: GridEditorGuidesOptions;
    } | null;
    resolveMoveDrag: (input: {
        id: string;
        item: LayoutItem;
        layout: Layout;
        legacyLayoutEngine: boolean;
        event?: Event;
    }) => {
        kind: "single";
        id: string;
        reason?: undefined;
        ids?: undefined;
        activeId?: undefined;
    } | {
        kind: "blocked";
        reason: GridEditorBlockedReason;
        ids: string[];
        activeId: string;
        id?: undefined;
    } | {
        kind: "group";
        activeId: string;
        ids: string[];
        id?: undefined;
        reason?: undefined;
    };
    resolveResizeIntent: (input: {
        id: string;
        item: LayoutItem;
        layout: Layout;
        handle: ResizeHandleAxis;
        rawCandidate: LayoutItem;
        metrics?: GridItemResizeMetrics;
        phase: "preview" | "commit";
    }) => {
        kind: "allowed";
        candidate: LayoutItem;
        reason?: undefined;
        ids?: undefined;
        message?: undefined;
        diagnostics?: undefined;
        constraint?: undefined;
    } | {
        kind: "blocked";
        reason: "mode-readonly";
        ids: string[];
        message: string;
        candidate?: undefined;
        diagnostics?: undefined;
        constraint?: undefined;
    } | {
        kind: "blocked";
        reason: GridEditorBlockedReason;
        ids: string[];
        diagnostics: import("../item-capabilities").GridItemCapabilityDiagnostic[] | undefined;
        candidate?: undefined;
        message?: undefined;
        constraint?: undefined;
    } | {
        kind: "blocked";
        reason: "handle-disabled";
        ids: string[];
        message: string;
        diagnostics: import("../item-capabilities").GridItemCapabilityDiagnostic[];
        candidate?: undefined;
        constraint?: undefined;
    } | {
        kind: "allowed";
        candidate: LayoutItem;
        constraint: LayoutResizeConstraint | undefined;
        diagnostics: import("../item-capabilities").GridItemCapabilityDiagnostic[];
        reason?: undefined;
        ids?: undefined;
        message?: undefined;
    };
    notifyMoveBlocked: (input: {
        reason: GridEditorBlockedReason;
        ids: string[];
        activeId?: string;
        message?: string;
        operationResult?: LayoutOperationResult;
    }) => void;
    commitMove: (input: {
        ids: string[];
        activeId?: string;
        beforeLayout: Layout;
        afterLayout: Layout;
        source?: "pointer" | "drop";
    }) => Promise<GridEditorCommandResult | null>;
    commitResize: (input: {
        id: string;
        beforeLayout: Layout;
        afterLayout: Layout;
        handle?: ResizeHandleAxis;
    }) => Promise<GridEditorCommandResult | null>;
    commitDrop: (input: {
        id: string;
        beforeLayout: Layout;
        afterLayout: Layout;
        item?: LayoutItem;
        event?: Event;
    }) => Promise<GridEditorCommandResult | null>;
    rollbackInteraction: (layout: Layout) => void;
    getItemRenderState: (item: LayoutItem, defaults: GridEditorItemDefaults, isDroppingItem?: boolean) => {
        visible: boolean;
        draggable: boolean;
        resizable: boolean;
        bounded: boolean;
        resizeHandles: ResizeHandleAxis[] | undefined;
        capabilityDiagnostics: import("../item-capabilities").GridItemCapabilityDiagnostic[] | undefined;
        className: string | undefined;
        previewItem: LayoutItem | null;
        onClick: ((event: MouseEvent) => void) | undefined;
    };
    isPlacementActive: () => boolean;
    onRootPointerMove: (event: MouseEvent | PointerEvent) => void;
    onRootClick: (event: MouseEvent) => void;
    mount: () => void;
    stop: () => void;
};
export {};
