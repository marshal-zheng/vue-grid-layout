import type { Layout, LayoutItem } from "../utils";
import type {
  GridEditorGuide,
  GridEditorGuideAnchorEdge,
  GridEditorGuideAxis,
  GridEditorGuideEdgeSide,
  GridEditorGuideInteraction,
  GridEditorGuideKind,
  GridEditorGuidesOptions,
  GridEditorGuideState,
  GridEditorMeasurementHud,
  GridEditorMetaById,
  GridEditorSpacingChip,
  GridEditorSpacingChipSide
} from "./types";
import { computeGridEditorIntelligence } from "./intelligence";

const DEFAULT_PREDICT_RADIUS_X = 2;
const DEFAULT_PREDICT_RADIUS_Y = 1;
const DEFAULT_SNAP_THRESHOLD_CELLS = 0.5;
const DEFAULT_SPACING_CHIP_MIN = 1;
const DEFAULT_MAX_ITEMS = 500;
const EQUAL_SPACING_TOLERANCE = 0.01;
const DEFAULT_DISPLAY_LIMITS: Record<GridEditorGuideInteraction, number> = {
  drag: 3,
  drop: 3,
  placement: 3,
  resize: 2,
  keyboard: 3,
  api: 3
};

type Edge = {
  kind: GridEditorGuideKind;
  axis: "x" | "y";
  position: number;
  priority: number;
  edge: GridEditorGuideEdgeSide;
};

type SpacingGuideInput = {
  kind: "spacing-x" | "spacing-y";
  axis: "x" | "y";
  position: number;
  start: number;
  end: number;
  distance: number;
  priority: number;
  label: string;
};

const now = (): number => {
  const perf = typeof performance !== "undefined" ? performance : null;
  return perf && typeof perf.now === "function" ? perf.now() : Date.now();
};

const edgesForItem = (item: LayoutItem): Edge[] => [
  { kind: "left", axis: "x", position: item.x, priority: 10, edge: "left" },
  { kind: "right", axis: "x", position: item.x + item.w, priority: 11, edge: "right" },
  { kind: "center-x", axis: "x", position: item.x + item.w / 2, priority: 20, edge: "center-x" },
  { kind: "top", axis: "y", position: item.y, priority: 10, edge: "top" },
  { kind: "bottom", axis: "y", position: item.y + item.h, priority: 11, edge: "bottom" },
  { kind: "center-y", axis: "y", position: item.y + item.h / 2, priority: 20, edge: "center-y" }
];

const spacingGuides = (
  source: LayoutItem,
  target: LayoutItem
): SpacingGuideInput[] => {
  const guides: SpacingGuideInput[] = [];
  const sourceRight = source.x + source.w;
  const targetRight = target.x + target.w;
  const sourceBottom = source.y + source.h;
  const targetBottom = target.y + target.h;
  const overlapYStart = Math.max(source.y, target.y);
  const overlapYEnd = Math.min(sourceBottom, targetBottom);
  const overlapXStart = Math.max(source.x, target.x);
  const overlapXEnd = Math.min(sourceRight, targetRight);
  const yPosition = overlapYStart + Math.max(0, overlapYEnd - overlapYStart) / 2;
  const xPosition = overlapXStart + Math.max(0, overlapXEnd - overlapXStart) / 2;

  if (overlapYEnd > overlapYStart && sourceRight < target.x) {
    const horizontalGap = target.x - sourceRight;
    guides.push({
      kind: "spacing-x",
      axis: "x",
      position: yPosition,
      start: sourceRight,
      end: target.x,
      distance: horizontalGap,
      priority: 40 + horizontalGap,
      label: `${horizontalGap} ${horizontalGap === 1 ? "col" : "cols"}`
    });
  }
  if (overlapYEnd > overlapYStart && targetRight < source.x) {
    const horizontalGap = source.x - targetRight;
    guides.push({
      kind: "spacing-x",
      axis: "x",
      position: yPosition,
      start: targetRight,
      end: source.x,
      distance: horizontalGap,
      priority: 40 + horizontalGap,
      label: `${horizontalGap} ${horizontalGap === 1 ? "col" : "cols"}`
    });
  }
  if (overlapXEnd > overlapXStart && sourceBottom < target.y) {
    const verticalGap = target.y - sourceBottom;
    guides.push({
      kind: "spacing-y",
      axis: "y",
      position: xPosition,
      start: sourceBottom,
      end: target.y,
      distance: verticalGap,
      priority: 40 + verticalGap,
      label: `${verticalGap} ${verticalGap === 1 ? "row" : "rows"}`
    });
  }
  if (overlapXEnd > overlapXStart && targetBottom < source.y) {
    const verticalGap = source.y - targetBottom;
    guides.push({
      kind: "spacing-y",
      axis: "y",
      position: xPosition,
      start: targetBottom,
      end: source.y,
      distance: verticalGap,
      priority: 40 + verticalGap,
      label: `${verticalGap} ${verticalGap === 1 ? "row" : "rows"}`
    });
  }
  return guides;
};

const shouldIncludeGuideSource = (
  item: LayoutItem,
  metaById: GridEditorMetaById,
  options: GridEditorGuidesOptions
): boolean => {
  if (item.static && options.includeStatic === false) return false;
  if (metaById[item.i]?.locked && options.includeLocked === false) return false;
  if (metaById[item.i]?.visible === false && options.includeHidden !== true) return false;
  return true;
};

const isRowOrColumnMate = (source: LayoutItem, candidate: LayoutItem): boolean => {
  if (source.y === candidate.y) return true;
  if (source.y + source.h === candidate.y + candidate.h) return true;
  if (source.x === candidate.x) return true;
  if (source.x + source.w === candidate.x + candidate.w) return true;
  return false;
};

const makeGuide = (
  targetId: string,
  source: LayoutItem,
  target: LayoutItem,
  targetEdge: Edge,
  sourceEdge: Edge,
  predictRadius: number,
  snapThreshold: number,
  sectionSnap: boolean
): GridEditorGuide => {
  const spanStart = targetEdge.axis === "x"
    ? Math.min(source.y, target.y)
    : Math.min(source.x, target.x);
  const spanEnd = targetEdge.axis === "x"
    ? Math.max(source.y + source.h, target.y + target.h)
    : Math.max(source.x + source.w, target.x + target.w);
  const distance = Math.abs(targetEdge.position - sourceEdge.position);
  const proximity = predictRadius > 0
    ? Math.max(0, Math.min(1, 1 - distance / predictRadius))
    : distance === 0 ? 1 : 0;
  const isSnapped = distance <= snapThreshold;
  const sectionBoost = sectionSnap && isRowOrColumnMate(source, target) ? 20 : 0;
  return {
    id: `${targetId}:${targetEdge.kind}:${source.i}:${sourceEdge.kind}`,
    kind: targetEdge.kind,
    axis: targetEdge.axis,
    position: sourceEdge.position,
    sourceIds: [source.i],
    targetId,
    distance,
    priority: targetEdge.priority + sourceEdge.priority - sectionBoost,
    proximity,
    isPredictive: !isSnapped,
    isSnapped,
    anchorIds: [source.i, targetId],
    sourceEdge: sourceEdge.edge,
    targetEdge: targetEdge.edge,
    display: {
      kind: "alignment",
      start: spanStart,
      end: spanEnd,
      sourceIds: [source.i]
    }
  };
};

const isSpacingGuide = (guide: GridEditorGuide): boolean =>
  guide.kind === "spacing-x" || guide.kind === "spacing-y";

const isDebugEnabled = (options: GridEditorGuidesOptions): boolean =>
  options.debug === true || options.debug === "layer" || options.debug === "panel";

const debugModeFor = (options: GridEditorGuidesOptions): false | "layer" | "panel" => {
  if (options.debug === "panel") return "panel";
  if (options.debug === true || options.debug === "layer") return "layer";
  return false;
};

const maxVisibleGuidesFor = (
  options: GridEditorGuidesOptions,
  interaction: GridEditorGuideInteraction
): number => {
  const maxVisibleGuides = options.maxVisibleGuides;
  if (typeof maxVisibleGuides === "number") return Math.max(0, maxVisibleGuides);
  if (maxVisibleGuides && typeof maxVisibleGuides[interaction] === "number") {
    return Math.max(0, maxVisibleGuides[interaction] || 0);
  }
  return DEFAULT_DISPLAY_LIMITS[interaction];
};

const hasDisplayRange = (guide: GridEditorGuide): boolean =>
  Boolean(guide.display && Number.isFinite(guide.display.start) && Number.isFinite(guide.display.end) && guide.display.end > guide.display.start);

const guideDisplayRank = (
  guide: GridEditorGuide,
  snappedGuideIds: string[]
): number =>
  (snappedGuideIds.includes(guide.id) ? -1000 : 0) +
  (guide.isSnapped ? -500 : 0) +
  (isSpacingGuide(guide) ? 20 : 0) -
  Math.round((guide.proximity || 0) * 50);

const mergeAlignmentGuide = (
  base: GridEditorGuide,
  next: GridEditorGuide
): GridEditorGuide => {
  const sourceIds = Array.from(new Set([...base.sourceIds, ...next.sourceIds]));
  const anchorIds = base.anchorIds || next.anchorIds
    ? Array.from(new Set([...(base.anchorIds || []), ...(next.anchorIds || [])]))
    : undefined;
  return {
    ...base,
    sourceIds,
    anchorIds,
    display: base.display
      ? { ...base.display, sourceIds }
      : base.display
  };
};

export const filterGridEditorDisplayGuides = (
  guides: GridEditorGuide[],
  options: GridEditorGuidesOptions = {},
  snappedGuideIds: string[] = []
): GridEditorGuide[] => {
  const interaction = options.interaction || "drag";
  const limit = maxVisibleGuidesFor(options, interaction);
  if (limit <= 0) return [];

  const sorted = guides
    .filter(hasDisplayRange)
    .slice()
    .sort((a, b) =>
      guideDisplayRank(a, snappedGuideIds) - guideDisplayRank(b, snappedGuideIds) ||
      a.distance - b.distance ||
      a.priority - b.priority ||
      a.id.localeCompare(b.id)
    );

  const dedupedByKey = new Map<string, GridEditorGuide>();
  const order: string[] = [];
  for (let index = 0; index < sorted.length; index += 1) {
    const guide = sorted[index];
    const key = isSpacingGuide(guide)
      ? `s:${guide.kind}:${guide.position}:${guide.display?.start ?? ""}:${guide.display?.end ?? ""}`
      : `a:${guide.kind}:${guide.axis}:${guide.position}`;
    const existing = dedupedByKey.get(key);
    if (!existing) {
      dedupedByKey.set(key, guide);
      order.push(key);
    } else if (!isSpacingGuide(guide)) {
      dedupedByKey.set(key, mergeAlignmentGuide(existing, guide));
    }
  }

  const selected = order.slice(0, limit).map(key => dedupedByKey.get(key)!).filter(Boolean);

  let spacingLabelUsed = false;
  return selected.map(guide => {
    if (!guide.display) return guide;
    const showLabel = options.showSpacingLabels !== false &&
      isSpacingGuide(guide) &&
      !spacingLabelUsed;
    if (showLabel) spacingLabelUsed = true;
    return {
      ...guide,
      display: {
        ...guide.display,
        showLabel
      }
    };
  });
};

type NeighborProbe = {
  id: string;
  distance: number;
  span: { start: number; end: number };
  position: number;
};

const neighborOnSide = (
  side: GridEditorSpacingChipSide,
  candidate: LayoutItem,
  layout: Layout,
  metaById: GridEditorMetaById,
  options: GridEditorGuidesOptions
): NeighborProbe | null => {
  const candidateRight = candidate.x + candidate.w;
  const candidateBottom = candidate.y + candidate.h;
  let best: NeighborProbe | null = null;

  for (let index = 0; index < layout.length; index += 1) {
    const item = layout[index];
    if (item.i === candidate.i) continue;
    if (!shouldIncludeGuideSource(item, metaById, options)) continue;
    const itemRight = item.x + item.w;
    const itemBottom = item.y + item.h;

    if (side === "left" || side === "right") {
      const overlapStart = Math.max(candidate.y, item.y);
      const overlapEnd = Math.min(candidateBottom, itemBottom);
      if (overlapEnd <= overlapStart) continue;
      if (side === "left" && itemRight <= candidate.x) {
        const distance = candidate.x - itemRight;
        if (!best || distance < best.distance) {
          best = {
            id: item.i,
            distance,
            span: { start: itemRight, end: candidate.x },
            position: overlapStart + (overlapEnd - overlapStart) / 2
          };
        }
      } else if (side === "right" && item.x >= candidateRight) {
        const distance = item.x - candidateRight;
        if (!best || distance < best.distance) {
          best = {
            id: item.i,
            distance,
            span: { start: candidateRight, end: item.x },
            position: overlapStart + (overlapEnd - overlapStart) / 2
          };
        }
      }
    } else {
      const overlapStart = Math.max(candidate.x, item.x);
      const overlapEnd = Math.min(candidateRight, itemRight);
      if (overlapEnd <= overlapStart) continue;
      if (side === "top" && itemBottom <= candidate.y) {
        const distance = candidate.y - itemBottom;
        if (!best || distance < best.distance) {
          best = {
            id: item.i,
            distance,
            span: { start: itemBottom, end: candidate.y },
            position: overlapStart + (overlapEnd - overlapStart) / 2
          };
        }
      } else if (side === "bottom" && item.y >= candidateBottom) {
        const distance = item.y - candidateBottom;
        if (!best || distance < best.distance) {
          best = {
            id: item.i,
            distance,
            span: { start: candidateBottom, end: item.y },
            position: overlapStart + (overlapEnd - overlapStart) / 2
          };
        }
      }
    }
  }
  return best;
};

const sideToAxis = (side: GridEditorSpacingChipSide): "x" | "y" =>
  side === "left" || side === "right" ? "x" : "y";

const sideToUnit = (side: GridEditorSpacingChipSide): "col" | "row" =>
  side === "left" || side === "right" ? "col" : "row";

const computeSpacingChips = (
  candidate: LayoutItem,
  layout: Layout,
  metaById: GridEditorMetaById,
  options: GridEditorGuidesOptions
): GridEditorSpacingChip[] => {
  if (options.showSpacingChips === false) return [];
  const minDistance = options.spacingChipMinDistance ?? DEFAULT_SPACING_CHIP_MIN;
  const sides: GridEditorSpacingChipSide[] = ["top", "right", "bottom", "left"];
  const probes: Record<GridEditorSpacingChipSide, NeighborProbe | null> = {
    top: neighborOnSide("top", candidate, layout, metaById, options),
    right: neighborOnSide("right", candidate, layout, metaById, options),
    bottom: neighborOnSide("bottom", candidate, layout, metaById, options),
    left: neighborOnSide("left", candidate, layout, metaById, options)
  };

  const isEqualPair = (a: NeighborProbe | null, b: NeighborProbe | null): boolean =>
    Boolean(a && b && Math.abs(a.distance - b.distance) <= EQUAL_SPACING_TOLERANCE);

  const detectEqual = options.detectEqualSpacing !== false;
  const horizontalEqual = detectEqual && isEqualPair(probes.left, probes.right);
  const verticalEqual = detectEqual && isEqualPair(probes.top, probes.bottom);

  const chips: GridEditorSpacingChip[] = [];
  for (let index = 0; index < sides.length; index += 1) {
    const side = sides[index];
    const probe = probes[side];
    if (!probe) continue;
    if (probe.distance < minDistance) continue;
    const isEqual = side === "left" || side === "right" ? horizontalEqual : verticalEqual;
    chips.push({
      id: `chip:${candidate.i}:${side}:${probe.id}`,
      side,
      axis: sideToAxis(side),
      position: probe.position,
      span: probe.span,
      distance: probe.distance,
      unit: sideToUnit(side),
      isEqual,
      neighborId: probe.id
    });
  }
  return chips;
};

function computeMeasurementHud(
  candidate: LayoutItem,
  options: GridEditorGuidesOptions,
  interaction: GridEditorGuideInteraction
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
): GridEditorMeasurementHud | null {
  if (options.showMeasurementHud === false) return null;
  const labels: Record<string, string> = options.itemLabels || {};
  const hud: GridEditorMeasurementHud = {
    itemId: candidate.i,
    label: labels[candidate.i] || candidate.i,
    position: { x: candidate.x, y: candidate.y },
    size: { w: candidate.w, h: candidate.h },
    interaction
  };
  const start = options.startGeometry?.[candidate.i];
  if (options.delta) {
    hud.delta = options.delta;
  } else if (start) {
    hud.delta = {
      dx: candidate.x - start.x,
      dy: candidate.y - start.y,
      dw: candidate.w - start.w,
      dh: candidate.h - start.h
    };
  }
  if (options.blocked?.reason) hud.blocked = options.blocked.reason;
  if (options.blocked?.message) hud.blockedMessage = options.blocked.message;
  if (options.blocked?.itemIds) hud.blockedItemIds = options.blocked.itemIds;
  if (typeof options.selectionCount === "number") hud.selectionCount = options.selectionCount;
  return hud;
}

const computeAnchorEdges = (
  guides: GridEditorGuide[],
  activeId: string | null,
  options: GridEditorGuidesOptions
): GridEditorGuideAnchorEdge[] => {
  if (options.highlightAlignmentTargets === false) return [];
  if (!activeId) return [];
  const alignment = guides.filter(guide =>
    !isSpacingGuide(guide) && guide.targetEdge && guide.sourceEdge
  );
  const snapped = alignment.filter(guide => guide.isSnapped);
  const reference = snapped.length > 0
    ? snapped
    : alignment
        .slice()
        .sort((a, b) => (b.proximity || 0) - (a.proximity || 0))
        .slice(0, 1);

  const activeAxisSide = new Map<GridEditorGuideAxis, GridEditorGuideEdgeSide>();
  const sourceAxisSide = new Map<string, Map<GridEditorGuideAxis, GridEditorGuideEdgeSide>>();

  for (let index = 0; index < reference.length; index += 1) {
    const guide = reference[index];
    if (!guide.targetEdge || !guide.sourceEdge) continue;
    if (!activeAxisSide.has(guide.axis)) {
      activeAxisSide.set(guide.axis, guide.targetEdge);
    }
    for (let s = 0; s < guide.sourceIds.length; s += 1) {
      const sourceId = guide.sourceIds[s];
      if (!sourceAxisSide.has(sourceId)) sourceAxisSide.set(sourceId, new Map());
      const axisMap = sourceAxisSide.get(sourceId);
      if (!axisMap) continue;
      if (!axisMap.has(guide.axis)) axisMap.set(guide.axis, guide.sourceEdge);
    }
  }

  const result: GridEditorGuideAnchorEdge[] = [];
  if (activeAxisSide.size > 0) {
    result.push({
      itemId: activeId,
      sides: Array.from(activeAxisSide.values()),
      role: "active"
    });
  }
  sourceAxisSide.forEach((axisMap, sourceId) => {
    if (axisMap.size === 0) return;
    result.push({
      itemId: sourceId,
      sides: Array.from(axisMap.values()),
      role: "source"
    });
  });
  return result;
};

export const computeGridEditorGuideStateFromGeometry = (
  layout: Layout,
  activeItem: LayoutItem,
  candidateItem: LayoutItem,
  metaById: GridEditorMetaById = {},
  options: GridEditorGuidesOptions = {}
): GridEditorGuideState => {
  const start = now();
  const interaction = options.interaction || "drag";
  if (options.enabled === false) {
    return {
      activeId: activeItem.i,
      interaction,
      guides: [],
      displayGuides: [],
      snappedGuideIds: [],
      spacingLabelGuideIds: [],
      spacingChips: [],
      measurementHud: null,
      anchorEdges: [],
      showGrid: false,
      debug: false,
      debugMode: false
    };
  }

  const maxItems = options.maxItems ?? DEFAULT_MAX_ITEMS;
  const legacyThreshold = typeof options.thresholdPx === "number" ? options.thresholdPx : null;
  const predictRadiusX = options.predictRadiusX
    ?? (legacyThreshold !== null ? legacyThreshold : DEFAULT_PREDICT_RADIUS_X);
  const predictRadiusY = options.predictRadiusY
    ?? (legacyThreshold !== null ? legacyThreshold : DEFAULT_PREDICT_RADIUS_Y);
  const snapThreshold = options.snapThresholdCells
    ?? (legacyThreshold !== null ? legacyThreshold : DEFAULT_SNAP_THRESHOLD_CELLS);
  const sectionSnap = options.sectionSnap !== false;
  const sources = layout.filter(item =>
    item.i !== activeItem.i && shouldIncludeGuideSource(item, metaById, options)
  );
  const degraded = sources.length > maxItems;
  const limitedSources = degraded ? sources.slice(0, maxItems) : sources;
  const targetEdges = edgesForItem(candidateItem);
  const guides: GridEditorGuide[] = [];

  limitedSources.forEach(source => {
    const sourceEdges = edgesForItem(source);
    targetEdges.forEach(targetEdge => {
      sourceEdges.forEach(sourceEdge => {
        if (targetEdge.axis !== sourceEdge.axis) return;
        const distance = Math.abs(targetEdge.position - sourceEdge.position);
        const radius = targetEdge.axis === "x" ? predictRadiusX : predictRadiusY;
        if (distance <= radius) {
          guides.push(makeGuide(
            activeItem.i,
            source,
            candidateItem,
            targetEdge,
            sourceEdge,
            radius,
            snapThreshold,
            sectionSnap
          ));
        }
      });
    });
    spacingGuides(source, candidateItem).forEach(edge => {
      guides.push({
        id: `${activeItem.i}:${edge.kind}:${source.i}`,
        kind: edge.kind,
        axis: edge.axis,
        position: edge.position,
        sourceIds: [source.i],
        targetId: activeItem.i,
        distance: edge.distance,
        priority: edge.priority,
        proximity: edge.distance === 0 ? 1 : 0.5,
        isPredictive: edge.distance > snapThreshold,
        isSnapped: edge.distance <= snapThreshold,
        anchorIds: [source.i, activeItem.i],
        display: {
          kind: "spacing",
          start: edge.start,
          end: edge.end,
          label: edge.label,
          sourceIds: [source.i]
        }
      });
    });
  });

  guides.sort((a, b) =>
    a.distance - b.distance ||
    a.priority - b.priority ||
    a.id.localeCompare(b.id)
  );

  const snapCandidates = guides.filter(guide => !isSpacingGuide(guide) && guide.isSnapped);
  const snappedGuideIds = options.snap === false || snapCandidates.length === 0
    ? []
    : [snapCandidates[0].id];
  const displayGuides = filterGridEditorDisplayGuides(guides, options, snappedGuideIds);
  const debugMode = debugModeFor(options);
  const debug = isDebugEnabled(options);
  const spacingLabelGuideIds = displayGuides
    .filter(guide => guide.display?.showLabel)
    .map(guide => guide.id);
  const spacingChips = computeSpacingChips(candidateItem, layout, metaById, options);
  const measurementHud = computeMeasurementHud(candidateItem, options, interaction);
  const anchorEdges = computeAnchorEdges(displayGuides, activeItem.i, options);
  const predictCount = guides.filter(guide => guide.isPredictive && !isSpacingGuide(guide)).length;
  const snappedCount = snapCandidates.length;

  const durationMs = now() - start;
  const overBudget = typeof options.maxDurationMs === "number" && durationMs > options.maxDurationMs;
  return {
    activeId: activeItem.i,
    interaction,
    guides,
    displayGuides,
    debugGuides: debug ? guides : undefined,
    snappedGuideIds,
    spacingLabelGuideIds,
    spacingChips,
    measurementHud,
    anchorEdges,
    showGrid: options.showGrid !== false,
    debug,
    debugMode,
    diagnostics: {
      durationMs,
      itemCount: sources.length,
      degraded: degraded || overBudget,
      reason: degraded ? "max-items" : overBudget ? "max-duration" : undefined,
      fullGuideCount: guides.length,
      displayGuideCount: displayGuides.length,
      spacingLabelCount: spacingLabelGuideIds.length,
      predictCount,
      snappedCount,
      anchorEdgeCount: anchorEdges.length,
      spacingChipCount: spacingChips.length
    }
  };
};

export const computeGridEditorGuides = (
  layout: Layout,
  activeItem: LayoutItem,
  candidateItem: LayoutItem,
  metaById: GridEditorMetaById = {},
  options: GridEditorGuidesOptions = {}
): GridEditorGuideState => {
  const state = computeGridEditorIntelligence({
    layout,
    activeItem,
    candidateItem,
    selectionIds: [activeItem.i],
    metaById,
    cols: options.cols || 12,
    maxRows: options.maxRows,
    margin: options.margin,
    rowHeight: options.rowHeight,
    interaction: options.interaction || "drag",
    startGeometry: options.startGeometry,
    options
  });
  return state.guideState;
};

export const snapItemToGuides = (
  candidateItem: LayoutItem,
  guideState: GridEditorGuideState
): LayoutItem => {
  const snappedId = guideState.snappedGuideIds[0];
  if (!snappedId) return candidateItem;
  const guide = guideState.guides.find(item => item.id === snappedId);
  if (!guide) return candidateItem;
  if (isSpacingGuide(guide)) return candidateItem;

  if (guide.axis === "x") {
    if (guide.kind === "right") return { ...candidateItem, x: guide.position - candidateItem.w };
    if (guide.kind === "center-x") return { ...candidateItem, x: guide.position - candidateItem.w / 2 };
    return { ...candidateItem, x: guide.position };
  }

  if (guide.kind === "bottom") return { ...candidateItem, y: guide.position - candidateItem.h };
  if (guide.kind === "center-y") return { ...candidateItem, y: guide.position - candidateItem.h / 2 };
  return { ...candidateItem, y: guide.position };
};
