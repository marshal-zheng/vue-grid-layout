import { markRaw } from "vue";
import { compactInPlace, getLayoutItem } from "../utils";
import type { CompactType, Layout, LayoutItem } from "../utils";

export type PendingGridFrameUpdate = {
  cols: number;
  compactType: CompactType;
  layout?: Layout;
  placeholder: LayoutItem;
  shouldCompact: boolean;
};

type UseGridFrameUpdateOptions = {
  getLayout: () => Layout;
  setLayout: (layout: Layout) => void;
  setActiveDrag: (item: LayoutItem) => void;
};

export function useGridFrameUpdate({
  getLayout,
  setLayout,
  setActiveDrag
}: UseGridFrameUpdateOptions) {
  const supportsRAF =
    typeof requestAnimationFrame === "function" &&
    typeof cancelAnimationFrame === "function";

  let frameUpdate: PendingGridFrameUpdate | null = null;
  let frameUpdateRaf: number | null = null;

  const cancel = () => {
    if (frameUpdateRaf != null && supportsRAF) {
      cancelAnimationFrame(frameUpdateRaf);
    }
    frameUpdateRaf = null;
    frameUpdate = null;
  };

  const resetMovedFlags = (layout: Layout) => {
    for (let i = 0; i < layout.length; i++) {
      const item = layout[i];
      if (item.moved) item.moved = false;
    }
  };

  const flush = () => {
    frameUpdateRaf = null;
    const pending = frameUpdate;
    frameUpdate = null;
    if (!pending) return;

    if (pending.layout && pending.layout !== getLayout()) {
      setLayout(pending.layout);
    }

    if (pending.shouldCompact) {
      compactInPlace(getLayout(), pending.compactType, pending.cols);
    }

    const layout = getLayout();
    const activeItem = getLayoutItem(layout, pending.placeholder.i);
    setActiveDrag(markRaw(
      activeItem
        ? {
          ...pending.placeholder,
          w: activeItem.w,
          h: activeItem.h,
          x: activeItem.x,
          y: activeItem.y
        }
        : pending.placeholder
    ));
  };

  const schedule = (pending: PendingGridFrameUpdate) => {
    frameUpdate = pending;
    if (!supportsRAF) {
      flush();
      return;
    }
    if (frameUpdateRaf != null) return;
    frameUpdateRaf = requestAnimationFrame(flush);
  };

  return {
    cancel,
    flush,
    schedule,
    resetMovedFlags
  };
}
