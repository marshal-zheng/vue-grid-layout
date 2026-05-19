import { defineComponent, VNode, onMounted, onBeforeUnmount, h, Fragment, markRaw, toRef, getCurrentInstance, type Ref } from 'vue'
import clsx from "clsx";
import {
  bottom,
  noop,
  getNonFragmentChildren
} from "./utils";
import GridItem from "./GridItem";
import { basicProps as gridLayoutProps } from "./VueGridLayoutPropTypes";
import type {
  Layout,
  LayoutItem
} from "./utils";
import { Kv } from './type'
import {
  createGridLayoutEventBridge,
  gridLayoutEmits,
  splitGridRootAttrs
} from "./grid-layout/contract";
import { useGridLayoutModel } from "./grid-layout/useGridLayoutModel";
import { useGridLayoutEngineBridge } from "./grid-layout/useGridLayoutEngineBridge";
import { useGridFrameUpdate } from "./grid-layout/useGridFrameUpdate";
import { useGridAutoScroll } from "./grid-layout/useGridAutoScroll";
import { useGridInteractions } from "./grid-layout/useGridInteractions";
import { useGridEditorRuntime } from "./grid-layout/useGridEditorRuntime";
import {
  createGridEditorOverlayGeometry,
  renderGridEditorOverlay
} from "./grid-layout/GridEditorOverlay";

// Utility class names
const layoutClassName = "vue-grid-layout";
const isFirefox =
  typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent);

const componentName = 'VueGridLayout';

const VueGridLayout = defineComponent({
  name: componentName,
  inheritAttrs: false,
  props: {
    ...gridLayoutProps
  },
  emits: gridLayoutEmits,
  setup(props, { slots, attrs, emit }) {
    const eventBridge = createGridLayoutEventBridge(emit, getCurrentInstance());
    const model = useGridLayoutModel({
      props,
      slots,
      emitModelValue: layout => eventBridge.emitModelValue(layout),
      emitLayoutChange: layout => eventBridge.emitLayoutChange(layout)
    });
    const {
      state,
      persistenceController,
      syncHistory,
      onLayoutMaybeChanged
    } = model;
    const engineBridge = useGridLayoutEngineBridge({
      props,
      getLayout: () => state.layout
    });

    const interactionState = {
      current: null as ReturnType<typeof useGridInteractions> | null
    };
    const editorRuntime = useGridEditorRuntime({
      props,
      layoutRef: toRef(state, 'layout') as Ref<Layout>,
      persistenceController,
      getLayout: () => state.layout,
      getOldDragItem: () => state.oldDragItem,
      getOldResizeItem: () => state.oldResizeItem,
      isDropping: () => Boolean(state.droppingDOMNode),
      getInteractionState: () => interactionState.current
        ? {
            activeDragId: interactionState.current.activeDragId.value,
            activeResizeId: interactionState.current.activeResizeId.value,
            dragBlocked: interactionState.current.dragBlocked.value,
            resizeBlocked: interactionState.current.resizeBlocked.value
          }
        : null
    });

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
      getConfig: () => props.autoScroll,
      rootClassName: layoutClassName
    });

    const interactions = useGridInteractions({
      props,
      state,
      eventBridge,
      engineBridge,
      frameUpdate,
      autoScroll,
      editor: {
        clearGuides: editorRuntime.clearGuides,
        resetSnap: editorRuntime.resetSnap,
        snapCandidate: editorRuntime.snapCandidate,
        updateIntelligence: editorRuntime.updateIntelligence
      },
      isFirefox,
      layoutClassName,
      nextInteractionRequestId,
      syncHistory,
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
      editorRuntime.stop();
    });

    // Set the component to mounted state
    onMounted(() => {
      state.mounted = true;
      editorRuntime.mount();
      void model.loadPersistedLayout();
    });

    // Calculate container height based on the layout
    const containerHeight = (): string | null => {
      const { containerPadding, rowHeight, margin, autoSize } = props;
      if (!autoSize) return null;
      const nbRow = bottom(state.layout);
      const containerPaddingY = containerPadding ? containerPadding[1] : margin[1];
      const heightPx =
        nbRow === 0
          ? containerPaddingY * 2
          : nbRow * rowHeight + (nbRow - 1) * margin[1] + containerPaddingY * 2;
      return `${Math.max(0, heightPx)}px`;
    };

    // Create a placeholder element
    const placeholder = (): VNode | null => {
      const { activeDrag } = state;
      if (!activeDrag) return null;
      const { width = 0, cols, margin, containerPadding, rowHeight, maxRows, useCSSTransforms, transformScale } = props;

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
          rowHeight={rowHeight}
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
        rowHeight,
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
      } = props;

      const { mounted, droppingPosition } = state;

      const editorItemState = editorRuntime.getItemRenderState(
        l,
        { isDraggable, isResizable, isBounded },
        isDroppingItem
      );
      if (!editorItemState.visible) return null;

      const resizeHandlesOptions = l.resizeHandles || resizeHandles;
      return (
        <GridItem
          key={l.i}
          containerWidth={width}
          cols={cols}
          margin={margin}
          containerPadding={containerPadding || margin}
          maxRows={maxRows}
          rowHeight={rowHeight}
          cancel={draggableCancel}
          handle={draggableHandle}
          onDragStop={interactions.onDragStop}
          onDragStart={interactions.onDragStart}
          onDrag={interactions.onDrag}
          onResizeStart={interactions.onResizeStart}
          onResize={interactions.onResize}
          onResizeStop={interactions.onResizeStop}
          isDraggable={editorItemState.draggable}
          isResizable={editorItemState.resizable}
          isBounded={editorItemState.bounded}
          isDragBlocked={interactions.dragBlocked.value && interactions.activeDragId.value === l.i}
          isResizeBlocked={interactions.resizeBlocked.value && interactions.activeResizeId.value === l.i}
          useCSSTransforms={useCSSTransforms && mounted}
          usePercentages={!mounted}
          transformScale={transformScale}
          w={l.w}
          h={l.h}
          x={l.x}
          y={l.y}
          i={l.i}
          minH={l.minH}
          minW={l.minW}
          maxH={l.maxH}
          maxW={l.maxW}
          static={l.static}
          class={editorItemState.className}
          onItemClick={editorItemState.onClick}
          droppingPosition={isDroppingItem && props.dropStrategy !== 'auto' ? droppingPosition : undefined}
          resizeHandles={resizeHandlesOptions}
          resizeHandle={resizeHandle}
        >
          {child}
        </GridItem>
      );
    };

    return () => {
      const { class: className, style, isDroppable, innerRef } = props;
      const rootAttrs = splitGridRootAttrs(attrs);
      const editorDropEnabled = isDroppable && !editorRuntime.isViewMode();
      const mergedClassName = clsx(layoutClassName, rootAttrs.class as Parameters<typeof clsx>[number], className, {
        "editor-enabled": editorRuntime.isEnabled(),
        "editor-mode-view": editorRuntime.isEnabled() && editorRuntime.isViewMode(),
        "editor-mode-edit": editorRuntime.isEnabled() && editorRuntime.isEditMode(),
        "editor-dirty": editorRuntime.controller?.dirty.value,
        "editor-conflict": editorRuntime.controller?.state.value === "conflict",
        "editor-guide-grid": editorRuntime.controller?.guides.value.showGrid
      });
      const mergedStyle: Kv = {
        ...(rootAttrs.style && typeof rootAttrs.style === "object" && !Array.isArray(rootAttrs.style) ? rootAttrs.style as Kv : {}),
        height: containerHeight(),
        ...style
      };

      const children: VNode[] = slots.default ? getNonFragmentChildren(h(Fragment, null, slots.default())) : [];
      layoutItemById.clear();
      for (let i = 0; i < state.layout.length; i++) {
        const item = state.layout[i];
        layoutItemById.set(item.i, item);
      }
      const overlayGeometry = createGridEditorOverlayGeometry({
        width: props.width || 0,
        margin: props.margin,
        containerPadding: props.containerPadding || props.margin,
        rowHeight: props.rowHeight,
        cols: props.cols,
        maxRows: props.maxRows
      });

      return (
        <div
          {...rootAttrs.attrs}
          ref={innerRef}
          class={mergedClassName}
          style={mergedStyle}
          onClick={editorRuntime.onRootClick}
          onDrop={editorDropEnabled ? interactions.onDrop : noop}
          onDragleave={editorDropEnabled ? interactions.onDragLeave : noop}
          onDragenter={editorDropEnabled ? interactions.onDragEnter : noop}
          onDragover={editorDropEnabled ? interactions.onDragOver : noop}
        >
          {children.map(child => processGridItem(child, layoutItemById))}
          {editorDropEnabled &&
            state.droppingDOMNode &&
            processGridItem(state.droppingDOMNode, layoutItemById, true)}
          {placeholder()}
          {renderGridEditorOverlay({
            enabled: editorRuntime.guidesEnabled(),
            geometry: overlayGeometry,
            guideState: editorRuntime.controller?.guides.value,
            itemMap: layoutItemById,
            layout: state.layout
          })}
        </div>
      );
    };
  }
});

export default VueGridLayout;
