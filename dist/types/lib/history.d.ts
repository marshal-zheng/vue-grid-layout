import { type Pinia, type Store } from 'pinia';
import { type Layout } from './utils';
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
export declare const createGridHistoryStore: (options?: GridHistoryOptions) => GridHistoryStore;
export declare const useGridHistoryStore: (options?: GridHistoryOptions) => GridHistoryStore;
/**
 * Bind keyboard shortcuts for undo/redo operations.
 *
 * @param store - The history store to bind shortcuts to
 * @param options - Configuration options for keyboard shortcuts
 * @returns A cleanup function to unbind the shortcuts
 *
 * @example
 * ```ts
 * const store = createGridHistoryStore()
 * const unbind = bindKeyboardShortcuts(store, {
 *   onUndo: (layout) => { gridLayout.value = layout },
 *   onRedo: (layout) => { gridLayout.value = layout }
 * })
 * // Later, to cleanup:
 * unbind()
 * ```
 */
export declare const bindKeyboardShortcuts: (store: GridHistoryStore, options?: KeyboardShortcutOptions) => (() => void);
