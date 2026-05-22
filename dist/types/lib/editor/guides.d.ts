import type { Layout, LayoutItem } from "../utils";
import type { GridEditorGuide, GridEditorGuidesOptions, GridEditorGuideState, GridEditorMetaById } from "./types";
export declare const filterGridEditorDisplayGuides: (guides: GridEditorGuide[], options?: GridEditorGuidesOptions, snappedGuideIds?: string[]) => GridEditorGuide[];
export declare const computeGridEditorGuideStateFromGeometry: (layout: Layout, activeItem: LayoutItem, candidateItem: LayoutItem, metaById?: GridEditorMetaById, options?: GridEditorGuidesOptions) => GridEditorGuideState;
export declare const computeGridEditorGuides: (layout: Layout, activeItem: LayoutItem, candidateItem: LayoutItem, metaById?: GridEditorMetaById, options?: GridEditorGuidesOptions) => GridEditorGuideState;
export declare const snapItemToGuides: (candidateItem: LayoutItem, guideState: GridEditorGuideState) => LayoutItem;
