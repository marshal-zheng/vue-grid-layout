import { type VNode } from "vue";
import type { Layout, LayoutItem } from "../utils";
import type { GridEditorGuide, GridEditorGuideState } from "../editor/types";
import type { GridEditorPlacementSession } from "../editor/placementSession";
import type { GridRenderPrecision } from "../grid-height";
type GridEditorOverlayGeometryInput = {
    width: number;
    margin: number[];
    containerPadding: number[];
    rowHeight: number;
    renderPrecision?: GridRenderPrecision;
    cols: number;
    maxRows: number;
};
export type GridEditorOverlayGeometry = ReturnType<typeof createGridEditorOverlayGeometry>;
export declare function createGridEditorOverlayGeometry({ width, margin, containerPadding, rowHeight, renderPrecision, cols, maxRows }: GridEditorOverlayGeometryInput): {
    padding: number[];
    colWidth: number;
    gridLineXPx: (value: number) => number;
    gridLineYPx: (value: number) => number;
    guideXPx: (guide: GridEditorGuide) => number;
    guideYPx: (guide: GridEditorGuide) => number;
    spanXPx: (start: number, end: number) => {
        start: number;
        end: number;
    };
    spanYPx: (start: number, end: number) => {
        start: number;
        end: number;
    };
    spacingXPx: (start: number, end: number) => {
        start: number;
        end: number;
    };
    spacingYPx: (start: number, end: number) => {
        start: number;
        end: number;
    };
    itemLeftPx: (value: number) => number;
    itemTopPx: (value: number) => number;
    itemWidthPx: (value: number) => number;
    itemHeightPx: (value: number) => number;
};
type RenderGridEditorOverlayOptions = {
    enabled: boolean;
    geometry: GridEditorOverlayGeometry;
    guideState?: GridEditorGuideState;
    placementSession?: GridEditorPlacementSession | null;
    itemMap: Map<string, LayoutItem>;
    layout: Layout;
};
export declare function renderGridEditorOverlay({ enabled, geometry, guideState, placementSession, itemMap, layout }: RenderGridEditorOverlayOptions): VNode[];
export {};
