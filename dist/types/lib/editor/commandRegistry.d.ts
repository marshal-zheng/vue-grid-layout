import type { GridEditorCommand, GridEditorCommandSource, GridEditorCommandType, GridEditorHistoryPolicy, GridEditorTransactionPreview } from "./types";
export type GridEditorCommandAffects = {
    layout?: boolean;
    layouts?: boolean;
    metadata?: boolean;
    sectionRows?: boolean;
    selection?: boolean;
    focus?: boolean;
    persistence?: boolean;
};
export type GridEditorMutualExclusionScope = "layout" | "selection" | "persistence" | "global";
export type GridEditorResolveTargets = (command: GridEditorCommand) => string[];
export type GridEditorValidatePayload = (command: GridEditorCommand) => {
    ok: true;
} | {
    ok: false;
    message?: string;
};
export type GridEditorBuildTransaction = (command: GridEditorCommand) => GridEditorTransactionPreview;
export type GridEditorCommandDescriptor = {
    type: GridEditorCommandType;
    labelKey: string;
    shortcuts?: string[];
    defaultSource?: GridEditorCommandSource;
    defaultHistory: GridEditorHistoryPolicy;
    affects: GridEditorCommandAffects;
    risk?: "normal" | "destructive" | "persistence" | "external";
    mutualExclusionScope?: GridEditorMutualExclusionScope;
    resolveTargets?: GridEditorResolveTargets;
    validatePayload?: GridEditorValidatePayload;
    buildTransaction?: GridEditorBuildTransaction;
};
export declare const builtInGridEditorCommandDescriptors: GridEditorCommandDescriptor[];
export declare const getGridEditorCommandDescriptor: (type: GridEditorCommandType) => GridEditorCommandDescriptor | undefined;
export declare const getGridEditorCommandDescriptors: () => GridEditorCommandDescriptor[];
export declare const requireGridEditorCommandDescriptor: (type: GridEditorCommandType) => GridEditorCommandDescriptor;
