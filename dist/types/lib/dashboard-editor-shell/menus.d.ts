import type { DashboardEditorShellActions, DashboardEditorShellMenuContext, DashboardEditorShellMenuDescriptor, DashboardEditorShellMenuOptions, DashboardEditorShellMenuTarget, DashboardEditorShellPreparedMenu, DashboardEditorShellResolvedPosition } from "./types";
type MenuBuildInput = {
    id: string;
    target: DashboardEditorShellMenuTarget;
    position?: DashboardEditorShellResolvedPosition;
    explicitPlacementTarget?: boolean;
    context: DashboardEditorShellMenuContext;
    actions: DashboardEditorShellActions;
    options?: DashboardEditorShellMenuOptions;
    customItems?: DashboardEditorShellMenuDescriptor[];
    includeHidden?: boolean;
    referenceAvailable?: boolean;
    paletteAvailable?: boolean;
    readonlyReason?: string;
    diagnostics?: DashboardEditorShellPreparedMenu["diagnostics"];
};
export declare const buildDashboardContextMenu: (input: MenuBuildInput) => DashboardEditorShellPreparedMenu;
export declare const buildWidgetContextMenu: (input: MenuBuildInput & {
    itemId: string;
    hiddenItem?: boolean;
    lockedItem?: boolean;
}) => DashboardEditorShellPreparedMenu;
export {};
