import { defineComponent, PropType } from 'vue'

import type { CompactType } from "./utils";
import {
  ResponsiveLayout,
  Breakpoints
} from "./responsiveUtils";
import VueGridLayout from "./VueGridLayout";
import type { ResponsiveGridLayoutPersistenceProp } from "./persistence";
import type { GridLayoutEngineProp } from "./layout-engine";
import type { GridEditorProp } from "./editor";
import type { GridDragActivationDistance } from "./interaction-state-machine";
import {
  getIndentationValue,
  useResponsiveGridLayoutModel,
  type BreakpointMap,
  type LayoutsMap,
  type MarginPaddingMap
} from "./responsive/useResponsiveGridLayoutModel";

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
  editor?: false | GridEditorProp;
  dragActivationDistance?: GridDragActivationDistance;
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
    /** Drag activation distance passed through to the inner grid. */
    dragActivationDistance: {
      type: [Number, Object] as PropType<GridDragActivationDistance>,
      default: undefined
    },
    /** Headless professional editor controller/options. Disabled by default. */
    editor: {
      type: [Boolean, Object] as PropType<false | GridEditorProp>,
      default: false
    },
  },
  emits: ['update:layouts', 'layoutChange', 'breakpointChange', 'widthChange'],
  setup(props, { slots, emit }) {
    const model = useResponsiveGridLayoutModel({
      props,
      slots,
      emit
    });
    const { state } = model;

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
        editor,
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
          onLayoutChange={model.onLayoutChange}
          modelValue={state.layout}
          cols={state.cols}
          layoutEngine={layoutEngine}
          editor={model.getInnerEditorProp()}
        >{child}</VueGridLayout>
      );
    }
  }
})

export default ResponsiveVueGridLayout
