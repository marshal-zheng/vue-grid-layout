/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { collides } from "../utils";
import type { Layout, LayoutItem, ResizeHandleAxis } from "../utils";
import { rowColumnOccupancyStrategy } from "../layout-engine";
import { computeGridEditorGuideStateFromGeometry } from "./guides";
import { normalizeGridEditorSectionRows } from "./sectionRows";
import type {
  GridEditorDiagnosticCode,
  GridEditorDistributionCandidate,
  GridEditorDistributeMode,
  GridEditorDistributeStrategy,
  GridEditorGeometryIndex,
  GridEditorGuide,
  GridEditorGuideInteraction,
  GridEditorGuideState,
  GridEditorIntelligenceDiagnostics,
  GridEditorIntelligenceInput,
  GridEditorIntelligenceState,
  GridEditorItemRect,
  GridEditorMeasurementHud,
  GridEditorMetaById,
  GridEditorNeighborRelation,
  GridEditorResolvedSectionRowState,
  GridEditorSnapCandidate,
  GridEditorSnapResolveOptions,
  GridEditorSnapResolution,
  GridEditorSpacingRelation
} from "./types";

const DEFAULT_MAX_ITEMS = 500;
const DEFAULT_MAX_SNAP_CANDIDATES = 160;
const DEFAULT_MAX_DISTRIBUTION_CANDIDATES = 16;
const DEFAULT_MAX_SPACING_RELATIONS = 240;

const now = (): number => {
  const perf = typeof performance !== "undefined" ? performance : null;
  return perf && typeof perf.now === "function" ? perf.now() : Date.now();
};

const emptyGuideState = (
  activeId: string | null,
  interaction: GridEditorGuideInteraction,
  diagnostics?: GridEditorIntelligenceDiagnostics
): GridEditorGuideState => ({
  activeId,
  interaction,
  guides: [],
  displayGuides: [],
  debugGuides: undefined,
  snappedGuideIds: [],
  spacingLabelGuideIds: [],
  spacingChips: [],
  measurementHud: null,
  anchorEdges: [],
  showGrid: false,
  debug: false,
  debugMode: false,
  diagnostics: diagnostics
    ? {
        durationMs: diagnostics.durationMs,
        itemCount: diagnostics.itemCount,
        degraded: diagnostics.degraded,
        reason: diagnostics.reason,
        fullGuideCount: 0,
        displayGuideCount: 0,
        spacingLabelCount: 0,
        predictCount: 0,
        snappedCount: 0,
        anchorEdgeCount: 0,
        spacingChipCount: 0,
        intelligence: diagnostics
      }
    : undefined
});

const rectForItem = (
  item: LayoutItem,
  membership?: { sectionId?: string; rowId?: string }
): GridEditorItemRect => ({
  i: item.i,
  x: item.x,
  y: item.y,
  w: item.w,
  h: item.h,
  left: item.x,
  right: item.x + item.w,
  top: item.y,
  bottom: item.y + item.h,
  centerX: item.x + item.w / 2,
  centerY: item.y + item.h / 2,
  area: item.w * item.h,
  sectionId: membership?.sectionId,
  rowId: membership?.rowId
});

const buildGeometryIndex = (rects: Record<string, GridEditorItemRect>): GridEditorGeometryIndex => {
  const ids = Object.keys(rects).sort();
  const rows: Record<number, string[]> = {};
  const columns: Record<number, string[]> = {};
  ids.forEach(id => {
    const rect = rects[id];
    const rowStart = Math.floor(rect.top);
    const rowEnd = Math.max(rowStart, Math.floor(rect.bottom - 1));
    const colStart = Math.floor(rect.left);
    const colEnd = Math.max(colStart, Math.floor(rect.right - 1));
    for (let y = rowStart; y <= rowEnd; y++) {
      if (!rows[y]) rows[y] = [];
      rows[y].push(id);
    }
    for (let x = colStart; x <= colEnd; x++) {
      if (!columns[x]) columns[x] = [];
      columns[x].push(id);
    }
  });
  Object.keys(rows).forEach(key => rows[Number(key)].sort());
  Object.keys(columns).forEach(key => columns[Number(key)].sort());
  return { byId: rects, ids, rows, columns };
};

const axisOverlap = (
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): number => Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));

const neighborForPair = (
  source: GridEditorItemRect,
  target: GridEditorItemRect,
  axis: "x" | "y"
): GridEditorNeighborRelation | null => {
  if (axis === "x") {
    const overlap = axisOverlap(source.top, source.bottom, target.top, target.bottom);
    if (overlap <= 0) return null;
    const gap = target.left >= source.right
      ? target.left - source.right
      : source.left >= target.right
        ? source.left - target.right
        : 0;
    const direction = target.left >= source.right ? "after" : source.left >= target.right ? "before" : "overlap";
    return {
      id: `${source.i}:x:${target.i}`,
      sourceId: source.i,
      targetId: target.i,
      axis,
      direction,
      gap,
      overlap,
      priority: gap,
      sectionId: source.sectionId === target.sectionId ? source.sectionId : undefined,
      rowId: source.rowId === target.rowId ? source.rowId : undefined
    };
  }

  const overlap = axisOverlap(source.left, source.right, target.left, target.right);
  if (overlap <= 0) return null;
  const gap = target.top >= source.bottom
    ? target.top - source.bottom
    : source.top >= target.bottom
      ? source.top - target.bottom
      : 0;
  const direction = target.top >= source.bottom ? "after" : source.top >= target.bottom ? "before" : "overlap";
  return {
    id: `${source.i}:y:${target.i}`,
    sourceId: source.i,
    targetId: target.i,
    axis,
    direction,
    gap,
    overlap,
    priority: gap,
    sectionId: source.sectionId === target.sectionId ? source.sectionId : undefined,
    rowId: source.rowId === target.rowId ? source.rowId : undefined
  };
};

const buildNeighbors = (rects: Record<string, GridEditorItemRect>): GridEditorNeighborRelation[] => {
  const ids = Object.keys(rects).sort();
  const relations: GridEditorNeighborRelation[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = rects[ids[i]];
      const b = rects[ids[j]];
      const x = neighborForPair(a, b, "x");
      const y = neighborForPair(a, b, "y");
      if (x) relations.push(x);
      if (y) relations.push(y);
    }
  }
  return relations.sort((a, b) =>
    a.priority - b.priority ||
    a.axis.localeCompare(b.axis) ||
    a.sourceId.localeCompare(b.sourceId) ||
    a.targetId.localeCompare(b.targetId)
  );
};

const spacingSideFor = (
  relation: GridEditorNeighborRelation
): "left" | "right" | "top" | "bottom" => {
  if (relation.axis === "x") return relation.direction === "before" ? "left" : "right";
  return relation.direction === "before" ? "top" : "bottom";
};

const buildSpacingRelations = (
  rects: Record<string, GridEditorItemRect>,
  neighbors: GridEditorNeighborRelation[],
  limit: number
): GridEditorSpacingRelation[] => {
  const relations = neighbors
    .filter(relation => relation.gap > 0)
    .map(relation => {
      const source = rects[relation.sourceId];
      const target = rects[relation.targetId];
      const axis = relation.axis;
      const before = axis === "x"
        ? source.right <= target.left
        : source.bottom <= target.top;
      const start = axis === "x"
        ? before ? source.right : target.right
        : before ? source.bottom : target.bottom;
      const end = axis === "x"
        ? before ? target.left : source.left
        : before ? target.top : source.top;
      const position = axis === "x"
        ? Math.max(source.top, target.top) + relation.overlap / 2
        : Math.max(source.left, target.left) + relation.overlap / 2;
      return {
        id: `${relation.id}:spacing`,
        axis,
        sourceId: relation.sourceId,
        targetId: relation.targetId,
        side: spacingSideFor(relation),
        start,
        end,
        position,
        distance: relation.gap,
        unit: axis === "x" ? "col" : "row",
        sectionId: relation.sectionId,
        rowId: relation.rowId
      } as GridEditorSpacingRelation;
    });

  const byDistance = new Map<string, number>();
  relations.forEach(relation => {
    const key = `${relation.axis}:${relation.sectionId || ""}:${relation.rowId || ""}:${relation.distance}`;
    byDistance.set(key, (byDistance.get(key) || 0) + 1);
  });

  return relations
    .map(relation => {
      const key = `${relation.axis}:${relation.sectionId || ""}:${relation.rowId || ""}:${relation.distance}`;
      return {
        ...relation,
        isEqual: (byDistance.get(key) || 0) > 1,
        deviation: 0,
        mode: (relation.axis === "x" ? "spacing-x" : "spacing-y") as GridEditorDistributeMode
      };
    })
    .sort((a, b) =>
      a.distance - b.distance ||
      a.axis.localeCompare(b.axis) ||
      a.sourceId.localeCompare(b.sourceId) ||
      a.targetId.localeCompare(b.targetId)
    )
    .slice(0, limit);
};

const modeForAxis = (axis: "x" | "y"): GridEditorDistributeMode =>
  axis === "x" ? "horizontal" : "vertical";

const spacingModeForAxis = (axis: "x" | "y"): GridEditorDistributeMode =>
  axis === "x" ? "spacing-x" : "spacing-y";

const distributionFor = (
  rects: GridEditorItemRect[],
  axis: "x" | "y",
  strategy: GridEditorDistributeStrategy,
  mode: GridEditorDistributeMode
): GridEditorDistributionCandidate | null => {
  if (rects.length < 3) return null;
  const sorted = rects.slice().sort((a, b) =>
    axis === "x"
      ? a.left - b.left || a.i.localeCompare(b.i)
      : a.top - b.top || a.i.localeCompare(b.i)
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const bounds = axis === "x"
    ? { start: first.left, end: last.right }
    : { start: first.top, end: last.bottom };
  const currentSpacing: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const next = sorted[i];
    currentSpacing.push(strategy === "center-to-center"
      ? (axis === "x" ? next.centerX - prev.centerX : next.centerY - prev.centerY)
      : (axis === "x" ? next.left - prev.right : next.top - prev.bottom));
  }
  const targetSpacing = currentSpacing.length > 0
    ? currentSpacing.reduce((sum, value) => sum + value, 0) / currentSpacing.length
    : 0;
  const deviation = currentSpacing.reduce(
    (max, value) => Math.max(max, Math.abs(value - targetSpacing)),
    0
  );
  const sectionIds = Array.from(new Set(sorted.map(rect => rect.sectionId).filter(Boolean)));
  const rowIds = Array.from(new Set(sorted.map(rect => rect.rowId).filter(Boolean)));
  return {
    id: `${mode}:${strategy}:${sorted.map(rect => rect.i).join(",")}`,
    mode,
    axis,
    strategy,
    itemIds: sorted.map(rect => rect.i),
    movableIds: sorted.slice(1, -1).map(rect => rect.i),
    currentSpacing,
    targetSpacing,
    isEqual: deviation <= 0.01,
    deviation,
    bounds,
    anchor: { type: "selection" },
    sectionId: sectionIds.length === 1 ? sectionIds[0] : undefined,
    rowId: rowIds.length === 1 ? rowIds[0] : undefined
  };
};

export const computeGridEditorDistribution = (
  input: GridEditorIntelligenceInput
): GridEditorDistributionCandidate[] => {
  const sectionRows = normalizeGridEditorSectionRows(input.sectionRows, input.layout);
  const selected = new Set(input.selectionIds || []);
  const rects = input.layout
    .filter(item => selected.size === 0 || selected.has(item.i))
    .map(item => rectForItem(item, sectionRows.itemMembership[item.i]));
  if (rects.length < 3) return [];
  const candidates = [
    distributionFor(rects, "x", "edge-to-edge", modeForAxis("x")),
    distributionFor(rects, "y", "edge-to-edge", modeForAxis("y")),
    distributionFor(rects, "x", "center-to-center", spacingModeForAxis("x")),
    distributionFor(rects, "y", "center-to-center", spacingModeForAxis("y"))
  ].filter(Boolean) as GridEditorDistributionCandidate[];
  const limit = input.options?.maxDistributionCandidates ?? DEFAULT_MAX_DISTRIBUTION_CANDIDATES;
  return candidates
    .sort((a, b) => a.deviation - b.deviation || a.id.localeCompare(b.id))
    .slice(0, limit);
};

const geometryForGuide = (
  guide: GridEditorGuide,
  candidate: LayoutItem,
  interaction: GridEditorIntelligenceInput["interaction"],
  resizeHandle?: ResizeHandleAxis
): Pick<LayoutItem, "x" | "y" | "w" | "h"> => {
  const geometry = { x: candidate.x, y: candidate.y, w: candidate.w, h: candidate.h };
  if (guide.kind === "spacing-x" || guide.kind === "spacing-y") return geometry;
  const westHandle = resizeHandle === "w" || resizeHandle === "sw" || resizeHandle === "nw";
  const northHandle = resizeHandle === "n" || resizeHandle === "ne" || resizeHandle === "nw";
  if (interaction === "resize") {
    if (guide.kind === "right") return { ...geometry, w: Math.max(1, guide.position - candidate.x) };
    if (guide.kind === "bottom") return { ...geometry, h: Math.max(1, guide.position - candidate.y) };
    if (guide.kind === "left" && westHandle) {
      const right = candidate.x + candidate.w;
      return { ...geometry, x: guide.position, w: Math.max(1, right - guide.position) };
    }
    if (guide.kind === "top" && northHandle) {
      const bottom = candidate.y + candidate.h;
      return { ...geometry, y: guide.position, h: Math.max(1, bottom - guide.position) };
    }
  }
  if (guide.axis === "x") {
    if (guide.kind === "right") return { ...geometry, x: guide.position - candidate.w };
    if (guide.kind === "center-x") return { ...geometry, x: guide.position - candidate.w / 2 };
    return { ...geometry, x: guide.position };
  }
  if (guide.kind === "bottom") return { ...geometry, y: guide.position - candidate.h };
  if (guide.kind === "center-y") return { ...geometry, y: guide.position - candidate.h / 2 };
  return { ...geometry, y: guide.position };
};

const snapThresholdForOptions = (input: GridEditorIntelligenceInput): number => {
  const threshold = input.options?.snapThresholdCells ?? input.options?.thresholdPx;
  return typeof threshold === "number" && Number.isFinite(threshold)
    ? threshold
    : 0.5;
};

const shouldBlockCrossScope = (
  sectionRows: GridEditorResolvedSectionRowState,
  sourceId: string,
  targetId: string,
  allowCrossSectionRow?: boolean
): boolean => {
  if (allowCrossSectionRow === true) return false;
  const source = sectionRows.itemMembership[sourceId];
  const target = sectionRows.itemMembership[targetId];
  if (!source || !target) return false;
  if (source.sectionId && target.sectionId && source.sectionId !== target.sectionId) {
    const sourceSection = sectionRows.items[source.sectionId];
    const targetSection = sectionRows.items[target.sectionId];
    return sourceSection?.crossScopePolicy !== "allow" && targetSection?.crossScopePolicy !== "allow";
  }
  if (source.rowId && target.rowId && source.rowId !== target.rowId) {
    const sourceRow = sectionRows.items[source.rowId];
    const targetRow = sectionRows.items[target.rowId];
    return sourceRow?.crossScopePolicy !== "allow" && targetRow?.crossScopePolicy !== "allow";
  }
  return false;
};

const buildSpacingSnapCandidates = (
  input: GridEditorIntelligenceInput,
  candidateItem: LayoutItem | null | undefined,
  spacingRelations: GridEditorSpacingRelation[],
  sectionRows: GridEditorResolvedSectionRowState,
  limit: number
): GridEditorSnapCandidate[] => {
  if (!candidateItem) return [];
  const threshold = snapThresholdForOptions(input);
  const sources = input.layout
    .filter(item => item.i !== candidateItem.i)
    .sort((a, b) => a.i.localeCompare(b.i));
  const baselines = spacingRelations
    .filter(relation => relation.sourceId !== candidateItem.i && relation.targetId !== candidateItem.i && relation.distance > 0)
    .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
  const candidates: GridEditorSnapCandidate[] = [];
  const candidateRight = candidateItem.x + candidateItem.w;
  const candidateBottom = candidateItem.y + candidateItem.h;

  sources.forEach(source => {
    const sourceRight = source.x + source.w;
    const sourceBottom = source.y + source.h;
    const overlapY = axisOverlap(candidateItem.y, candidateBottom, source.y, sourceBottom) > 0;
    const overlapX = axisOverlap(candidateItem.x, candidateRight, source.x, sourceRight) > 0;
    const sourceBeforeX = sourceRight <= candidateItem.x;
    const sourceAfterX = candidateRight <= source.x;
    const sourceBeforeY = sourceBottom <= candidateItem.y;
    const sourceAfterY = candidateBottom <= source.y;
    baselines.forEach(relation => {
      if (relation.axis === "x" && overlapY && (sourceBeforeX || sourceAfterX)) {
        const currentGap = sourceBeforeX ? candidateItem.x - sourceRight : source.x - candidateRight;
        const delta = Math.abs(currentGap - relation.distance);
        if (delta <= threshold) {
          const x = sourceBeforeX
            ? sourceRight + relation.distance
            : source.x - relation.distance - candidateItem.w;
          const blocked = shouldBlockCrossScope(
            sectionRows,
            source.i,
            candidateItem.i,
            input.options?.allowCrossSectionRow
          ) ? "section-row-policy" : undefined;
          candidates.push({
            id: `snap:spacing:x:${candidateItem.i}:${source.i}:${relation.id}`,
            kind: "spacing",
            axis: "x",
            sourceIds: [source.i, relation.sourceId, relation.targetId],
            targetId: candidateItem.i,
            targetEdge: sourceBeforeX ? "left" : "right",
            sourceEdge: sourceBeforeX ? "right" : "left",
            distance: delta,
            proximity: threshold === 0 ? 1 : 1 - Math.min(1, delta / threshold),
            priority: 30 + delta,
            snapped: !blocked,
            geometry: { x, y: candidateItem.y, w: candidateItem.w, h: candidateItem.h },
            guideIds: [],
            sectionId: sectionRows.itemMembership[candidateItem.i]?.sectionId,
            rowId: sectionRows.itemMembership[candidateItem.i]?.rowId,
            blocked
          });
        }
      }
      if (relation.axis === "y" && overlapX && (sourceBeforeY || sourceAfterY)) {
        const currentGap = sourceBeforeY ? candidateItem.y - sourceBottom : source.y - candidateBottom;
        const delta = Math.abs(currentGap - relation.distance);
        if (delta <= threshold) {
          const y = sourceBeforeY
            ? sourceBottom + relation.distance
            : source.y - relation.distance - candidateItem.h;
          const blocked = shouldBlockCrossScope(
            sectionRows,
            source.i,
            candidateItem.i,
            input.options?.allowCrossSectionRow
          ) ? "section-row-policy" : undefined;
          candidates.push({
            id: `snap:spacing:y:${candidateItem.i}:${source.i}:${relation.id}`,
            kind: "spacing",
            axis: "y",
            sourceIds: [source.i, relation.sourceId, relation.targetId],
            targetId: candidateItem.i,
            targetEdge: sourceBeforeY ? "top" : "bottom",
            sourceEdge: sourceBeforeY ? "bottom" : "top",
            distance: delta,
            proximity: threshold === 0 ? 1 : 1 - Math.min(1, delta / threshold),
            priority: 30 + delta,
            snapped: !blocked,
            geometry: { x: candidateItem.x, y, w: candidateItem.w, h: candidateItem.h },
            guideIds: [],
            sectionId: sectionRows.itemMembership[candidateItem.i]?.sectionId,
            rowId: sectionRows.itemMembership[candidateItem.i]?.rowId,
            blocked
          });
        }
      }
    });
  });

  return candidates
    .sort((a, b) =>
      a.priority - b.priority ||
      b.proximity - a.proximity ||
      a.distance - b.distance ||
      a.id.localeCompare(b.id)
    )
    .slice(0, limit);
};

const buildSectionRowSnapCandidates = (
  input: GridEditorIntelligenceInput,
  candidateItem: LayoutItem | null | undefined,
  sectionRows: GridEditorResolvedSectionRowState,
  limit: number
): GridEditorSnapCandidate[] => {
  if (!candidateItem) return [];
  const threshold = snapThresholdForOptions(input);
  const candidates: GridEditorSnapCandidate[] = [];
  const candidateEdges = [
    { axis: "x" as const, edge: "left" as const, position: candidateItem.x },
    { axis: "x" as const, edge: "right" as const, position: candidateItem.x + candidateItem.w },
    { axis: "x" as const, edge: "center-x" as const, position: candidateItem.x + candidateItem.w / 2 },
    { axis: "y" as const, edge: "top" as const, position: candidateItem.y },
    { axis: "y" as const, edge: "bottom" as const, position: candidateItem.y + candidateItem.h },
    { axis: "y" as const, edge: "center-y" as const, position: candidateItem.y + candidateItem.h / 2 }
  ];
  const rows = Object.values(sectionRows.items)
    .filter(row => row.bounds && row.dropPolicy !== "none")
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

  rows.forEach(row => {
    if (!row.bounds) return;
    const boundsEdges = [
      { axis: "x" as const, edge: "left" as const, position: row.bounds.x },
      { axis: "x" as const, edge: "right" as const, position: row.bounds.x + row.bounds.w },
      { axis: "x" as const, edge: "center-x" as const, position: row.bounds.x + row.bounds.w / 2 },
      { axis: "y" as const, edge: "top" as const, position: row.bounds.y },
      { axis: "y" as const, edge: "bottom" as const, position: row.bounds.y + row.bounds.h },
      { axis: "y" as const, edge: "center-y" as const, position: row.bounds.y + row.bounds.h / 2 }
    ];
    candidateEdges.forEach(targetEdge => {
      boundsEdges.forEach(sourceEdge => {
        if (targetEdge.axis !== sourceEdge.axis) return;
        const distance = Math.abs(targetEdge.position - sourceEdge.position);
        if (distance > threshold) return;
        const geometry = { x: candidateItem.x, y: candidateItem.y, w: candidateItem.w, h: candidateItem.h };
        if (targetEdge.axis === "x") {
          if (targetEdge.edge === "right") geometry.x = sourceEdge.position - candidateItem.w;
          else if (targetEdge.edge === "center-x") geometry.x = sourceEdge.position - candidateItem.w / 2;
          else geometry.x = sourceEdge.position;
        } else if (targetEdge.edge === "bottom") {
          geometry.y = sourceEdge.position - candidateItem.h;
        } else if (targetEdge.edge === "center-y") {
          geometry.y = sourceEdge.position - candidateItem.h / 2;
        } else {
          geometry.y = sourceEdge.position;
        }
        candidates.push({
          id: `snap:section-row:${row.id}:${targetEdge.edge}:${sourceEdge.edge}`,
          kind: "section-row",
          axis: targetEdge.axis,
          sourceIds: [row.id],
          targetId: candidateItem.i,
          targetEdge: targetEdge.edge,
          sourceEdge: sourceEdge.edge,
          distance,
          proximity: threshold === 0 ? 1 : 1 - Math.min(1, distance / threshold),
          priority: row.kind === "row" ? -20 + distance : -15 + distance,
          snapped: true,
          geometry,
          guideIds: [],
          sectionId: row.kind === "section" ? row.id : row.parentId,
          rowId: row.kind === "row" ? row.id : undefined,
          blocked: row.locked || row.collapsed ? row.locked ? "section-row-locked" : "section-row-collapsed" : undefined
        });
      });
    });
  });

  return candidates
    .sort((a, b) =>
      a.priority - b.priority ||
      b.proximity - a.proximity ||
      a.distance - b.distance ||
      a.id.localeCompare(b.id)
    )
    .slice(0, limit);
};

const snapCandidatesFromGuideState = (
  guideState: GridEditorGuideState,
  candidateItem: LayoutItem | null | undefined,
  snapEnabled: boolean,
  limit: number,
  sectionRows: GridEditorResolvedSectionRowState,
  interaction: GridEditorIntelligenceInput["interaction"],
  resizeHandle?: ResizeHandleAxis,
  allowCrossSectionRow?: boolean
): GridEditorSnapCandidate[] => {
  if (!candidateItem) return [];
  return guideState.guides
    .map(guide => {
      const kind = guide.kind === "spacing-x" || guide.kind === "spacing-y"
        ? "spacing"
        : guide.kind === "center-x" || guide.kind === "center-y"
          ? "center"
          : "edge";
      const membership = sectionRows.itemMembership[candidateItem.i];
      const crossScope = guide.sourceIds.some(id =>
        shouldBlockCrossScope(sectionRows, id, candidateItem.i, allowCrossSectionRow)
      );
      return {
        id: `snap:${guide.id}`,
        kind,
        axis: guide.axis,
        sourceIds: guide.sourceIds,
        targetId: guide.targetId,
        targetEdge: guide.targetEdge || (guide.axis === "x" ? "left" : "top"),
        sourceEdge: guide.sourceEdge,
        distance: guide.distance,
        proximity: guide.proximity || 0,
        priority: guide.priority,
        snapped: snapEnabled && guide.isSnapped === true && kind !== "spacing" && !crossScope,
        geometry: geometryForGuide(guide, candidateItem, interaction, resizeHandle),
        guideIds: [guide.id],
        sectionId: membership?.sectionId,
        rowId: membership?.rowId,
        blocked: crossScope ? "section-row-policy" : undefined
      } as GridEditorSnapCandidate;
    })
    .sort((a, b) =>
      (a.snapped === b.snapped ? 0 : a.snapped ? -1 : 1) ||
      a.distance - b.distance ||
      a.priority - b.priority ||
      a.id.localeCompare(b.id)
    )
    .slice(0, limit);
};

const buildFilteredDiagnostics = (
  layout: Layout,
  metaById: GridEditorMetaById
): NonNullable<GridEditorIntelligenceDiagnostics["filtered"]> => {
  const filtered: NonNullable<GridEditorIntelligenceDiagnostics["filtered"]> = [];
  layout.forEach(item => {
    const meta = metaById[item.i];
    if (meta?.visible === false) {
      filtered.push({ code: "grid-editor.intelligence.filtered.hidden", itemIds: [item.i], reason: "hidden" });
    }
    if (meta?.locked) {
      filtered.push({ code: "grid-editor.intelligence.filtered.locked", itemIds: [item.i], reason: "locked" });
    }
    if (item.static) {
      filtered.push({ code: "grid-editor.intelligence.filtered.static", itemIds: [item.i], reason: "static-item" });
    }
  });
  return filtered;
};

export const computeGridEditorIntelligence = (
  input: GridEditorIntelligenceInput
): GridEditorIntelligenceState => {
  const start = now();
  const maxItems = input.options?.maxItems ?? DEFAULT_MAX_ITEMS;
  const maxSnapCandidates = input.options?.maxSnapCandidates ?? DEFAULT_MAX_SNAP_CANDIDATES;
  const maxSpacingRelations = input.options?.maxVisibleGuides
    ? DEFAULT_MAX_SPACING_RELATIONS
    : DEFAULT_MAX_SPACING_RELATIONS;
  const metaById = input.metaById || {};
  const sectionRows = normalizeGridEditorSectionRows(input.sectionRows, input.layout);
  const limitedLayout = input.layout.length > maxItems
    ? input.layout.slice(0, maxItems)
    : input.layout.slice();

  const occupancyIndex = rowColumnOccupancyStrategy().build(limitedLayout, {
    cols: input.cols,
    maxRows: input.maxRows,
    compactType: input.compactType,
    allowOverlap: input.allowOverlap,
    preventCollision: input.preventCollision
  });
  const indexedLayout = occupancyIndex.getLayout();

  const itemRects: Record<string, GridEditorItemRect> = {};
  indexedLayout.forEach(item => {
    itemRects[item.i] = rectForItem(item, sectionRows.itemMembership[item.i]);
  });
  if (input.candidateItem && !itemRects[input.candidateItem.i]) {
    itemRects[input.candidateItem.i] = rectForItem(
      input.candidateItem,
      sectionRows.itemMembership[input.candidateItem.i]
    );
  }

  const geometryIndex = buildGeometryIndex(itemRects);
  const neighbors = buildNeighbors(itemRects);
  const spacingRelations = buildSpacingRelations(itemRects, neighbors, maxSpacingRelations);
  const distributionCandidates = computeGridEditorDistribution(input);
  const interaction: GridEditorGuideInteraction = input.interaction === "toolbar"
    ? "api"
    : input.interaction;
  const guideState = input.activeItem && input.candidateItem
    ? computeGridEditorGuideStateFromGeometry(input.layout, input.activeItem, input.candidateItem, metaById, {
        ...input.options,
        interaction
      })
    : emptyGuideState(input.activeItem?.i || null, interaction);
  const snapEnabled = input.options?.snap !== false;
  const guideSnapCandidates = snapCandidatesFromGuideState(
    guideState,
    input.candidateItem,
    snapEnabled,
    maxSnapCandidates,
    sectionRows,
    input.interaction,
    input.options?.resizeHandle,
    input.options?.allowCrossSectionRow
  );
  const spacingSnapCandidates = buildSpacingSnapCandidates(
    input,
    input.candidateItem,
    spacingRelations,
    sectionRows,
    maxSnapCandidates
  );
  const sectionRowSnapCandidates = buildSectionRowSnapCandidates(
    input,
    input.candidateItem,
    sectionRows,
    maxSnapCandidates
  );
  const snapCandidates = [
    ...sectionRowSnapCandidates,
    ...spacingSnapCandidates,
    ...guideSnapCandidates
  ]
    .map(candidate => snapEnabled ? candidate : { ...candidate, snapped: false })
    .sort((a, b) =>
      a.priority - b.priority ||
      b.proximity - a.proximity ||
      a.distance - b.distance ||
      a.id.localeCompare(b.id)
    )
    .slice(0, maxSnapCandidates);

  const durationMs = now() - start;
  const durationOverBudget = typeof input.options?.maxDurationMs === "number" &&
    durationMs > input.options.maxDurationMs;
  const degraded = input.layout.length > maxItems || durationOverBudget ||
    Boolean(guideState.diagnostics?.degraded);
  const reason = input.layout.length > maxItems
    ? "max-items"
    : durationOverBudget
      ? "max-duration"
      : guideState.diagnostics?.reason === "max-items" || guideState.diagnostics?.reason === "max-duration"
        ? guideState.diagnostics.reason
        : undefined;
  const filtered = buildFilteredDiagnostics(input.layout, metaById);
  const codes: GridEditorDiagnosticCode[] = ["grid-editor.intelligence.computed"];
  if (input.layout.length > maxItems) codes.push("grid-editor.intelligence.degraded.max-items");
  if (durationOverBudget) codes.push("grid-editor.intelligence.degraded.max-duration");
  if (distributionCandidates.some(candidate => candidate.isEqual)) {
    codes.push("grid-editor.distribution.equal");
  } else if (distributionCandidates.length > 0) {
    codes.push("grid-editor.distribution.unequal");
  }
  sectionRows.warnings.forEach(warning => codes.push(warning.code));
  filtered.forEach(entry => codes.push(entry.code));

  const diagnostics: GridEditorIntelligenceDiagnostics = {
    durationMs,
    itemCount: input.layout.length,
    selectedCount: input.selectionIds?.length || 0,
    candidateCount: snapCandidates.length + distributionCandidates.length,
    snapCandidateCount: snapCandidates.length,
    distributionCandidateCount: distributionCandidates.length,
    spacingRelationCount: spacingRelations.length,
    sectionRowCount: Object.keys(sectionRows.items).length,
    snapSource: snapCandidates.find(candidate => candidate.snapped)?.kind || "none",
    distributionMode: distributionCandidates[0]?.mode || "none",
    sectionRowSource: Object.keys(sectionRows.items).length > 0 ? "metadata" : "none",
    degraded,
    reason,
    filtered,
    codes
  };

  const measurementHud: GridEditorMeasurementHud | null | undefined = guideState.measurementHud;
  const nextGuideState: GridEditorGuideState = {
    ...guideState,
    diagnostics: {
      ...(guideState.diagnostics || {
        durationMs,
        itemCount: input.layout.length
      }),
      intelligence: diagnostics
    }
  };

  return {
    itemRects,
    geometryIndex,
    neighbors,
    snapCandidates,
    spacingRelations,
    distributionCandidates,
    sectionRows,
    guideState: nextGuideState,
    measurementHud,
    diagnostics
  };
};

const diagnosticWithCode = (
  diagnostics: GridEditorIntelligenceDiagnostics,
  code: GridEditorDiagnosticCode,
  reason?: GridEditorIntelligenceDiagnostics["reason"]
): GridEditorIntelligenceDiagnostics => ({
  ...diagnostics,
  degraded: diagnostics.degraded || Boolean(reason),
  reason: reason || diagnostics.reason,
  codes: diagnostics.codes.includes(code)
    ? diagnostics.codes
    : [...diagnostics.codes, code]
});

const blockedCodeFor = (reason: string): GridEditorDiagnosticCode => {
  if (reason === "collision") return "grid-editor.snap.blocked.collision";
  if (reason === "bounds") return "grid-editor.snap.blocked.bounds";
  if (reason === "maxRows") return "grid-editor.snap.blocked.maxRows";
  if (reason === "section-row-policy") return "grid-editor.snap.blocked.section-row-policy";
  return `grid-editor.snap.blocked.${reason}`;
};

const validateSnapGeometry = (
  geometry: Pick<LayoutItem, "x" | "y" | "w" | "h">,
  candidateItem: LayoutItem,
  snapCandidate: GridEditorSnapCandidate,
  options: GridEditorSnapResolveOptions
): GridEditorSnapCandidate["blocked"] | null => {
  const customReason = options.validate?.(geometry, snapCandidate);
  if (customReason) return customReason;
  if (snapCandidate.blocked) return snapCandidate.blocked;
  const meta = options.metaById?.[candidateItem.i];
  if (meta?.locked) return "locked";
  if (meta?.visible === false) return "hidden";
  if (candidateItem.static) return "static-item";
  if (geometry.x < 0 || geometry.y < 0) return "bounds";
  if (typeof options.cols === "number" && geometry.x + geometry.w > options.cols) return "bounds";
  if (
    typeof options.maxRows === "number" &&
    Number.isFinite(options.maxRows) &&
    geometry.y + geometry.h > options.maxRows
  ) {
    return "maxRows";
  }
  if (options.allowOverlap !== true && options.layout) {
    const placed: LayoutItem = { ...candidateItem, ...geometry };
    const hit = options.layout.find(item => item.i !== candidateItem.i && collides(item, placed));
    if (hit) return "collision";
  }
  return null;
};

export const resolveGridEditorSnap = (
  state: GridEditorIntelligenceState,
  candidateItem: LayoutItem,
  options: GridEditorSnapResolveOptions = {}
): GridEditorSnapResolution => {
  const original = {
    x: candidateItem.x,
    y: candidateItem.y,
    w: candidateItem.w,
    h: candidateItem.h
  };
  if (options.snap === false) {
    return {
      status: "disabled",
      geometry: original,
      guideIds: [],
      previousGuideId: options.previousGuideId,
      diagnostics: diagnosticWithCode(state.diagnostics, "grid-editor.snap.disabled")
    };
  }

  const candidates = state.snapCandidates
    .filter(candidate => candidate.snapped || Boolean(candidate.blocked))
    .sort((a, b) =>
      a.priority - b.priority ||
      b.proximity - a.proximity ||
      a.distance - b.distance ||
      (a.blocked === b.blocked ? 0 : a.blocked ? 1 : -1) ||
      a.id.localeCompare(b.id)
    );

  if (candidates.length === 0) {
    return {
      status: "none",
      geometry: original,
      guideIds: [],
      previousGuideId: options.previousGuideId,
      diagnostics: state.diagnostics
    };
  }

  const blocked: Array<{ candidate: GridEditorSnapCandidate; reason: NonNullable<GridEditorSnapCandidate["blocked"]> }> = [];
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const reason = validateSnapGeometry(candidate.geometry, candidateItem, candidate, options);
    if (reason) {
      blocked.push({ candidate, reason });
      continue;
    }
    return {
      status: "snapped",
      candidate,
      geometry: candidate.geometry,
      guideIds: candidate.guideIds,
      previousGuideId: options.previousGuideId,
      nextGuideId: candidate.guideIds[0],
      snapKind: candidate.kind,
      diagnostics: diagnosticWithCode(state.diagnostics, "grid-editor.snap.selected")
    };
  }

  const firstBlocked = blocked[0];
  const reason = firstBlocked?.reason || "invalid-input";
  return {
    status: "blocked",
    candidate: firstBlocked?.candidate,
    geometry: original,
    guideIds: [],
    previousGuideId: options.previousGuideId,
    blocked: {
      reason,
      itemIds: [candidateItem.i],
      message: `Snap candidate blocked by ${reason}.`
    },
    diagnostics: diagnosticWithCode(
      state.diagnostics,
      blockedCodeFor(reason),
      reason === "bounds" || reason === "collision" || reason === "maxRows"
        ? reason
        : undefined
    )
  };
};
