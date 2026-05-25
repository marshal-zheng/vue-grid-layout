import { markRaw, reactive, watch, type VNode } from "vue";
import { deepEqual } from "fast-equals";
import {
  childrenEqual,
  cloneLayout,
  compactType,
  synchronizeLayoutWithChildren
} from "../utils";
import type {
  CompactType,
  DroppingPosition,
  Layout,
  LayoutItem
} from "../utils";
import type { ExternalDropSession } from "./externalDropSession";

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
  externalDropSession: ExternalDropSession | null,
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
  emitModelValue: (layout: Layout | undefined) => void;
  emitLayoutChange: (layout: Layout | undefined) => void;
};

export function useGridLayoutModel({
  props,
  emitModelValue,
  emitLayoutChange
}: UseGridLayoutModelOptions) {
  const state: GridLayoutState = reactive({
    activeDrag: null,
    layout: markRaw(cloneLayout(props.modelValue || [])),
    mounted: false,
    oldDragItem: null,
    oldLayout: null,
    oldResizeItem: null,
    resizing: false,
    droppingDOMNode: null,
    droppingPosition: undefined,
    externalDropSession: null,
    suppressLayoutChange: false,
    compactType: props.compactType,
    children: markRaw([])
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
      if (state.activeDrag || state.externalDropSession || state.droppingDOMNode || state.droppingPosition) return;

      const interactionOldLayout = state.oldLayout;
      if (interactionOldLayout) {
        state.oldLayout = null;
        onLayoutMaybeChanged(newLayout, interactionOldLayout);
        return;
      }

      onLayoutMaybeChanged(newLayout, oldLayout);
    }
  );

  const watchLayoutDependencies = (options: WatchLayoutDependenciesOptions = {}) => watch(
    () => ({
      compactType: props.compactType,
      modelValue: props.modelValue,
      verticalCompact: props.verticalCompact,
      cols: props.cols,
      allowOverlap: props.allowOverlap
    }),
    (nextProps, prevProps) => {
      const modelValueChanged = !deepEqual(nextProps.modelValue, lastObservedModelValue);
      const modelValueMatches = deepEqual(nextProps.modelValue, state.layout);
      const layoutPropsMatch =
        nextProps.compactType === prevProps.compactType &&
        nextProps.cols === prevProps.cols &&
        nextProps.allowOverlap === prevProps.allowOverlap &&
        nextProps.verticalCompact === prevProps.verticalCompact;

      if (!modelValueChanged && layoutPropsMatch) {
        return;
      }
      lastObservedModelValue = cloneLayout(nextProps.modelValue || []);

      if (modelValueMatches && layoutPropsMatch) {
        return;
      }

      const layout = synchronizeLayoutWithChildren(
        nextProps.modelValue,
        state.children,
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

  const syncRenderedChildren = (
    newChildren: VNode[],
    options: WatchLayoutDependenciesOptions = {}
  ): Layout => {
    if (childrenEqual(newChildren, state.children)) {
      return state.layout;
    }

    state.children = markRaw(newChildren);

    const stateLayoutIds = new Set(state.layout.map(item => item.i));
    const modelLayoutIds = new Set((props.modelValue || []).map(item => item.i));
    const hasNewChildInModel = newChildren.some(child =>
      child?.key != null &&
      !stateLayoutIds.has(String(child.key)) &&
      modelLayoutIds.has(String(child.key))
    );
    const sourceLayout = hasNewChildInModel
      ? props.modelValue
      : state.layout;
    const layout = synchronizeLayoutWithChildren(
      sourceLayout,
      newChildren,
      props.cols,
      compactType(props),
      props.allowOverlap
    );

    const reconcileResult = options.reconcileSynchronizedLayout?.(layout);
    if (reconcileResult?.clearActive) {
      state.activeDrag = null;
      options.clearActiveInteraction?.();
    } else if (reconcileResult && "placeholder" in reconcileResult) {
      state.activeDrag = reconcileResult.placeholder ? markRaw(reconcileResult.placeholder) : null;
    }

    if (!deepEqual(layout, state.layout)) {
      state.layout = markRaw(layout);
    }
    state.compactType = props.compactType;
    return layout;
  };

  return {
    state,
    onLayoutMaybeChanged,
    syncRenderedChildren,
    watchLayoutDependencies,
    stop: () => undefined
  };
}
