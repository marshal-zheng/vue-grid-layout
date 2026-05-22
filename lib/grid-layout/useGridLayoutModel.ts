import { Fragment, computed, h, markRaw, reactive, watch, type VNode } from "vue";
import { deepEqual } from "fast-equals";
import {
  childrenEqual,
  cloneLayout,
  compactType,
  getNonFragmentChildren,
  synchronizeLayoutWithChildren
} from "../utils";
import type {
  CompactType,
  DroppingPosition,
  Layout,
  LayoutItem
} from "../utils";

export type GridLayoutState = {
  activeDrag: LayoutItem | null,
  layout: Layout,
  mounted: boolean,
  oldDragItem?: LayoutItem | null,
  oldLayout?: Layout | null,
  oldResizeItem?: LayoutItem | null,
  resizing: boolean,
  droppingDOMNode?: VNode | null,
  droppingPosition?: DroppingPosition,
  suppressLayoutChange?: boolean,
  compactType?: CompactType,
  children: VNode[]
};

type SynchronizedLayoutReconcileResult = {
  placeholder?: LayoutItem | null;
  clearActive?: boolean;
};

type WatchLayoutDependenciesOptions = {
  reconcileSynchronizedLayout?: (layout: Layout) => SynchronizedLayoutReconcileResult | void;
  clearActiveInteraction?: () => void;
};

type GridLayoutModelProps = {
  modelValue: Layout;
  cols: number;
  compactType: CompactType;
  verticalCompact: boolean;
  allowOverlap: boolean;
};

type UseGridLayoutModelOptions = {
  props: GridLayoutModelProps;
  slots: {
    default?: () => VNode[];
  };
  emitModelValue: (layout: Layout | undefined) => void;
  emitLayoutChange: (layout: Layout | undefined) => void;
};

export function useGridLayoutModel({
  props,
  slots,
  emitModelValue,
  emitLayoutChange
}: UseGridLayoutModelOptions) {
  const children: VNode[] = slots.default ? getNonFragmentChildren(h(Fragment, null, slots.default())) : [];

  const state: GridLayoutState = reactive({
    activeDrag: null,
    layout: markRaw(
      synchronizeLayoutWithChildren(
        props.modelValue,
        children,
        props.cols,
        compactType(props),
        props.allowOverlap,
        layout => {
          emitModelValue(layout);
          emitLayoutChange(layout);
        }
      )
    ),
    mounted: false,
    oldDragItem: null,
    oldLayout: null,
    oldResizeItem: null,
    resizing: false,
    droppingDOMNode: null,
    droppingPosition: undefined,
    suppressLayoutChange: false,
    compactType: props.compactType,
    children: []
  });

  let lastObservedModelValue = cloneLayout(props.modelValue || []);

  const onLayoutMaybeChanged = (
    newLayout: Layout,
    oldLayout?: Layout | null
  ) => {
    if (!oldLayout) oldLayout = state.layout;
    if (!deepEqual(oldLayout, newLayout)) {
      emitLayoutChange(newLayout);
      emitModelValue(newLayout);
    }
  };

  watch(
    () => state.layout,
    (newLayout, oldLayout) => {
      if (state.suppressLayoutChange) {
        state.suppressLayoutChange = false;
        return;
      }
      if (state.activeDrag || state.droppingDOMNode || state.droppingPosition) return;

      const interactionOldLayout = state.oldLayout;
      if (interactionOldLayout) {
        state.oldLayout = null;
        onLayoutMaybeChanged(newLayout, interactionOldLayout);
        return;
      }

      onLayoutMaybeChanged(newLayout, oldLayout);
    }
  );

  const layoutDependencies = computed(() => {
    const defaultSlot = slots.default ? slots.default() : [];
    const nonFragmentChildren = getNonFragmentChildren({ type: Fragment, children: defaultSlot } as VNode);
    const childrenSignature = nonFragmentChildren.map(c => {
      const gridProps = c.props?.["data-grid"];
      return {
        key: c.key,
        grid: gridProps ? {
          w: gridProps.w, h: gridProps.h, x: gridProps.x, y: gridProps.y
        } : null
      };
    });

    return {
      children: markRaw(nonFragmentChildren),
      props: {
        compactType: props.compactType,
        modelValue: props.modelValue,
        verticalCompact: props.verticalCompact,
        cols: props.cols,
        allowOverlap: props.allowOverlap
      },
      signature: childrenSignature
    };
  });

  const watchLayoutDependencies = (options: WatchLayoutDependenciesOptions = {}) => watch(
    layoutDependencies,
    ({ children: newChildren, props: nextProps }, { children: oldChildren, props: prevProps }) => {
      const childrenMatch = childrenEqual(newChildren, oldChildren);
      const modelValueChanged = !deepEqual(nextProps.modelValue, lastObservedModelValue);
      const modelValueMatches = deepEqual(nextProps.modelValue, state.layout);
      const layoutPropsMatch =
        nextProps.compactType === prevProps.compactType &&
        nextProps.cols === prevProps.cols &&
        nextProps.allowOverlap === prevProps.allowOverlap &&
        nextProps.verticalCompact === prevProps.verticalCompact;

      if (childrenMatch && !modelValueChanged && layoutPropsMatch) {
        return;
      }
      lastObservedModelValue = cloneLayout(nextProps.modelValue || []);

      if (childrenMatch && modelValueMatches && layoutPropsMatch) {
        return;
      }

      const layout = synchronizeLayoutWithChildren(
        nextProps.modelValue,
        newChildren,
        nextProps.cols,
        compactType(nextProps),
        nextProps.allowOverlap
      );

      const reconcileResult = options.reconcileSynchronizedLayout?.(layout);
      if (reconcileResult?.clearActive) {
        state.activeDrag = null;
        options.clearActiveInteraction?.();
      } else if (reconcileResult && "placeholder" in reconcileResult) {
        state.activeDrag = reconcileResult.placeholder ? markRaw(reconcileResult.placeholder) : null;
      }

      onLayoutMaybeChanged(layout, state.layout);
      state.layout = markRaw(layout);
      state.compactType = nextProps.compactType;
    },
    { deep: true }
  );

  return {
    state,
    onLayoutMaybeChanged,
    watchLayoutDependencies,
    stop: () => undefined
  };
}
