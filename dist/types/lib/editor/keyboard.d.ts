import type { GridEditorCommand, GridEditorController, GridEditorKeyboardOptions, GridEditorMessage } from "./types";
export declare const shouldIgnoreEditorKeyboardEvent: (event: KeyboardEvent, options?: GridEditorKeyboardOptions) => boolean;
export declare const getGridEditorKeyboardCommand: (event: KeyboardEvent, options?: GridEditorKeyboardOptions) => GridEditorCommand | null;
export declare const messageFromCommandResult: (result: Awaited<ReturnType<GridEditorController["execute"]>>) => GridEditorMessage | null;
export declare const bindGridEditorKeyboard: (controller: GridEditorController, options?: GridEditorKeyboardOptions) => (() => void);
