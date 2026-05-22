import { defineComponent, VNode, onMounted, onBeforeUnmount, h, Fragment, markRaw, toRef, getCurrentInstance, computed, ref, watch, type ComponentObjectPropsOptions, type Ref } from 'vue'
import clsx from "clsx";
import {
  noop,
  getNonFragmentChildren
} from "../utils";
import GridItem from "../GridItem";
import type { Props as GridLayoutProps } from "../VueGridLayoutPropTypes";
import type {
  Layout,
  LayoutItem
} from "../utils";
import { Kv } from '../type'
import {
  createGridLayoutEventBridge,
  gridLayoutEmits,
  splitGridRootAttrs
} from "./contract";
import { useGridLayoutModel } from "./useGridLayoutModel";
import { useGridLayoutEngineBridge } from "./useGridLayoutEngineBridge";
import { useGridFrameUpdate } from "./useGridFrameUpdate";
import { useGridAutoScroll } from "./useGridAutoScroll";
import { useGridInteractions } from "./useGridInteractions";
import {
  resolveGridHeightRuntime,
  useContainerHeightMeasurement
} from "../grid-height";
import {
  createNoopGridLayoutRuntimeExtension
} from "./noopRuntimeExtension";
import type {
  GridLayoutRuntimeExtension,
  GridLayoutRuntimeExtensionContext
} from "./runtimeExtension";

// Utility class names
const layoutClassName = "vue-grid-layout";
const isFirefox =
  typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent);

type GridLayoutComponentOptions = {
  name: string;
  props: ComponentObjectPropsOptions;
  createRuntimeExtension?: (context: GridLayoutRuntimeExtensionContext) => GridLayoutRuntimeExtension;
};

export const createGridLayoutComponent = ({
  name,
  props: propsDefinition,
  createRuntimeExtension = createNoopGridLayoutRuntimeExtension
}: GridLayoutComponentOptions) => defineComponent({
  name,
  inheritAttrs: false,
  props: propsDefinition,
  emits: gridLayoutEmits,
  setup(props, { slots, attrs, emit }) {
    const gridProps = props as unknown as GridLayoutProps;
    const eventBridge = createGridLayoutEventBridge(emit, getCurrentInstance());
    const model = useGridLayoutModel({
      props: gridProps,
      slots,
      emitModelValue: layout => eventBridge.emitModelValue(layout),
      emitLayoutChange: layout => eventBridge.emitLayoutChange(layout)
    });
    const { state, onLayoutMaybeChanged } = model;
    const rootRef = ref<HTMLElement | null>(null);
    const measuredContainer = useContainerHeightMeasurement({
      enabled: () => gridProps.autoMeasureContainerHeight === true,
      rootRef
    });
    const heightRuntime = computed(() => resolveGridHeightRuntime({
      layout: state.layout,
      autoSize: gridProps.autoSize,
      heightMode: gridProps.heightMode,
      rowHeight: gridProps.rowHeight,
      minRowHeight: gridProps.minRowHeight,
      margin: gridProps.margin,
      containerPadding: gridProps.containerPadding || gridProps.margin,
      containerHeight: gridProps.containerHeight,
      measuredContainerHeight: measuredContainer.measuredContainerHeight.value,
      measurementDiagnostics: measuredContainer.diagnostics.value,
      autoMeasureContainerHeight: gridProps.autoMeasureContainerHeight,
      renderPrecision: gridProps.renderPrecision,
      context: { source: "grid" }
    }));
    const resolvedRuntimeProps = new Proxy(gridProps, {
      get(target, key) {
        if (key === "rowHeight") return heightRuntime.value.rowHeight;
        return target[key as keyof typeof target];
      }
    });
    const engineBridge = useGridLayoutEngineBridge({
      props: gridProps,
      getLayout: () => state.layout
    });

    const interactionState = {
      current: null as ReturnType<typeof useGridInteractions> | null
    };
    const runtimeExtension = createRuntimeExtension({
      props: resolvedRuntimeProps,
      layoutRef: toRef(state, 'layout') as Ref<Layout>,
      engineBridge,
      getLayout: () => state.layout,
      getOldDragItem: () => state.oldDragItem,
      getOldResizeItem: () => state.oldResizeItem,
      isDropping: () => Boolean(state.droppingDOMNode),
      getInteractionState: () => interactionState.current
        ? {
            activeDragId: interactionState.current.activeDragId.value,
            activeResizeId: interactionState.current.activeResizeId.value,
            dragBlocked: interactionState.current.dragBlocked.value,
            dragBlockedReason: interactionState.current.dragBlockedReason.value,
            dragBlockedItemIds: interactionState.current.dragBlockedItemIds.value,
            dragBlockedMessage: interactionState.current.dragBlockedMessage.value,
            resizeBlocked: interactionState.current.resizeBlocked.value
        }
        : null
    });
    const interactionHooks = runtimeExtension.interactions;

    let interactionRequestSeq = 0;

    const nextInteractionRequestId = (kind: string, itemId: string) =>
      `${kind}:${itemId}:${++interactionRequestSeq}`;

    const frameUpdate = useGridFrameUpdate({
      getLayout: () => state.layout,
      setLayout: layout => {
        state.layout = markRaw(layout);
      },
      setActiveDrag: item => {
        state.activeDrag = markRaw(item);
      }
    });
    const autoScroll = useGridAutoScroll({
      getConfig: () => gridProps.autoScroll,
      rootClassName: layoutClassName
    });

    const interactions = useGridInteractions({
      props: resolvedRuntimeProps,
      state,
      eventBridge,
      engineBridge,
      frameUpdate,
      autoScroll,
      editor: interactionHooks,
      isFirefox,
      layoutClassName,
      nextInteractionRequestId,
      syncHistory: runtimeExtension.syncHistory || noop,
      onLayoutMaybeChanged
    });
    interactionState.current = interactions;

    model.watchLayoutDependencies({
      reconcileSynchronizedLayout: layout => {
        if (!engineBridge.isLegacyLayoutEngine() && (interactions.activeDragId.value || interactions.activeResizeId.value)) {
          const rebased = engineBridge.rebase(layout);
          if (!rebased) {
            return { clearActive: true };
          }
          if (rebased.placeholder) {
            return { placeholder: rebased.placeholder };
          }
        } else if (!engineBridge.isLegacyLayoutEngine()) {
          engineBridge.reset(layout);
        }
        return undefined;
      },
      clearActiveInteraction: () => interactions.clearActiveInteraction()
    });

    onBeforeUnmount(() => {
      frameUpdate.cancel();
      autoScroll.reset();
      engineBridge.dispose("component unmounted");
      model.stop();
      runtimeExtension.stop?.();
      measuredContainer.stop();
    });

    let lastHeightRuntimeSignature = "";
    const emitHeightRuntimeChange = () => {
      const runtime = heightRuntime.value;
      const signature = JSON.stringify(runtime);
      if (signature === lastHeightRuntimeSignature) return;
      lastHeightRuntimeSignature = signature;
      eventBridge.emitHeightRuntimeChange(runtime);
    };

    watch(
      heightRuntime,
      () => {
        if (state.mounted) emitHeightRuntimeChange();
      },
      { deep: true }
    );

    // Set the component to mounted state
    onMounted(() => {
      state.mounted = true;
      runtimeExtension.mount?.();
      emitHeightRuntimeChange();
    });

    // Create a placeholder element
    const placeholder = (): VNode | null => {
      const { activeDrag } = state;
      if (!activeDrag) return null;
      const { width = 0, cols, margin, containerPadding, maxRows, useCSSTransforms, transformScale } = gridProps;
      const runtime = heightRuntime.value;

      return (
        <GridItem
          w={activeDrag.w}
          h={activeDrag.h}
          x={activeDrag.x}
          y={activeDrag.y}
          i={activeDrag.i}
          class={clsx("vue-grid-placeholder", {
            "placeholder-resizing": state.resizing,
            "placeholder-blocked": interactions.dragBlocked.value || interactions.resizeBlocked.value
          })}
          containerWidth={width}
          cols={cols}
          margin={margin}
          containerPadding={containerPadding || margin}
          maxRows={maxRows}
          rowHeight={runtime.rowHeight}
          dragActivationDistance={gridProps.dragActivationDistance}
          renderPrecision={runtime.renderPrecision}
          isDraggable={false}
          isResizable={false}
          isBounded={false}
          useCSSTransforms={useCSSTransforms}
          transformScale={transformScale}
        >
          <div />
        </GridItem>
      );
    };

    const layoutItemById = new Map<string, LayoutItem>();

    // Process each grid item child
    const processGridItem = (
      child: VNode,
      layoutItemById: Map<string, LayoutItem>,
      isDroppingItem?: boolean
    ): VNode | null => {
      if (!child || !child.key) return null;
      const l = layoutItemById.get(String(child.key));
      if (!l) return null;

      const {
        width = 0,
        cols,
        margin,
        containerPadding,
        maxRows,
        isDraggable,
        isResizable,
        isBounded,
        useCSSTransforms,
        transformScale,
        draggableCancel,
        draggableHandle,
        resizeHandles,
        resizeHandle
      } = gridProps;
      const runtime = heightRuntime.value;

      const { mounted, droppingPosition } = state;

      const itemState = runtimeExtension.getItemRenderState(
        l,
        { isDraggable, isResizable, isBounded },
        isDroppingItem
      );
      if (!itemState.visible) return null;

      const renderItem = itemState.previewItem || l;
      const resizeHandlesOptions = typeof itemState.resizeHandles !== "undefined"
        ? itemState.resizeHandles
        : l.resizeHandles || resizeHandles;
      return (
        <GridItem
          key={l.i}
          containerWidth={width}
          cols={cols}
          margin={margin}
          containerPadding={containerPadding || margin}
          maxRows={maxRows}
          rowHeight={runtime.rowHeight}
          dragActivationDistance={gridProps.dragActivationDistance}
          renderPrecision={runtime.renderPrecision}
          cancel={draggableCancel}
          handle={draggableHandle}
          onDragStop={interactions.onDragStop}
          onDragStart={interactions.onDragStart}
          onDrag={interactions.onDrag}
          onResizeStart={interactions.onResizeStart}
          onResize={interactions.onResize}
          onResizeStop={interactions.onResizeStop}
          isDraggable={itemState.draggable}
          isResizable={itemState.resizable}
          isBounded={itemState.bounded}
          isDragBlocked={interactions.dragBlocked.value && interactions.activeDragId.value === l.i}
          isResizeBlocked={interactions.resizeBlocked.value && interactions.activeResizeId.value === l.i}
          useCSSTransforms={useCSSTransforms && mounted}
          usePercentages={!mounted}
          transformScale={transformScale}
          w={renderItem.w}
          h={renderItem.h}
          x={renderItem.x}
          y={renderItem.y}
          i={renderItem.i}
          minH={renderItem.minH}
          minW={renderItem.minW}
          maxH={renderItem.maxH}
          maxW={renderItem.maxW}
          static={renderItem.static}
          class={itemState.className}
          onItemClick={itemState.onClick}
          droppingPosition={isDroppingItem && gridProps.dropStrategy !== 'auto' ? droppingPosition : undefined}
          resizeHandles={resizeHandlesOptions}
          resizeHandle={resizeHandle}
        >
          {child}
        </GridItem>
      );
    };

    return () => {
      const { class: className, style, isDroppable, innerRef } = gridProps;
      const runtime = heightRuntime.value;
      const rootAttrs = splitGridRootAttrs(attrs);
      const dropEnabled = runtimeExtension.isExternalDropEnabled(isDroppable);
      const mergedClassName = clsx(
        layoutClassName,
        rootAttrs.class as Parameters<typeof clsx>[number],
        className,
        runtimeExtension.getRootClassNames() as Parameters<typeof clsx>[number]
      );
      const mergedStyle: Kv = {
        ...(rootAttrs.style && typeof rootAttrs.style === "object" && !Array.isArray(rootAttrs.style) ? rootAttrs.style as Kv : {}),
        height: runtime.containerStyle.height,
        ...(runtime.containerStyle.overflow ? { overflow: runtime.containerStyle.overflow } : {}),
        ...style
      };

      const children: VNode[] = slots.default ? getNonFragmentChildren(h(Fragment, null, slots.default())) : [];
      layoutItemById.clear();
      for (let i = 0; i < state.layout.length; i++) {
        const item = state.layout[i];
        layoutItemById.set(item.i, item);
      }
      const overlayGeometry = {
        width: gridProps.width || 0,
        margin: gridProps.margin,
        containerPadding: gridProps.containerPadding || gridProps.margin,
        rowHeight: runtime.rowHeight,
        renderPrecision: runtime.renderPrecision,
        cols: gridProps.cols,
        maxRows: gridProps.maxRows
      };
      const setRootRef = (element: HTMLElement | null) => {
        rootRef.value = element;
        if (innerRef && typeof innerRef === "object" && "value" in innerRef) {
          (innerRef as unknown as Ref<HTMLElement | null>).value = element;
        }
      };

      return (
        <div
          {...rootAttrs.attrs}
          ref={setRootRef}
          class={mergedClassName}
          style={mergedStyle}
          onMousemove={runtimeExtension.onRootPointerMove}
          onClick={runtimeExtension.onRootClick}
          onDrop={dropEnabled ? interactions.onDrop : noop}
          onDragleave={dropEnabled ? interactions.onDragLeave : noop}
          onDragenter={dropEnabled ? interactions.onDragEnter : noop}
          onDragover={dropEnabled ? interactions.onDragOver : noop}
        >
          {children.map(child => processGridItem(child, layoutItemById))}
          {dropEnabled &&
            state.droppingDOMNode &&
            processGridItem(state.droppingDOMNode, layoutItemById, true)}
          {placeholder()}
          {runtimeExtension.renderOverlay({
            geometry: overlayGeometry,
            itemMap: layoutItemById,
            layout: state.layout
          })}
        </div>
      );
    };
  }
});
