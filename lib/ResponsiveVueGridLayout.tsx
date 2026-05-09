import { defineComponent, PropType, reactive, watch, Fragment, VNode, onMounted, onBeforeUnmount, toRef, markRaw, nextTick, type Ref } from 'vue'
import { deepEqual } from "fast-equals";
import { pick } from 'lodash'

import {
  cloneLayout,
  compactType as resolveCompactType,
  synchronizeLayoutWithChildren,
  CompactType,
  Layout,
  getNonFragmentChildren
} from "./utils";
import {
  getBreakpointFromWidth,
  getColsFromBreakpoint,
  findOrGenerateResponsiveLayout,
  ResponsiveLayout,
  Breakpoints
} from "./responsiveUtils";
import VueGridLayout from "./VueGridLayout";
import {
  cloneLayoutsMap,
  useGridLayoutPersistence,
  type LayoutPersistenceEvent,
  type ResponsiveGridLayoutPersistenceProp
} from "./persistence";
import {
  createLayoutExecutor,
  executeLayoutOperation
} from "./layout-engine";
import type {
  GridLayoutEngineOptions,
  GridLayoutEngineProp
} from "./layout-engine";

/**
 * Get a value of margin or containerPadding.
 *
 * @param  {Array | Object} param Margin | containerPadding, e.g. [10, 10] | {lg: [10, 10], ...}.
 * @param  {String} breakpoint   Breakpoint: lg, md, sm, xs and etc.
 * @return {Array}
 */
function getIndentationValue<T extends Array<number> | null>(
  param: { [key: string]: T } | T,
  breakpoint: string
): T | null {
  if (param == null) return null;
  return Array.isArray(param) ? param : param[breakpoint];
}

type State = {
  layout: Layout,
  breakpoint: string,
  cols: number,
  layouts: LayoutsMap
};

export interface Props<Breakpoint extends string = string> {
  // Responsive config
  breakpoint?: Breakpoint | null;
  breakpoints: Breakpoints<Breakpoint>;
  cols: Record<Breakpoint, number>;
  layouts: {
    type: ResponsiveLayout<Breakpoint>,
    default: () => (null)
  };
  width: number;
  margin: {
    type: Record<Breakpoint, [number, number]> | [number, number],
    default: [10, 10]
  };
  containerPadding: Record<Breakpoint, [number, number] | null> | [number, number] | null;
  persistence?: ResponsiveGridLayoutPersistenceProp;
  layoutEngine?: false | GridLayoutEngineProp;
}

interface BreakpointMap {
  [key: string]: number; // For breakpoints and cols
}

interface MarginPaddingMap {
  [key: string]: [number, number]; // For margin and containerPadding
}

interface LayoutsMap {
  [key: string]: Layout;
}

const ResponsiveVueGridLayout = defineComponent({
  props: {
    /** Force current breakpoint key (optional, usually auto-calculated) */
    breakpoint: { type: String, default: '' },
    /** Breakpoint to pixel width mapping, e.g. { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } */
    breakpoints: {
      type: Object as () => BreakpointMap,
      default: () => ({ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }),
    },
    /** Allow grid items to overlap */
    allowOverlap: { type: Boolean, default: false },
    /** Vertical compact layout (deprecated) */
    verticalCompact: { type: Boolean, default: true },
    /** Breakpoint to column count mapping, e.g. { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } */
    cols: {
      type: Object as () => BreakpointMap,
      default: () => ({ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }),
    },
    /** Breakpoint to spacing mapping or universal [x, y], e.g. { lg: [10, 10] } or [10, 10] */
    margin: {
      type: [Array, Object] as  PropType<MarginPaddingMap | [number, number]>,
      default: () => ([10, 10])
    },
    /** Breakpoint to container padding mapping or universal value */
    containerPadding: {
      type: [Array, Object] as PropType<MarginPaddingMap | [number, number]>,
      default: () => ({ lg: null, md: null, sm: null, xs: null, xxs: null })
    },
    /** Layout collection for each breakpoint, e.g. { lg: Layout[], md: Layout[] } */
    layouts: {
      type: Object as PropType<LayoutsMap>,
      default: () => ({}),
    },
    /** Component width (required, usually auto-provided by WidthProvider) */
    width: {
      type: Number,
      required: true,
    },
    /** Compaction direction: vertical / horizontal / null */
    compactType: {
      type: String as PropType<CompactType>,
      default: "vertical",
      validator: (value: CompactType) => value == null || ['vertical', 'horizontal'].includes(value),
    },
    /** Durable save/load persistence configuration for all breakpoint layouts */
    persistence: {
      type: [Boolean, Object] as PropType<ResponsiveGridLayoutPersistenceProp>,
      default: false
    },
    /** Layout engine configuration for responsive heavy operations and the inner grid */
    layoutEngine: {
      type: [Boolean, Object] as PropType<false | GridLayoutEngineProp>,
      default: undefined
    },
  },
  emits: ['update:layouts', 'layoutChange', 'breakpointChange', 'widthChange'],
  setup(props, { slots, emit }) {
    const generateInitialState = (): State => {
      const { width, breakpoints, layouts, cols } = props;
      const breakpoint = props.breakpoint || getBreakpointFromWidth(breakpoints, width);
      const colNo = getColsFromBreakpoint(breakpoint, cols);
      // verticalCompact compatibility, now deprecated

      const compactType = resolveCompactType(props);
      // Get the initial layout. This can tricky; we try to generate one however possible if one doesn't exist
      // for this layout.
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
        breakpoint: breakpoint,
        cols: colNo,
        layouts: {
          ...layouts,
          [breakpoint]: initialLayout
        }
      };
    }

    const state = reactive(generateInitialState());
    let restoringPersistence = false;

    const applyRestoredLayouts = (layouts: LayoutsMap) => {
      restoringPersistence = true;
      const restoredLayouts = cloneLayoutsMap(layouts);
      const layout = findOrGenerateResponsiveLayout(
        restoredLayouts,
        props.breakpoints,
        state.breakpoint,
        state.breakpoint,
        state.cols,
        resolveCompactType(props)
      );
      const nextLayouts = {
        ...restoredLayouts,
        [state.breakpoint]: layout
      };
      state.layout = markRaw(layout);
      state.layouts = nextLayouts;
      emit('update:layouts', nextLayouts)
      emit('layoutChange', layout, nextLayouts)
      void nextTick().then(() => {
        restoringPersistence = false;
      });
    };

    const persistenceConfig = props.persistence && typeof props.persistence === 'object'
      ? props.persistence
      : null;

    const onPersistenceEvent = (event: LayoutPersistenceEvent<LayoutsMap>) => {
      if (event.type === 'external-apply') {
        applyRestoredLayouts(event.value);
      }
      persistenceConfig?.onEvent?.(event);
    };

    const persistenceController = persistenceConfig
      ? useGridLayoutPersistence<LayoutsMap>({
          ...persistenceConfig,
          onEvent: onPersistenceEvent,
          kind: 'responsive',
          target: toRef(state, 'layouts') as Ref<LayoutsMap>,
          watchTarget: false
        })
      : null;

    const onLayoutChange = (layout: Layout) => {
      if (restoringPersistence) return;
      const nextLayout = cloneLayout(layout);
      const newLayouts = {
        ...state.layouts,
        [state.breakpoint]: nextLayout
      }
      state.layout = nextLayout;
      state.layouts = newLayouts;
      emit('update:layouts', newLayouts)
      emit('layoutChange', nextLayout, newLayouts)
      persistenceController?.commit(cloneLayoutsMap(newLayouts), { source: 'component' })
    };

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

    watch(
      () => pick(props, ['width', 'breakpoint', 'breakpoints', 'cols']),
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

    /**
   * When the width changes work through breakpoints and reset state with the new width & breakpoint.
   * Width changes are necessary to figure out the widget widths.
   */
    const onWidthChange = (prevProps) => {
      const { breakpoints, cols } = props;
      const compactType = resolveCompactType(props);
      const newBreakpoint =
        props.breakpoint ||
        getBreakpointFromWidth(props.breakpoints, props.width);

      const lastBreakpoint = state.breakpoint;
      const newCols: number = getColsFromBreakpoint(newBreakpoint, cols);
      const newLayouts = { ...state.layouts };

      // Breakpoint change
      if (
        lastBreakpoint !== newBreakpoint ||
        prevProps.breakpoints !== breakpoints ||
        prevProps.cols !== cols
      ) {
        // Preserve the current breakpoint before generating the next one.
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

          emit('breakpointChange', newBreakpoint, newCols)
          emit('update:layouts', newLayouts)
          emit('layoutChange', layout, newLayouts)
          persistenceController?.commit(cloneLayoutsMap(newLayouts), { source: 'component' })

          state.breakpoint = newBreakpoint;
          state.layout = layout
          state.cols = newCols
          state.layouts = newLayouts
        };

        // Find or generate a new layout. This remains the synchronous fallback for
        // legacy mode and for environments where an async executor is unavailable.
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
            phase: 'commit',
            layout: newLayouts[lastBreakpoint] || state.layout,
            operation: {
              type: 'generateResponsiveLayout',
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
              if (result.status === 'changed' || result.status === 'noop' || result.status === 'fallback') {
                commitGeneratedLayout(result.layout);
              } else {
                commitGeneratedLayout(layout);
              }
            }).catch(() => {
              commitGeneratedLayout(layout);
            });
          } else {
            const result = executeLayoutOperation(request);
            if (result.status === 'changed' || result.status === 'noop' || result.status === 'fallback') {
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

      emit('widthChange', props.width, margin, newCols, containerPadding )
    }

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
          if (!restoringPersistence) {
            persistenceController?.commit(cloneLayoutsMap(state.layouts), { source: 'programmatic' })
          }
        }
      },
      { immediate: true }
    );

    onMounted(() => {
      if (!persistenceController) return;
      restoringPersistence = true;
      void persistenceController.load().then(async result => {
        if (result.value && (result.ok || result.fallbackApplied)) {
          applyRestoredLayouts(result.value)
        }
        await nextTick();
        restoringPersistence = false;
      }).catch(async () => {
        await nextTick();
        restoringPersistence = false;
      });
    });

    onBeforeUnmount(() => {
      layoutExecutor.dispose?.();
      persistenceController?.stop();
    });

    return () => {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        breakpoint,
        breakpoints,
        cols,
        layouts,
        margin,
        containerPadding,
        persistence,
        layoutEngine,
        ...other
      } = props;
      /* eslint-disable @typescript-eslint/no-unused-vars */

      const child = slots.default ? slots.default() : null;
      return (
        <VueGridLayout
          {...other}
          margin={getIndentationValue(margin, state.breakpoint) || [10, 10]}
          containerPadding={getIndentationValue(
            containerPadding,
            state.breakpoint
          ) || [0, 0]}
          onLayoutChange={onLayoutChange}
          modelValue={state.layout}
          cols={state.cols}
          layoutEngine={layoutEngine}
        >{child}</VueGridLayout>
      );
    }
  }
})

export default ResponsiveVueGridLayout
