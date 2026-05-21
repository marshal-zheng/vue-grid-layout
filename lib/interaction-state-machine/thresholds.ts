import type {
  GridDragActivationDistance,
  GridPointerKind,
  GridPoint
} from "./types";

export const DEFAULT_DRAG_ACTIVATION_DISTANCE = {
  mouse: 4,
  pen: 4,
  touch: 8,
  coarse: 8,
  default: 4
} as const;

export function normalizeGridPointerKind(pointerKind?: string | null): GridPointerKind {
  if (pointerKind === "mouse" || pointerKind === "pen" || pointerKind === "touch") {
    return pointerKind;
  }
  if (pointerKind === "coarse") return "coarse";
  return "unknown";
}

export function resolveDragActivationDistance(
  distance: GridDragActivationDistance | undefined,
  pointerKind: GridPointerKind
): number {
  if (typeof distance === "number") return sanitizeDistance(distance);
  const configured = distance || DEFAULT_DRAG_ACTIVATION_DISTANCE;
  const fallback =
    configured.default ??
    DEFAULT_DRAG_ACTIVATION_DISTANCE.default;
  const value =
    pointerKind === "mouse" ? configured.mouse :
    pointerKind === "pen" ? configured.pen :
    pointerKind === "touch" ? configured.touch :
    pointerKind === "coarse" ? configured.coarse :
    undefined;
  return sanitizeDistance(value ?? fallback);
}

export function hasReachedDragActivationDistance(
  origin: GridPoint,
  current: GridPoint,
  threshold: number
): boolean {
  if (threshold <= 0) return true;
  const dx = current.x - origin.x;
  const dy = current.y - origin.y;
  return Math.sqrt((dx * dx) + (dy * dy)) >= threshold;
}

function sanitizeDistance(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}
