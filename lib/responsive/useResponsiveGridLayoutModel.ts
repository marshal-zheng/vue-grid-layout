import { Fragment, onBeforeUnmount, reactive, watch, type VNode } from "vue";
import { deepEqual } from "fast-equals";
import {
  cloneLayout,
  compactType as resolveCompactType,
  getNonFragmentChildren,
  synchronizeLayoutWithChildren
} from "../utils";
import type { CompactType, Layout } from "../utils";
import {
  findOrGenerateResponsiveLayout,
  getBreakpointFromWidth,
  getColsFromBreakpoint
} from "../responsiveUtils";
import type { Breakpoints, ResponsiveLayout } from "../responsiveUtils";
import {
  createLayoutExecutor,
  executeLayoutOperation
} from "../layout-engine";
import type {
  GridLayoutEngineOptions,
  GridLayoutEngineProp
} from "../layout-engine";

const pickResponsiveInputs = (props: ResponsiveGridLayoutModelProps) => ({
  width: props.width,
  breakpoint: props.breakpoint,
  breakpoints: props.breakpoints,
  cols: props.cols
});

export interface BreakpointMap {
  [key: string]: number;
}

export interface MarginPaddingMap {
  [key: string]: [number, number] | null;
}

export interface LayoutsMap {
  [key: string]: Layout;
}

type ResponsiveGridLayoutState = {
  layout: Layout,
  breakpoint: string,
  cols: number,
  layouts: LayoutsMap
};

export interface ResponsiveGridLayoutModelProps<Breakpoint extends string = string> {
  allowOverlap: boolean;
  breakpoint?: Breakpoint | string | null;
  breakpoints: Breakpoints<Breakpoint> | BreakpointMap;
  cols: Record<Breakpoint, number> | BreakpointMap;
  compactType: CompactType;
  containerPadding: Record<Breakpoint, [number, number] | null> | [number, number] | null;
  layoutEngine?: false | GridLayoutEngineProp;
  layouts: ResponsiveLayout<Breakpoint> | LayoutsMap;
  margin: Record<Breakpoint, [number, number] | null> | [number, number];
  verticalCompact: boolean;
  width: number;
}

type ResponsiveEmit = (
  event: "update:layouts" | "layoutChange" | "breakpointChange" | "widthChange",
  ...args: unknown[]
) => void;

type UseResponsiveGridLayoutModelOptions = {
  props: ResponsiveGridLayoutModelProps;
  slots: {
    default?: () => VNode[];
  };
  emit: ResponsiveEmit;
};

export function getIndentationValue<T extends Array<number> | null>(
  param: { [key: string]: T } | T,
  breakpoint: string
): T | null {
  if (param == null) return null;
  return Array.isArray(param) ? param : param[breakpoint];
}

export const cloneResponsiveLayoutsMap = (layouts: LayoutsMap): LayoutsMap => {
  const out: LayoutsMap = {};
  Object.keys(layouts).forEach(key => {
    out[key] = cloneLayout(layouts[key]);
  });
  return out;
};

export function useResponsiveGridLayoutModel({
  props,
  slots,
  emit
}: UseResponsiveGridLayoutModelOptions) {
  const generateInitialState = (): ResponsiveGridLayoutState => {
    const { width, breakpoints, layouts, cols } = props;
    const breakpoint = props.breakpoint || getBreakpointFromWidth(breakpoints, width);
    const colNo = getColsFromBreakpoint(breakpoint, cols);
    const compactType = resolveCompactType(props);
    const initialLayout = findOrGenerateResponsiveLayout(
      layouts,
      breakpoints,
      breakpoint,
      breakpoint,
      colNo,
      compactType
    );

    return {
      layout: initialLayout,
      breakpoint,
      cols: colNo,
      layouts: {
        ...layouts,
        [breakpoint]: initialLayout
      }
    };
  };

  const state = reactive(generateInitialState());

  const getLayoutEngineProp = () =>
    props.layoutEngine && typeof props.layoutEngine === "object"
      ? props.layoutEngine
      : null;

  const isLegacyLayoutEngine = () => {
    const config = getLayoutEngineProp();
    return props.layoutEngine === false || config?.mode === "legacy";
  };

  let executorConfigRef: unknown = undefined;
  let layoutExecutor = createLayoutExecutor();

  const getLayoutExecutor = () => {
    const config = getLayoutEngineProp();
    const nextExecutorConfig = config?.executor;
    if (nextExecutorConfig !== executorConfigRef) {
      layoutExecutor.dispose?.();
      layoutExecutor = createLayoutExecutor(nextExecutorConfig);
      executorConfigRef = nextExecutorConfig;
    }
    return layoutExecutor;
  };

  const getLayoutEngineOptions = (
    colNo: number,
    compact: CompactType
  ): GridLayoutEngineOptions => {
    const config = getLayoutEngineProp();
    return {
      cols: colNo,
      compactType: compact,
      allowOverlap: props.allowOverlap,
      scheduler: config?.scheduler,
      executor: getLayoutExecutor(),
      compareLegacy: config?.compareLegacy,
      legacyFallback: config?.legacyFallback !== false,
      diagnostics: config?.diagnostics,
      onEvent: config?.onEvent
    };
  };

  const onLayoutChange = (layout: Layout) => {
    const nextLayout = cloneLayout(layout);
    const newLayouts = {
      ...state.layouts,
      [state.breakpoint]: nextLayout
    };
    state.layout = nextLayout;
    state.layouts = newLayouts;
    emit("update:layouts", newLayouts);
    emit("layoutChange", nextLayout, newLayouts);
  };

  const onWidthChange = (prevProps) => {
    const { breakpoints, cols } = props;
    const compactType = resolveCompactType(props);
    const newBreakpoint =
      props.breakpoint ||
      getBreakpointFromWidth(props.breakpoints, props.width);

    const lastBreakpoint = state.breakpoint;
    const newCols: number = getColsFromBreakpoint(newBreakpoint, cols);
    const newLayouts = { ...state.layouts };

    if (
      lastBreakpoint !== newBreakpoint ||
      prevProps.breakpoints !== breakpoints ||
      prevProps.cols !== cols
    ) {
      newLayouts[lastBreakpoint] = cloneLayout(state.layout);

      const commitGeneratedLayout = (candidateLayout: Layout) => {
        const children: VNode[] = slots.default ? getNonFragmentChildren({ type: Fragment, children: slots.default() } as VNode) : [];
        const layout = synchronizeLayoutWithChildren(
          candidateLayout,
          children,
          newCols,
          compactType,
          props.allowOverlap
        );

        newLayouts[newBreakpoint] = layout;

        emit("breakpointChange", newBreakpoint, newCols);
        emit("update:layouts", newLayouts);
        emit("layoutChange", layout, newLayouts);

        state.breakpoint = newBreakpoint;
        state.layout = layout;
        state.cols = newCols;
        state.layouts = newLayouts;
      };

      let layout = findOrGenerateResponsiveLayout(
        newLayouts,
        breakpoints,
        newBreakpoint,
        lastBreakpoint,
        newCols,
        compactType
      );

      if (!isLegacyLayoutEngine()) {
        const request = {
          id: `responsive:${lastBreakpoint}->${newBreakpoint}`,
          phase: "commit",
          layout: newLayouts[lastBreakpoint] || state.layout,
          operation: {
            type: "generateResponsiveLayout",
            breakpoint: newBreakpoint,
            sourceBreakpoint: lastBreakpoint,
            cols: newCols,
            layouts: newLayouts,
            breakpoints
          },
          options: getLayoutEngineOptions(newCols, compactType),
          heavy: layout.length >= 500
        } as const;
        const executor = getLayoutExecutor();
        if (request.heavy && executor.kind !== "main-thread") {
          void executor.execute(request).then(result => {
            if (result.status === "changed" || result.status === "noop" || result.status === "fallback") {
              commitGeneratedLayout(result.layout);
            } else {
              commitGeneratedLayout(layout);
            }
          }).catch(() => {
            commitGeneratedLayout(layout);
          });
        } else {
          const result = executeLayoutOperation(request);
          if (result.status === "changed" || result.status === "noop" || result.status === "fallback") {
            layout = result.layout;
          }
          commitGeneratedLayout(layout);
        }
      } else {
        commitGeneratedLayout(layout);
      }
    }

    const margin = getIndentationValue(props.margin, newBreakpoint);
    const containerPadding = getIndentationValue(
      props.containerPadding,
      newBreakpoint
    );

    emit("widthChange", props.width, margin, newCols, containerPadding);
  };

  watch(
    () => pickResponsiveInputs(props),
    (nextProps, prevProps) => {
      if (
        nextProps.width != prevProps.width ||
        nextProps.breakpoint !== prevProps.breakpoint ||
        !deepEqual(nextProps.breakpoints, prevProps.breakpoints) ||
        !deepEqual(nextProps.cols, prevProps.cols)
      ) {
        onWidthChange(prevProps);
      }
    },
    { deep: true }
  );

  watch(
    () => props.layouts,
    (newLayouts) => {
      if (!deepEqual(newLayouts, state.layouts)) {
        const { breakpoint, cols } = state;

        const newLayout = findOrGenerateResponsiveLayout(
          newLayouts,
          props.breakpoints,
          breakpoint,
          breakpoint,
          cols,
          resolveCompactType(props)
        );

        state.layout = newLayout;
        state.layouts = {
          ...newLayouts,
          [breakpoint]: newLayout
        };
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    layoutExecutor.dispose?.();
  });

  return {
    onLayoutChange,
    state
  };
}
