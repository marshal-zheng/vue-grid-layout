import { defineComponent, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue";
import ResponsiveVueGridLayout, { responsiveGridLayoutProps } from "../ResponsiveVueGridLayout";
import {
  cloneResponsiveLayoutsMap,
  type LayoutsMap
} from "../responsive/useResponsiveGridLayoutModel";
import {
  useGridLayoutPersistence,
  type LayoutPersistenceEvent,
  type ResponsiveGridLayoutPersistenceProp
} from "../persistence";

const PersistentResponsiveGridLayout = defineComponent({
  name: "PersistentResponsiveGridLayout",
  inheritAttrs: false,
  props: {
    ...responsiveGridLayoutProps,
    persistence: {
      type: Object as PropType<Exclude<ResponsiveGridLayoutPersistenceProp, false>>,
      required: true
    }
  },
  emits: ["update:layouts", "layoutChange", "breakpointChange", "widthChange"],
  setup(props, { attrs, slots, emit }) {
    const layouts = ref<LayoutsMap>(cloneResponsiveLayoutsMap(props.layouts || {}));
    let applyingPersistence = false;

    const applyLayouts = (nextLayouts: LayoutsMap, currentLayout?: unknown) => {
      applyingPersistence = true;
      const cloned = cloneResponsiveLayoutsMap(nextLayouts);
      layouts.value = cloned;
      emit("update:layouts", cloned);
      if (currentLayout) emit("layoutChange", currentLayout, cloned);
      queueMicrotask(() => {
        applyingPersistence = false;
      });
    };

    const config = props.persistence;
    const controller = useGridLayoutPersistence<LayoutsMap>({
      ...config,
      kind: "responsive",
      target: layouts,
      watchTarget: false,
      onEvent: (event: LayoutPersistenceEvent<LayoutsMap>) => {
        if (event.type === "external-apply") applyLayouts(event.value);
        config.onEvent?.(event);
      }
    });

    watch(
      () => props.layouts,
      next => {
        if (!applyingPersistence && next && !Object.is(next, layouts.value)) {
          layouts.value = cloneResponsiveLayoutsMap(next);
        }
      },
      { deep: true }
    );

    onMounted(() => {
      void controller.load().then(result => {
        if (result.value && (result.ok || result.fallbackApplied)) {
          applyLayouts(result.value);
        }
      });
    });

    onBeforeUnmount(() => {
      controller.stop();
    });

    const onLayoutChange = (layout: unknown, nextLayouts: LayoutsMap) => {
      if (applyingPersistence) return;
      const cloned = cloneResponsiveLayoutsMap(nextLayouts);
      layouts.value = cloned;
      emit("update:layouts", cloned);
      emit("layoutChange", layout, cloned);
      controller.commit(cloned, { source: "component" });
    };

    return () => {
      const {
        persistence,
        layouts: _layouts,
        ...responsiveProps
      } = props;

      void persistence;
      void _layouts;

      return (
        <ResponsiveVueGridLayout
          {...attrs}
          {...responsiveProps}
          layouts={layouts.value}
          onLayoutChange={onLayoutChange}
          onBreakpointChange={(...args: unknown[]) => emit("breakpointChange", ...args)}
          onWidthChange={(...args: unknown[]) => emit("widthChange", ...args)}
        >
          {slots.default?.()}
        </ResponsiveVueGridLayout>
      );
    };
  }
});

export default PersistentResponsiveGridLayout;
