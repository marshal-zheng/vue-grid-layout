import { markRaw, ref } from "vue";
import {
  cloneLayoutItem,
  compact,
  compactType,
  findNearestFit,
  getAllCollisions,
  getLayoutItem
} from "../utils";
import type {
  Layout,
  LayoutItem
} from "../utils";
import {
  calcGridItemPosition,
  calcXY,
  type PositionParams
} from "../calculateUtils";
import type { GridInteractionCommonOptions } from "./gridInteractionTypes";
import { useGridInteractionMachine } from "./useGridInteractionMachine";
import type { GridInteractionEffect } from "../interaction-state-machine";
import {
  applyExternalDropPreviewResult,
  blockExternalDropSession,
  buildDropFitOperationFromSession,
  commitExternalDropSession,
  createExternalDropSession,
  resolveExternalDropCandidate,
  type ExternalDropPreviewResult,
  type ExternalDropSession
} from "./externalDropSession";

type UseGridDropInteractionsOptions = GridInteractionCommonOptions & {
  isFirefox: boolean;
  layoutClassName: string;
};

export function useGridDropInteractions({
  props,
  state,
  eventBridge,
  engineBridge,
  frameUpdate,
  autoScroll,
  editor,
  isFirefox,
  layoutClassName,
  interactionMachine: providedInteractionMachine,
  nextInteractionRequestId
}: UseGridDropInteractionsOptions) {
  const dragEnterCounter = ref(0);
  let activeDropInteractionId: string | null = null;
  const interactionMachine = providedInteractionMachine || useGridInteractionMachine({
    getDragActivationDistance: () => props.dragActivationDistance
  });

  const getLayoutEngineProp = () => engineBridge.getLayoutEngineProp();
  const isLegacyLayoutEngine = () => engineBridge.isLegacyLayoutEngine();
  const resetInteractionController = (layout = state.layout) => engineBridge.reset(layout);
  const runEnginePreview: typeof engineBridge.preview = (...args) => engineBridge.preview(...args);
  const runEngineCommit: typeof engineBridge.commit = (...args) => engineBridge.commit(...args);

  const hasEffect = <Type extends GridInteractionEffect["type"]>(
    effects: GridInteractionEffect[],
    type: Type
  ): Extract<GridInteractionEffect, { type: Type }> | undefined =>
    effects.find((effect): effect is Extract<GridInteractionEffect, { type: Type }> => effect.type === type);

  const ensureDropInteraction = (itemId: string) => {
    if (!activeDropInteractionId) {
      const nextInteractionId = nextInteractionRequestId("drop", itemId);
      const transition = interactionMachine.dispatch({
        type: "ENTER_DROP",
        interactionId: nextInteractionId,
        itemId
      });
      if (hasEffect(transition.effects, "REJECT_TRANSITION")) return null;
      activeDropInteractionId = nextInteractionId;
    }
    return activeDropInteractionId;
  };

  const shouldPreviewDrop = (
    itemId: string,
    grid: { x: number; y: number },
    size: { w: number; h: number },
    strategy: "cursor" | "auto"
  ) => {
    const interactionId = ensureDropInteraction(itemId);
    if (!interactionId) return null;
    const transition = interactionMachine.dispatch({
      type: "MOVE_DROP",
      interactionId,
      grid,
      size,
      strategy
    });
    return hasEffect(transition.effects, "PREVIEW_DROP") || null;
  };

  const resetDropInteraction = (reason: string) => {
    interactionMachine.reset(reason);
    activeDropInteractionId = null;
  };

  const setExternalDropSession = (session: ExternalDropSession | null) => {
    state.externalDropSession = session ? markRaw(session) : null;
  };

  const getBaseLayout = (id: string): Layout =>
    state.layout.filter(item => item.i !== id);

  const ensureSession = (): ExternalDropSession | null => {
    const droppingId = String(props.droppingItem.i);
    const interactionId = ensureDropInteraction(droppingId);
    if (!interactionId) return null;

    const current = state.externalDropSession;
    if (current && current.id === droppingId && current.status !== "committing") {
      return current;
    }

    const session = createExternalDropSession({
      id: droppingId,
      interactionId,
      sourceItem: props.droppingItem,
      baseLayout: getBaseLayout(droppingId),
      strategy: props.dropStrategy
    });
    setExternalDropSession(session);
    return session;
  };

  const cleanupExternalDrop = (reason = "drop-cleanup") => {
    setExternalDropSession(null);
    autoScroll.reset();
    editor.clearGuides();
    resetDropInteraction(reason);
  };

  const applyPreviewResult = (
    session: ExternalDropSession,
    result: ExternalDropPreviewResult
  ) => {
    const nextSession = applyExternalDropPreviewResult(session, result);
    setExternalDropSession(nextSession);
    if (nextSession.status === "ready" && nextSession.ghostItem) {
      editor.updateIntelligence(nextSession.id, nextSession.ghostItem, nextSession.ghostItem);
    }
  };

  const buildLegacyLayoutResult = (
    session: ExternalDropSession,
    item: LayoutItem
  ): ExternalDropPreviewResult => {
    const nextLayout = compact(
      [...session.baseLayout.map(cloneLayoutItem), cloneLayoutItem(item)],
      compactType(props),
      props.cols,
      props.allowOverlap
    );
    const finalItem = getLayoutItem(nextLayout, session.id) || item;
    return {
      status: "changed",
      layout: nextLayout,
      placeholder: finalItem
    };
  };

  const previewLegacyExternalDrop = (session: ExternalDropSession): ExternalDropPreviewResult => {
    const { cols, maxRows, allowOverlap } = props;
    const target = session.target || { x: session.resolvedItem.x, y: session.resolvedItem.y };
    let nextItem: LayoutItem | null = null;

    if (session.strategy === "auto") {
      const fit = findNearestFit(
        session.baseLayout,
        { w: session.resolvedItem.w, h: session.resolvedItem.h },
        cols,
        target.x,
        target.y,
        maxRows
      );
      if (fit) {
        const rawItem = {
          ...session.resolvedItem,
          x: fit.x,
          y: fit.y,
          static: false
        };
        nextItem = editor.snapCandidate(session.id, rawItem, rawItem, session.baseLayout);
      }
    } else {
      nextItem = cloneLayoutItem(session.resolvedItem);
      if (!allowOverlap) {
        const collisions = getAllCollisions(session.baseLayout, nextItem);
        if (collisions.length > 0) {
          nextItem.x = Math.min(...collisions.map(collision => collision.x));
          nextItem.y = Math.max(...collisions.map(collision => collision.y + collision.h));
        }
      }
    }

    if (!nextItem || nextItem.y + nextItem.h > maxRows) {
      return {
        status: "blocked",
        layout: session.baseLayout,
        blocked: { reason: "maxRows", itemIds: [session.id] },
        placeholder: nextItem || session.resolvedItem
      };
    }

    return buildLegacyLayoutResult(session, nextItem);
  };

  const commitLegacyExternalDrop = (session: ExternalDropSession): ExternalDropPreviewResult => {
    const finalItem = session.ghostItem || session.resolvedItem;
    return buildLegacyLayoutResult(session, finalItem);
  };

  const handleCommitResult = async (
    session: ExternalDropSession,
    result: ExternalDropPreviewResult,
    event: Event,
    interactionId: string,
    requestId: string
  ) => {
    if (result.status === "stale") return;
    if (!interactionMachine.isCurrentRequest(interactionId, requestId)) return;

    const coreStatus = result.status === "cancelled" ? "error" : result.status;
    interactionMachine.dispatch({
      type: "APPLY_RESULT",
      interactionId,
      requestId,
      status: coreStatus
    });

    if (result.status === "blocked" || result.status === "cancelled" || result.status === "error") {
      const blocked = blockExternalDropSession(session, result.drop?.reason || result.blocked?.reason || "commit-rejected", {
        geometry: result.placeholder || session.ghostItem || session.resolvedItem,
        message: result.error?.message,
        itemIds: result.blocked?.itemIds
      });
      setExternalDropSession(blocked);
      cleanupExternalDrop(blocked.blocked?.reason || "drop-commit-rejected");
      return;
    }

    const { committedLayout, committedItem, eventLayout } = commitExternalDropSession(session, result);
    const commandResult = committedItem
      ? (state.suppressLayoutChange = true, await editor.commitDrop?.({
          id: session.id,
          beforeLayout: session.baseLayout,
          afterLayout: committedLayout,
          item: committedItem,
          event
        }))
      : null;

    if (
      commandResult &&
      commandResult.status !== "changed" &&
      commandResult.status !== "noop"
    ) {
      state.suppressLayoutChange = true;
      state.layout = markRaw(session.baseLayout);
      editor.rollbackInteraction?.(session.baseLayout, commandResult.status);
      dragEnterCounter.value = 0;
      cleanupExternalDrop(commandResult.status);
      return;
    }

    dragEnterCounter.value = 0;
    eventBridge.emitDrop(eventLayout, event, committedItem);
    cleanupExternalDrop("drop-cleanup");
  };

  const onDrop = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const session = state.externalDropSession;
    const hasVisibleCommitTarget = Boolean(
      session &&
      !session.blocked &&
      (
        session.status === "ready" ||
        (session.status === "previewing" && session.ghostItem)
      )
    );
    if (!session || !hasVisibleCommitTarget) {
      dragEnterCounter.value = 0;
      cleanupExternalDrop(session?.blocked?.reason || "drop-commit-rejected");
      return;
    }

    const dropInteractionId = ensureDropInteraction(session.id);
    if (!dropInteractionId) {
      cleanupExternalDrop("drop-commit-rejected");
      return;
    }

    const dropTransition = interactionMachine.dispatch({
      type: "COMMIT_DROP",
      interactionId: dropInteractionId
    });
    const dropCommitEffect = hasEffect(dropTransition.effects, "COMMIT_DROP");
    if (!dropCommitEffect) {
      cleanupExternalDrop("drop-commit-rejected");
      return;
    }

    const committingSession: ExternalDropSession = {
      ...session,
      status: "committing",
      requestId: dropCommitEffect.requestId
    };
    const commitOperation = buildDropFitOperationFromSession(committingSession, "commit");
    setExternalDropSession(committingSession);

    if (isLegacyLayoutEngine()) {
      void handleCommitResult(
        committingSession,
        commitLegacyExternalDrop(committingSession),
        e,
        dropCommitEffect.interactionId,
        dropCommitEffect.requestId
      );
      return;
    }

    resetInteractionController(committingSession.baseLayout);
    engineBridge.start({
      id: nextInteractionRequestId("drop-commit", committingSession.id),
      type: "drop",
      itemId: committingSession.id
    });

    runEngineCommit(
      dropCommitEffect.requestId,
      commitOperation,
      result => {
        void handleCommitResult(
          committingSession,
          result,
          e,
          dropCommitEffect.interactionId,
          dropCommitEffect.requestId
        );
      },
      committingSession.baseLayout.length >= (getLayoutEngineProp()?.scheduler?.auto?.workerMinItems || 1000)
    );
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragEnterCounter.value === 0) {
      ensureSession();
    }
    dragEnterCounter.value++;
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounter.value = Math.max(0, dragEnterCounter.value - 1);

    if (dragEnterCounter.value === 0) {
      cleanupExternalDrop("drag-leave");
    }
  };

  const onDragOver = (e: DragEvent): void | false => {
    e.preventDefault();
    e.stopPropagation();

    if (isFirefox && !(e.currentTarget as Element | null)?.classList?.contains(layoutClassName)) {
      return false;
    }

    const session = ensureSession();
    if (!session) return false;

    const onDragOverResult = eventBridge.callDropDragOver(e);
    if (onDragOverResult === false) {
      cleanupExternalDrop("drop-drag-over-rejected");
      return false;
    }

    const {
      margin,
      cols,
      rowHeight,
      maxRows,
      width,
      containerPadding,
      transformScale,
      dropStrategy
    } = props;
    const gridRect = e.currentTarget instanceof Element
      ? e.currentTarget.getBoundingClientRect()
      : { left: 0, top: 0 };
    const layerX = (e.clientX - gridRect.left) / transformScale;
    const layerY = (e.clientY - gridRect.top) / transformScale;
    const overrideW = typeof onDragOverResult?.w === "number"
      ? onDragOverResult.w
      : props.droppingItem.w;
    const overrideH = typeof onDragOverResult?.h === "number"
      ? onDragOverResult.h
      : props.droppingItem.h;
    const positionParams: PositionParams = {
      cols,
      margin,
      maxRows,
      rowHeight,
      containerWidth: width || 0,
      containerPadding: containerPadding || margin,
      renderPrecision: props.renderPrecision || undefined
    };
    const droppingSize = calcGridItemPosition(positionParams, 0, 0, overrideW, overrideH);
    const cursorGridPos = calcXY(
      positionParams,
      layerY - droppingSize.height / 2,
      layerX - droppingSize.width / 2,
      overrideW,
      overrideH
    );
    const baseLayout = getBaseLayout(session.id);
    const rawCandidate = {
      ...session.resolvedItem,
      ...props.droppingItem,
      i: session.id,
      w: overrideW,
      h: overrideH,
      x: cursorGridPos.x,
      y: cursorGridPos.y,
      static: false
    } as LayoutItem;
    const snappedTarget = editor.snapCandidate(session.id, rawCandidate, rawCandidate, baseLayout);
    const resolvedSession = resolveExternalDropCandidate(session, {
      overrides: onDragOverResult || null,
      target: { x: snappedTarget.x, y: snappedTarget.y },
      strategy: dropStrategy,
      baseLayout,
      snapCandidate: () => snappedTarget
    });

    const previewEffect = shouldPreviewDrop(
      resolvedSession.id,
      { x: resolvedSession.resolvedItem.x, y: resolvedSession.resolvedItem.y },
      { w: resolvedSession.resolvedItem.w, h: resolvedSession.resolvedItem.h },
      dropStrategy
    );
    if (!previewEffect) {
      setExternalDropSession(resolvedSession);
      return;
    }

    const previewSession: ExternalDropSession = {
      ...resolvedSession,
      requestId: previewEffect.requestId,
      status: "previewing"
    };
    const previewOperation = buildDropFitOperationFromSession(previewSession, "preview");
    setExternalDropSession(previewSession);

    if (isLegacyLayoutEngine()) {
      applyPreviewResult(previewSession, previewLegacyExternalDrop(previewSession));
      return;
    }

    resetInteractionController(previewSession.baseLayout);
    engineBridge.start({
      id: activeDropInteractionId || previewEffect.interactionId,
      type: "drop",
      itemId: previewSession.id
    });
    runEnginePreview(
      previewEffect.requestId,
      previewOperation,
      result => {
        if (result.status === "stale") return;
        if (!interactionMachine.isCurrentPreviewRequest(previewEffect.interactionId, previewEffect.requestId)) return;
        applyPreviewResult(previewSession, result);
      },
      previewSession.baseLayout.length >= (getLayoutEngineProp()?.scheduler?.auto?.workerMinItems || 1000)
    );
  };

  return {
    clearDropInteraction: () => cleanupExternalDrop("clear-active-interaction"),
    removeDroppingPlaceholder: cleanupExternalDrop,
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver
  };
}
