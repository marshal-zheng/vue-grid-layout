import { type Ref } from "vue";
import type { GridHeightDiagnostic } from "./types";
export type UseContainerHeightMeasurementOptions = {
    enabled: () => boolean;
    rootRef: Ref<HTMLElement | null>;
    onDiagnostics?: (diagnostics: GridHeightDiagnostic[]) => void;
};
export type ContainerHeightMeasurement = {
    measuredContainerHeight: Ref<number | null>;
    diagnostics: Ref<GridHeightDiagnostic[]>;
    stop: () => void;
};
export declare function useContainerHeightMeasurement({ enabled, rootRef, onDiagnostics }: UseContainerHeightMeasurementOptions): ContainerHeightMeasurement;
