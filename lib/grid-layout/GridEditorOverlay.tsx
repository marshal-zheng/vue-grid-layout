import { h, type VNode } from "vue";
import clsx from "clsx";
import { applyRenderPrecision, calcGridColWidth } from "../calculateUtils";
import type { Layout, LayoutItem } from "../utils";
import type { Kv } from "../type";
import type { GridEditorGuide, GridEditorGuideState } from "../editor";
import type { GridEditorPlacementSession } from "../editor/placementSession";
import type { GridRenderPrecision } from "../grid-height";

type GridEditorOverlayGeometryInput = {
  width: number;
  margin: number[];
  containerPadding: number[];
  rowHeight: number;
  renderPrecision?: GridRenderPrecision;
  cols: number;
  maxRows: number;
};

export type GridEditorOverlayGeometry = ReturnType<typeof createGridEditorOverlayGeometry>;

export function createGridEditorOverlayGeometry({
  width,
  margin,
  containerPadding,
  rowHeight,
  renderPrecision = "integer",
  cols,
  maxRows
}: GridEditorOverlayGeometryInput) {
  const padding = containerPadding;
  const colWidth = calcGridColWidth({
    cols,
    containerPadding: padding,
    containerWidth: width,
    margin,
    maxRows,
    rowHeight
  });
  const format = (value: number) => applyRenderPrecision(value, renderPrecision);
  const gridLineXPx = (value: number) => format(padding[0] + value * (colWidth + margin[0]));
  const gridLineYPx = (value: number) => format(padding[1] + value * (rowHeight + margin[1]));
  const centerXPx = (value: number) => format(padding[0] + value * (colWidth + margin[0]) - margin[0] / 2);
  const centerYPx = (value: number) => format(padding[1] + value * (rowHeight + margin[1]) - margin[1] / 2);
  const rightEdgePx = (value: number) => format(gridLineXPx(value) - margin[0]);
  const bottomEdgePx = (value: number) => format(gridLineYPx(value) - margin[1]);
  const guideXPx = (guide: GridEditorGuide) => {
    if (guide.kind === "right") return rightEdgePx(guide.position);
    if (guide.kind === "center-x") return centerXPx(guide.position);
    return gridLineXPx(guide.position);
  };
  const guideYPx = (guide: GridEditorGuide) => {
    if (guide.kind === "bottom") return bottomEdgePx(guide.position);
    if (guide.kind === "center-y") return centerYPx(guide.position);
    return gridLineYPx(guide.position);
  };
  const spanXPx = (start: number, end: number) => ({
    start: gridLineXPx(start),
    end: rightEdgePx(end)
  });
  const spanYPx = (start: number, end: number) => ({
    start: gridLineYPx(start),
    end: bottomEdgePx(end)
  });
  const spacingXPx = (start: number, end: number) => ({
    start: rightEdgePx(start),
    end: gridLineXPx(end)
  });
  const spacingYPx = (start: number, end: number) => ({
    start: bottomEdgePx(start),
    end: gridLineYPx(end)
  });
  const itemLeftPx = (value: number) => format(padding[0] + value * (colWidth + margin[0]));
  const itemTopPx = (value: number) => format(padding[1] + value * (rowHeight + margin[1]));
  const itemWidthPx = (value: number) => format(Math.max(0, value * colWidth + Math.max(0, value - 1) * margin[0]));
  const itemHeightPx = (value: number) => format(Math.max(0, value * rowHeight + Math.max(0, value - 1) * margin[1]));
  return {
    padding,
    colWidth,
    gridLineXPx,
    gridLineYPx,
    guideXPx,
    guideYPx,
    spanXPx,
    spanYPx,
    spacingXPx,
    spacingYPx,
    itemLeftPx,
    itemTopPx,
    itemWidthPx,
    itemHeightPx
  };
}

type RenderGridEditorOverlayOptions = {
  enabled: boolean;
  geometry: GridEditorOverlayGeometry;
  guideState?: GridEditorGuideState;
  placementSession?: GridEditorPlacementSession | null;
  itemMap: Map<string, LayoutItem>;
  layout: Layout;
};

export function renderGridEditorOverlay({
  enabled,
  geometry,
  guideState,
  placementSession,
  itemMap,
  layout
}: RenderGridEditorOverlayOptions): VNode[] {
  if (!enabled) return [];

  const {
    guideXPx,
    guideYPx,
    spanXPx,
    spanYPx,
    spacingXPx,
    spacingYPx,
    itemLeftPx,
    itemTopPx,
    itemWidthPx,
    itemHeightPx
  } = geometry;

  const guideNodes = (): VNode[] => {
    if (!guideState) return [];
    const displayGuides = guideState.displayGuides || guideState.guides;
    const guideStyle = (guide: GridEditorGuide): Kv => {
      const display = guide.display;
      if (display?.kind === "spacing" && guide.kind === "spacing-x") {
        const span = spacingXPx(display.start, display.end);
        return {
          left: `${span.start}px`,
          top: `${guideYPx(guide)}px`,
          width: `${Math.max(1, span.end - span.start)}px`
        };
      }
      if (display?.kind === "spacing" && guide.kind === "spacing-y") {
        const span = spacingYPx(display.start, display.end);
        return {
          left: `${guideXPx(guide)}px`,
          top: `${span.start}px`,
          height: `${Math.max(1, span.end - span.start)}px`
        };
      }
      if (guide.axis === "x") {
        const span = display ? spanYPx(display.start, display.end) : null;
        return display
          ? {
              left: `${guideXPx(guide)}px`,
              top: `${span?.start || 0}px`,
              height: `${Math.max(1, (span?.end || 0) - (span?.start || 0))}px`
            }
          : {
              left: `${guideXPx(guide)}px`,
              top: 0,
              bottom: 0
            };
      }
      const span = display ? spanXPx(display.start, display.end) : null;
      return display
        ? {
            top: `${guideYPx(guide)}px`,
            left: `${span?.start || 0}px`,
            width: `${Math.max(1, (span?.end || 0) - (span?.start || 0))}px`
          }
        : {
            top: `${guideYPx(guide)}px`,
            left: 0,
            right: 0
          };
    };
    const guideNode = (guide: GridEditorGuide, debug = false) => {
      const active = guideState.snappedGuideIds.includes(guide.id) || guide.isSnapped === true;
      const spacing = guide.kind === "spacing-x" || guide.kind === "spacing-y";
      const proximity = typeof guide.proximity === "number" ? guide.proximity : (active ? 1 : 0.4);
      const opacity = active ? 1 : Math.max(0.18, 0.18 + proximity * 0.62);
      const style: Kv = { ...guideStyle(guide) };
      if (!debug && !active) style.opacity = String(Math.round(opacity * 100) / 100);
      return h("div", {
        key: `${debug ? "debug-" : ""}${guide.id}`,
        class: clsx(
          debug ? "vue-grid-editor-debug-guide" : "vue-grid-editor-guide",
          `vue-grid-editor-guide-${guide.axis}`,
          {
            "vue-grid-editor-guide-active": active,
            "vue-grid-editor-guide-snapped": active,
            "vue-grid-editor-guide-predict": !active && !debug,
            "vue-grid-editor-spacing-guide": spacing,
            "vue-grid-editor-alignment-guide": !spacing,
            "vue-grid-editor-guide-with-label": guide.display?.showLabel
          }
        ),
        style,
        "data-guide-id": guide.id,
        "data-guide-kind": guide.kind,
        "data-guide-role": spacing ? "spacing" : "alignment",
        "data-guide-state": active ? "snapped" : "predict",
        "data-guide-proximity": String(Math.round(proximity * 100) / 100),
        "data-guide-debug": debug ? "true" : undefined,
        "data-guide-source-ids": guide.sourceIds.join(",")
      }, guide.display?.showLabel && guide.display.label
        ? [h("span", { class: "vue-grid-editor-guide-label" }, guide.display.label)]
        : undefined);
    };

    const nodes = displayGuides.map(guide => guideNode(guide));
    if (guideState.debug && guideState.debugMode === "layer" && guideState.debugGuides?.length) {
      nodes.push(h("div", {
        key: "debug-guides-layer",
        class: "vue-grid-editor-debug-layer",
        "data-guide-debug-layer": "true"
      }, guideState.debugGuides.map(guide => guideNode(guide, true))));
    } else if (guideState.debug && guideState.debugMode === "panel") {
      nodes.push(h("div", {
        key: "debug-guides-panel",
        class: "vue-grid-editor-debug-panel",
        "data-guide-debug-panel": "true"
      }, `Debug guides: ${guideState.guides.length} candidates, ${displayGuides.length} shown`));
    }
    return nodes;
  };

  const spacingChipNodes = (): VNode[] => {
    if (!guideState) return [];
    const chips = guideState.spacingChips || [];
    if (chips.length === 0) return [];
    return chips.map(chip => {
      const isHorizontal = chip.axis === "x";
      const span = isHorizontal
        ? spacingXPx(chip.span.start, chip.span.end)
        : spacingYPx(chip.span.start, chip.span.end);
      const start = span.start;
      const end = span.end;
      const length = Math.max(1, end - start);
      const cross = isHorizontal
        ? guideYPx({ kind: "center-y", axis: "y", position: chip.position } as GridEditorGuide)
        : guideXPx({ kind: "center-x", axis: "x", position: chip.position } as GridEditorGuide);
      const style: Kv = isHorizontal
        ? { left: `${start}px`, top: `${cross}px`, width: `${length}px` }
        : { top: `${start}px`, left: `${cross}px`, height: `${length}px` };
      const label = `${chip.distance} ${chip.unit}${chip.distance === 1 ? "" : "s"}`;
      return h("div", {
        key: chip.id,
        class: clsx(
          "vue-grid-editor-spacing-chip",
          `vue-grid-editor-spacing-chip-${chip.side}`,
          `vue-grid-editor-spacing-chip-${chip.axis}`,
          { "vue-grid-editor-spacing-chip-equal": chip.isEqual }
        ),
        style,
        "data-chip-id": chip.id,
        "data-chip-side": chip.side,
        "data-chip-equal": chip.isEqual ? "true" : "false",
        "data-chip-neighbor": chip.neighborId || "edge"
      }, [h("span", { class: "vue-grid-editor-spacing-chip-label" }, label)]);
    });
  };

  const measurementHudNode = (): VNode | null => {
    if (!guideState) return null;
    const hud = guideState.measurementHud;
    if (!hud) return null;
    const left = itemLeftPx(hud.position.x) + itemWidthPx(hud.size.w);
    const top = itemTopPx(hud.position.y);
    const dimsLabel = `${hud.size.w}\u00d7${hud.size.h}\u2002\u00b7\u2002col ${hud.position.x}, row ${hud.position.y}`;
    const deltaParts: string[] = [];
    if (hud.delta?.dw) deltaParts.push(`${hud.delta.dw > 0 ? "+" : ""}${hud.delta.dw} col${Math.abs(hud.delta.dw) === 1 ? "" : "s"}`);
    if (hud.delta?.dh) deltaParts.push(`${hud.delta.dh > 0 ? "+" : ""}${hud.delta.dh} row${Math.abs(hud.delta.dh) === 1 ? "" : "s"}`);
    if (hud.delta?.dx) deltaParts.push(`x ${hud.delta.dx > 0 ? "+" : ""}${hud.delta.dx}`);
    if (hud.delta?.dy) deltaParts.push(`y ${hud.delta.dy > 0 ? "+" : ""}${hud.delta.dy}`);
    const children: VNode[] = [
      h("span", { class: "vue-grid-editor-measurement-hud-label" }, hud.label || hud.itemId),
      h("span", { class: "vue-grid-editor-measurement-hud-dims" }, dimsLabel)
    ];
    if (deltaParts.length > 0) {
      children.push(h("span", { class: "vue-grid-editor-measurement-hud-delta" }, `\u0394 ${deltaParts.join(" \u00b7 ")}`));
    }
    if (hud.blocked) {
      children.push(h("span", { class: "vue-grid-editor-measurement-hud-blocked" }, hud.blockedMessage || hud.blocked));
    }
    return h("div", {
      key: `hud:${hud.itemId}`,
      class: clsx(
        "vue-grid-editor-measurement-hud",
        `vue-grid-editor-measurement-hud-${hud.interaction}`,
        { "vue-grid-editor-measurement-hud-blocked-state": Boolean(hud.blocked) }
      ),
      style: { left: `${left}px`, top: `${top}px` },
      "data-hud-item-id": hud.itemId,
      "data-hud-interaction": hud.interaction,
      "data-hud-blocked": hud.blocked || undefined,
      role: "status",
      "aria-live": "polite"
    }, children);
  };

  const anchorEdgeNodes = (): VNode[] => {
    if (!guideState) return [];
    const anchors = guideState.anchorEdges || [];
    if (anchors.length === 0) return [];
    const nodes: VNode[] = [];
    anchors.forEach(anchor => {
      const item = itemMap.get(anchor.itemId)
        || layout.find(entry => entry.i === anchor.itemId);
      if (!item) return;
      const left = itemLeftPx(item.x);
      const top = itemTopPx(item.y);
      const width = itemWidthPx(item.w);
      const height = itemHeightPx(item.h);
      anchor.sides.forEach(side => {
        const style: Kv = { position: "absolute" };
        if (side === "left") {
          Object.assign(style, { left: `${left}px`, top: `${top}px`, height: `${height}px`, width: "2px" });
        } else if (side === "right") {
          Object.assign(style, { left: `${left + width - 2}px`, top: `${top}px`, height: `${height}px`, width: "2px" });
        } else if (side === "top") {
          Object.assign(style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: "2px" });
        } else if (side === "bottom") {
          Object.assign(style, { left: `${left}px`, top: `${top + height - 2}px`, width: `${width}px`, height: "2px" });
        } else if (side === "center-x") {
          Object.assign(style, { left: `${left + width / 2 - 1}px`, top: `${top}px`, height: `${height}px`, width: "2px" });
        } else if (side === "center-y") {
          Object.assign(style, { left: `${left}px`, top: `${top + height / 2 - 1}px`, width: `${width}px`, height: "2px" });
        }
        nodes.push(h("div", {
          key: `anchor:${anchor.role}:${anchor.itemId}:${side}`,
          class: clsx("vue-grid-editor-anchor-edge", `vue-grid-editor-anchor-edge-${side}`, `vue-grid-editor-anchor-edge-${anchor.role}`),
          style,
          "data-anchor-item-id": anchor.itemId,
          "data-anchor-side": side,
          "data-anchor-role": anchor.role
        }));
      });
    });
    return nodes;
  };

  const placementGhostNodes = (): VNode[] => {
    if (!placementSession) return [];
    return placementSession.ghostItems.map(ghost => {
      const item = ghost.item;
      const blocked = ghost.state === "blocked" || placementSession.phase === "blocked";
      return h("div", {
        key: `placement-ghost:${placementSession.id}:${ghost.id}`,
        class: clsx(
          "vue-grid-editor-placement-ghost",
          `vue-grid-editor-placement-ghost-${ghost.state}`,
          {
            "vue-grid-editor-placement-ghost-blocked": blocked,
            "vue-grid-editor-placement-ghost-committing": ghost.state === "committing"
          }
        ),
        style: {
          left: `${itemLeftPx(item.x)}px`,
          top: `${itemTopPx(item.y)}px`,
          width: `${itemWidthPx(item.w)}px`,
          height: `${itemHeightPx(item.h)}px`
        },
        "data-placement-session-id": placementSession.id,
        "data-placement-source": placementSession.source,
        "data-placement-item-id": ghost.id,
        "data-placement-state": blocked ? "blocked" : ghost.state,
        "data-placement-x": String(item.x),
        "data-placement-y": String(item.y),
        "data-placement-w": String(item.w),
        "data-placement-h": String(item.h),
        "aria-hidden": "true"
      });
    });
  };

  const placementAffectedNodes = (): VNode[] => {
    if (!placementSession) return [];
    return placementSession.affectedOutlines.map(outline => {
      const item = outline.after;
      return h("div", {
        key: `placement-affected:${placementSession.id}:${outline.id}:${outline.kind}`,
        class: clsx(
          "vue-grid-editor-placement-affected",
          `vue-grid-editor-placement-affected-${outline.kind}`
        ),
        style: {
          left: `${itemLeftPx(item.x)}px`,
          top: `${itemTopPx(item.y)}px`,
          width: `${itemWidthPx(item.w)}px`,
          height: `${itemHeightPx(item.h)}px`
        },
        "data-placement-session-id": placementSession.id,
        "data-placement-source": placementSession.source,
        "data-placement-affected-id": outline.id,
        "data-placement-outline-kind": outline.kind,
        "aria-hidden": "true"
      });
    });
  };

  const placementHudNode = (): VNode | null => {
    if (!placementSession) return null;
    const first = placementSession.ghostItems[0]?.item;
    if (!first && !placementSession.blocked) return null;
    const left = first ? itemLeftPx(first.x) + itemWidthPx(first.w) : 0;
    const top = first ? itemTopPx(first.y) : 0;
    const blocked = placementSession.blocked;
    const label = blocked
      ? blocked.message || `Placement blocked by ${blocked.reason}.`
      : `${placementSession.ghostItems.length} item${placementSession.ghostItems.length === 1 ? "" : "s"}`;
    return h("div", {
      key: `placement-hud:${placementSession.id}`,
      class: clsx(
        "vue-grid-editor-placement-hud",
        { "vue-grid-editor-placement-hud-blocked": Boolean(blocked) }
      ),
      style: { left: `${left}px`, top: `${top}px` },
      "data-placement-session-id": placementSession.id,
      "data-placement-source": placementSession.source,
      "data-placement-state": blocked ? "blocked" : placementSession.phase,
      role: "status",
      "aria-live": "polite"
    }, label);
  };

  return [
    ...placementAffectedNodes(),
    ...placementGhostNodes(),
    placementHudNode(),
    ...anchorEdgeNodes(),
    ...guideNodes(),
    ...spacingChipNodes(),
    measurementHudNode()
  ].filter(Boolean) as VNode[];
}
