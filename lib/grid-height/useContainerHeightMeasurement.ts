import ResizeObserverPolyfill from "resize-observer-polyfill";
import {
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
  type Ref
} from "vue";
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

const isPositiveFinite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const createMeasurementDiagnostic = (
  reason: string,
  details: Record<string, unknown> = {}
): GridHeightDiagnostic => ({
  code: "measurement-unavailable",
  level: "warning",
  message: "Parent container height measurement was unavailable.",
  prop: "autoMeasureContainerHeight",
  details: {
    reason,
    ...details
  }
});

const toCssNumber = (value: string | null | undefined): number => {
  const parsed = Number.parseFloat(value || "0");
  return Number.isFinite(parsed) ? parsed : 0;
};

const readContentBoxHeight = (element: HTMLElement): number => {
  const rect = element.getBoundingClientRect();
  const view = element.ownerDocument?.defaultView || (typeof window !== "undefined" ? window : null);
  const style = view?.getComputedStyle?.(element);
  if (!style) return rect.height;
  return rect.height -
    toCssNumber(style.paddingTop) -
    toCssNumber(style.paddingBottom) -
    toCssNumber(style.borderTopWidth) -
    toCssNumber(style.borderBottomWidth);
};

export function useContainerHeightMeasurement({
  enabled,
  rootRef,
  onDiagnostics
}: UseContainerHeightMeasurementOptions): ContainerHeightMeasurement {
  const measuredContainerHeight = ref<number | null>(null);
  const diagnostics = ref<GridHeightDiagnostic[]>([]);
  let observer: ResizeObserver | null = null;
  let observedTarget: HTMLElement | null = null;
  let stopped = false;

  const setDiagnostics = (next: GridHeightDiagnostic[]) => {
    diagnostics.value = next;
    onDiagnostics?.(next);
  };

  const disconnect = () => {
    observer?.disconnect();
    observer = null;
    observedTarget = null;
  };

  const updateHeight = (height: unknown, reason = "resize-observer") => {
    if (isPositiveFinite(height)) {
      measuredContainerHeight.value = height;
      setDiagnostics([]);
      return;
    }
    measuredContainerHeight.value = null;
    setDiagnostics([createMeasurementDiagnostic("invalid-height", { height, source: reason })]);
  };

  const observe = () => {
    if (stopped) return;
    disconnect();
    if (!enabled()) {
      measuredContainerHeight.value = null;
      setDiagnostics([]);
      return;
    }

    const parent = rootRef.value?.parentElement || null;
    if (!parent) {
      measuredContainerHeight.value = null;
      setDiagnostics([createMeasurementDiagnostic("missing-parent")]);
      return;
    }

    const ResizeObserverCtor = typeof ResizeObserver !== "undefined"
      ? ResizeObserver
      : ResizeObserverPolyfill;
    if (!ResizeObserverCtor) {
      measuredContainerHeight.value = null;
      setDiagnostics([createMeasurementDiagnostic("resize-observer-unavailable")]);
      return;
    }

    observedTarget = parent;
    observer = new ResizeObserverCtor(entries => {
      const entry = entries.find(item => item.target === observedTarget) || entries[0];
      updateHeight(entry?.contentRect?.height, "content-rect");
    });
    observer.observe(parent);
    updateHeight(readContentBoxHeight(parent), "initial-content-box");
  };

  const stop = () => {
    stopped = true;
    disconnect();
    measuredContainerHeight.value = null;
  };

  watch(
    () => [enabled(), rootRef.value?.parentElement || null],
    () => {
      void nextTick(observe);
    },
    { immediate: true }
  );

  onBeforeUnmount(stop);

  return {
    measuredContainerHeight,
    diagnostics,
    stop
  };
}
