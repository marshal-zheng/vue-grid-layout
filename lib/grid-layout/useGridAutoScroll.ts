type AutoScrollOptions = {
  margin: number;
  speed: number;
};

type AutoScrollConfig = boolean | { margin?: number; speed?: number } | undefined;
type ScrollContainer = HTMLElement | Window;

type UseGridAutoScrollOptions = {
  getConfig: () => AutoScrollConfig;
  rootClassName: string;
};

const DEFAULT_AUTO_SCROLL_OPTIONS: AutoScrollOptions = {
  margin: 48,
  speed: 20
};

export function useGridAutoScroll({
  getConfig,
  rootClassName
}: UseGridAutoScrollOptions) {
  const supportsRAF =
    typeof requestAnimationFrame === "function" &&
    typeof cancelAnimationFrame === "function";

  let autoScrollOptions: AutoScrollOptions | null = null;
  let autoScrollContainer: ScrollContainer | null = null;
  let autoScrollRaf: number | null = null;
  let pendingAutoScroll:
    | { container: ScrollContainer; dx: number; dy: number }
    | null = null;

  const resolveOptions = (): AutoScrollOptions | null => {
    const config = getConfig();
    if (!config) return null;
    if (config === true) return DEFAULT_AUTO_SCROLL_OPTIONS;
    if (typeof config !== "object") return null;

    const margin =
      typeof config.margin === "number" && Number.isFinite(config.margin)
        ? config.margin
        : DEFAULT_AUTO_SCROLL_OPTIONS.margin;
    const speed =
      typeof config.speed === "number" && Number.isFinite(config.speed)
        ? config.speed
        : DEFAULT_AUTO_SCROLL_OPTIONS.speed;

    if (margin <= 0 || speed <= 0) return null;
    return { margin, speed };
  };

  const cancel = () => {
    if (autoScrollRaf != null && supportsRAF) {
      cancelAnimationFrame(autoScrollRaf);
    }
    autoScrollRaf = null;
    pendingAutoScroll = null;
  };

  const reset = () => {
    cancel();
    autoScrollContainer = null;
    autoScrollOptions = null;
  };

  const getClientPoint = (event: Event): { x: number; y: number } | null => {
    const anyEvent = event as unknown as {
      clientX?: number;
      clientY?: number;
      touches?: ArrayLike<{ clientX: number; clientY: number }>;
      changedTouches?: ArrayLike<{ clientX: number; clientY: number }>;
    };
    if (typeof anyEvent.clientX === "number" && typeof anyEvent.clientY === "number") {
      return { x: anyEvent.clientX, y: anyEvent.clientY };
    }
    const touch = anyEvent.touches?.[0] || anyEvent.changedTouches?.[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const findScrollContainer = (startNode: HTMLElement): ScrollContainer => {
    const doc = startNode.ownerDocument;
    const win = doc?.defaultView;
    if (!win) return startNode;

    let current: HTMLElement | null = startNode;
    while (current) {
      const style = win.getComputedStyle(current);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;
      const canScrollY =
        (overflowY === "auto" || overflowY === "scroll") &&
        current.scrollHeight > current.clientHeight + 1;
      const canScrollX =
        (overflowX === "auto" || overflowX === "scroll") &&
        current.scrollWidth > current.clientWidth + 1;
      if (canScrollY || canScrollX) return current;
      current = current.parentElement;
    }

    return win;
  };

  const init = (node: HTMLElement) => {
    autoScrollOptions = resolveOptions();
    autoScrollContainer = null;
    cancel();
    if (!autoScrollOptions) return;

    const grid = node.closest?.(`.${rootClassName}`);
    const startNode = grid instanceof HTMLElement ? grid : node;
    autoScrollContainer = findScrollContainer(startNode);
  };

  const flush = () => {
    autoScrollRaf = null;
    const pending = pendingAutoScroll;
    pendingAutoScroll = null;
    if (!pending) return;

    const { container, dx, dy } = pending;
    if (dx === 0 && dy === 0) return;

    if (container instanceof HTMLElement) {
      if (typeof container.scrollBy === "function") {
        container.scrollBy({ left: dx, top: dy });
      } else {
        container.scrollLeft += dx;
        container.scrollTop += dy;
      }
    } else {
      container.scrollBy({ left: dx, top: dy });
    }
  };

  const schedule = (container: ScrollContainer, dx: number, dy: number) => {
    pendingAutoScroll = { container, dx, dy };
    if (!supportsRAF) {
      flush();
      return;
    }
    if (autoScrollRaf != null) return;
    autoScrollRaf = requestAnimationFrame(flush);
  };

  const maybeScroll = (event: Event, node: HTMLElement) => {
    if (!autoScrollOptions) autoScrollOptions = resolveOptions();
    const options = autoScrollOptions;
    if (!options) return;

    const point = getClientPoint(event);
    if (!point) return;

    if (!autoScrollContainer) {
      init(node);
    }
    const container = autoScrollContainer;
    if (!container) return;

    const computeDelta = (distanceIntoZone: number): number => {
      const ratio = Math.min(1, Math.max(0, distanceIntoZone / options.margin));
      return ratio <= 0 ? 0 : Math.ceil(ratio * options.speed);
    };

    let dx = 0;
    let dy = 0;

    if (container instanceof HTMLElement) {
      const rect = container.getBoundingClientRect();
      const topZone = rect.top + options.margin;
      const bottomZone = rect.bottom - options.margin;
      const leftZone = rect.left + options.margin;
      const rightZone = rect.right - options.margin;

      if (point.y < topZone) dy = -computeDelta(topZone - point.y);
      else if (point.y > bottomZone) dy = computeDelta(point.y - bottomZone);

      if (point.x < leftZone) dx = -computeDelta(leftZone - point.x);
      else if (point.x > rightZone) dx = computeDelta(point.x - rightZone);

      if (dy < 0 && container.scrollTop <= 0) dy = 0;
      if (
        dy > 0 &&
        container.scrollTop + container.clientHeight >= container.scrollHeight
      ) {
        dy = 0;
      }
      if (dx < 0 && container.scrollLeft <= 0) dx = 0;
      if (
        dx > 0 &&
        container.scrollLeft + container.clientWidth >= container.scrollWidth
      ) {
        dx = 0;
      }
    } else {
      const win = container;
      const topZone = options.margin;
      const bottomZone = win.innerHeight - options.margin;
      const leftZone = options.margin;
      const rightZone = win.innerWidth - options.margin;

      if (point.y < topZone) dy = -computeDelta(topZone - point.y);
      else if (point.y > bottomZone) dy = computeDelta(point.y - bottomZone);

      if (point.x < leftZone) dx = -computeDelta(leftZone - point.x);
      else if (point.x > rightZone) dx = computeDelta(point.x - rightZone);
    }

    if (dx === 0 && dy === 0) {
      cancel();
      return;
    }
    schedule(container, dx, dy);
  };

  return {
    init,
    maybeScroll,
    reset
  };
}
