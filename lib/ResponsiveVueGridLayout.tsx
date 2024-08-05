import { defineComponent, PropType, reactive, watch, Fragment, VNode } from 'vue'
import { deepEqual } from "fast-equals";
import { pick } from 'lodash'

import {
  cloneLayout,
  synchronizeLayoutWithChildren,
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

import { isEmpty } from 'lodash'

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
  layouts?: ResponsiveLayout<string>
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
    // Optional, but if you are managing width yourself you may want to set the breakpoint
    // yourself as well.
    breakpoint: { type: String, default: '' },

    // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
    breakpoints: {
      type: Object as () => BreakpointMap,
      default: () => ({ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }),
    },

    allowOverlap: { type: Boolean, default: false },

    verticalCompact: { type: Boolean, default: true },

    // # of cols. This is a breakpoint -> cols map
    cols: {
      type: Object as () => BreakpointMap,
      default: () => ({ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }),
    },

    // # of margin. This is a breakpoint -> margin map
    // e.g. { lg: [5, 5], md: [10, 10], sm: [15, 15] }
    // Margin between items [x, y] in px
    // e.g. [10, 10]
    margin: {
      type: [Array, Object] as  PropType<MarginPaddingMap | [number, number]>,
      default: () => ([10, 10])
    },

    // # of containerPadding. This is a breakpoint -> containerPadding map
    // e.g. { lg: [5, 5], md: [10, 10], sm: [15, 15] }
    // Padding inside the container [x, y] in px
    // e.g. [10, 10]
    containerPadding: {
      type: [Array, Object] as PropType<MarginPaddingMap | [number, number]>,
      default: () => ({ lg: null, md: null, sm: null, xs: null, xxs: null })
    },

    // layouts is an object mapping breakpoints to layouts.
    // e.g. {lg: Layout, md: Layout, ...}
    layouts: {
      type: Object as PropType<LayoutsMap>,
      default: () => ({}),
    },

    // The width of this component.
    // Required in this propTypes stanza because generateInitialState() will fail without it.
    width: {
      type: Number,
      required: true,
    },

    // Choose vertical or hotizontal compaction
    compactType: {
      type: String as PropType<"vertical" | "horizontal">,
      default: "vertical"
    },
    // layoutChange: {
    //   type: Function as PropType<OnLayoutChangeCallback>,
    //   default: noop
    // },
    // breakpointChange: {
    //   type: Function as PropType<(breakpoint: string, cols: number) => void>,
    //   default: noop
    // },
  },
  setup(props, { slots, emit }) {
    const generateInitialState = (): State => {
      const { width, breakpoints, layouts, cols } = props;
      const breakpoint = getBreakpointFromWidth(breakpoints, width);
      const colNo = getColsFromBreakpoint(breakpoint, cols);
      // verticalCompact compatibility, now deprecated

      
      const compactType = !isEmpty(props.verticalCompact) ? props.compactType: null;
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
        cols: colNo
      };
    }

    const state = reactive(generateInitialState());

    const onLayoutChange = (layout: Layout) => {
      const newLayouts = {
        ...props.layouts,
        [state.breakpoint]: layout
      }
      emit('layoutChange', layout, newLayouts || [])
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
      const { breakpoints, cols, layouts, compactType } = props;
      const newBreakpoint =
        props.breakpoint ||
        getBreakpointFromWidth(props.breakpoints, props.width);

      const lastBreakpoint = state.breakpoint;
      const newCols: number = getColsFromBreakpoint(newBreakpoint, cols);
      const newLayouts = { ...layouts };

      // Breakpoint change
      if (
        lastBreakpoint !== newBreakpoint ||
        prevProps.breakpoints !== breakpoints ||
        prevProps.cols !== cols
      ) {
        // Preserve the current layout if the current breakpoint is not present in the next layouts.
        if (!(lastBreakpoint in newLayouts))
          newLayouts[lastBreakpoint] = cloneLayout(state.layout);

        // Find or generate a new layout.
        let layout = findOrGenerateResponsiveLayout(
          newLayouts,
          breakpoints,
          newBreakpoint,
          lastBreakpoint,
          newCols,
          compactType
        );

        const children: VNode[] = slots.default ? getNonFragmentChildren({ type: Fragment, children: slots.default() } as VNode) : [];

        // This adds missing items.
        layout = synchronizeLayoutWithChildren(
          layout,
          children,
          newCols,
          compactType,
          props.allowOverlap
        );

        // Store the new layout.
        newLayouts[newBreakpoint] = layout;

        emit('breakpointChange', newBreakpoint, newCols)
        emit('layoutChange', layout, newLayouts || [])

        state.breakpoint = newBreakpoint;
        state.layout = layout
        state.cols = newCols
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
            props.compactType
          );

          state.layout = newLayout;
          state.layouts = newLayouts;
        }
      },
      { immediate: true }
    );

    return () => {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        breakpoint,
        breakpoints,
        cols,
        layouts,
        margin,
        containerPadding,
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
        >{child}</VueGridLayout>
      );
    }
  }
})

export default ResponsiveVueGridLayout