import { Fragment, computed, h, markRaw, nextTick, reactive, toRef, watch, type Ref, type VNode } from "vue";
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
import type { GridHistoryStore } from "../history";
import {
  useGridLayoutPersistence,
  type GridLayoutPersistenceProp,
  type LayoutPersistenceEvent
} from "../persistence";

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
  historyStore?: GridHistoryStore;
  persistence?: GridLayoutPersistenceProp;
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
  let restoringPersistence = false;

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
    compactType: props.compactType,
    children: []
  });

  const syncHistory = (layout: Layout, mode: 'push' | 'replace' = 'push') => {
    const store = props.historyStore;
    if (!store) return;
    if (mode === 'replace') {
      store.replacePresent(layout);
    } else {
      store.push(layout);
    }
  };

  syncHistory(state.layout, 'replace');

  const persistenceConfig = props.persistence && typeof props.persistence === 'object'
    ? props.persistence
    : null;

  const applyPersistedLayout = (layout: Layout) => {
    restoringPersistence = true;
    const restoredLayout = cloneLayout(layout);
    state.layout = markRaw(restoredLayout);
    syncHistory(restoredLayout, 'replace');
    emitModelValue(restoredLayout);
    emitLayoutChange(restoredLayout);
    void nextTick().then(() => {
      restoringPersistence = false;
    });
  };

  const onPersistenceEvent = (event: LayoutPersistenceEvent<Layout>) => {
    if (event.type === 'external-apply') {
      applyPersistedLayout(event.value);
    }
    persistenceConfig?.onEvent?.(event);
  };

  const persistenceController = persistenceConfig
    ? useGridLayoutPersistence<Layout>({
        ...persistenceConfig,
        onEvent: onPersistenceEvent,
        kind: 'layout',
        target: toRef(state, 'layout') as Ref<Layout>,
        watchTarget: false
      })
    : null;

  watch(
    () => props.historyStore,
    next => {
      if (next) {
        next.replacePresent(state.layout);
      }
    }
  );

  const onLayoutMaybeChanged = (
    newLayout: Layout,
    oldLayout?: Layout | null,
    historyMode: 'push' | 'replace' = 'push'
  ) => {
    if (restoringPersistence) return;
    if (!oldLayout) oldLayout = state.layout;
    if (!deepEqual(oldLayout, newLayout)) {
      syncHistory(newLayout, historyMode);
      emitLayoutChange(newLayout);
      emitModelValue(newLayout);
      persistenceController?.commit(cloneLayout(newLayout), {
        source: historyMode === 'push' ? 'component' : 'programmatic'
      });
    }
  };

  watch(
    () => state.layout,
    (newLayout, oldLayout) => {
      if (state.activeDrag) return;

      const interactionOldLayout = state.oldLayout;
      if (interactionOldLayout) {
        state.oldLayout = null;
        onLayoutMaybeChanged(newLayout, interactionOldLayout, 'push');
        return;
      }

      onLayoutMaybeChanged(newLayout, oldLayout, 'replace');
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
      const modelValueMatches = deepEqual(nextProps.modelValue, state.layout);
      const compactTypeMatches = nextProps.compactType === prevProps.compactType;

      if (childrenEqual(newChildren, oldChildren) && modelValueMatches && compactTypeMatches) {
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

      onLayoutMaybeChanged(layout, state.layout, 'replace');
      state.layout = markRaw(layout);
      state.compactType = nextProps.compactType;
    },
    { deep: true }
  );

  const loadPersistedLayout = () => {
    if (!persistenceController) return Promise.resolve();
    restoringPersistence = true;
    return persistenceController.load().then(async result => {
      const restoredLayout = result.value && (result.ok || result.fallbackApplied)
        ? cloneLayout(result.value)
        : null;
      if (restoredLayout) {
        applyPersistedLayout(restoredLayout);
      }
      await nextTick();
      restoringPersistence = false;
    }).catch(async () => {
      await nextTick();
      restoringPersistence = false;
    });
  };

  const stop = () => {
    persistenceController?.stop();
  };

  return {
    state,
    persistenceController,
    syncHistory,
    onLayoutMaybeChanged,
    applyPersistedLayout,
    watchLayoutDependencies,
    loadPersistedLayout,
    stop
  };
}
