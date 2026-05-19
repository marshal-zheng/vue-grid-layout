import type { ComponentInternalInstance } from "vue";
import type { EventCallback, Layout, LayoutItem } from "../utils";

export const gridLayoutEmits = [
  "update:modelValue",
  "layoutChange",
  "dragStart",
  "drag",
  "dragStop",
  "resizeStart",
  "resize",
  "resizeStop",
  "drop",
  "dropDragOver"
];

export type GridLayoutEmitName =
  | "update:modelValue"
  | "layoutChange"
  | "dragStart"
  | "drag"
  | "dragStop"
  | "resizeStart"
  | "resize"
  | "resizeStop"
  | "drop"
  | "dropDragOver";
export type DropDragOverResult = { w?: number; h?: number } | false | void;

type EmitFn = (event: GridLayoutEmitName, ...args: unknown[]) => void;

const eventHandlerKeys: Record<GridLayoutEmitName, string[]> = {
  "update:modelValue": ["onUpdate:modelValue"],
  layoutChange: ["onLayoutChange", "onLayout-change"],
  dragStart: ["onDragStart", "onDrag-start"],
  drag: ["onDrag"],
  dragStop: ["onDragStop", "onDrag-stop"],
  resizeStart: ["onResizeStart", "onResize-start"],
  resize: ["onResize"],
  resizeStop: ["onResizeStop", "onResize-stop"],
  drop: ["onDrop"],
  dropDragOver: ["onDropDragOver", "onDrop-drag-over"]
};

export type GridRootAttrs = {
  attrs: Record<string, unknown>;
  class?: unknown;
  style?: unknown;
};

export function splitGridRootAttrs(rawAttrs: Record<string, unknown>): GridRootAttrs {
  const rootAttrs: Record<string, unknown> = {};
  let rootClass: unknown;
  let rootStyle: unknown;

  Object.keys(rawAttrs).forEach(key => {
    const value = rawAttrs[key];
    if (key === "class") {
      rootClass = value;
      return;
    }
    if (key === "style") {
      rootStyle = value;
      return;
    }
    if (/^on[A-Z]/.test(key)) return;
    rootAttrs[key] = value;
  });

  return {
    attrs: rootAttrs,
    class: rootClass,
    style: rootStyle
  };
}

function callHandler(handler: unknown, args: unknown[]): unknown[] {
  if (!handler) return [];
  if (Array.isArray(handler)) {
    return handler.flatMap(entry => callHandler(entry, args));
  }
  if (typeof handler === "function") {
    return [handler(...args)];
  }
  return [];
}

function callReturnableEvent(
  instance: ComponentInternalInstance | null,
  eventName: GridLayoutEmitName,
  args: unknown[]
): unknown {
  const vnodeProps = instance?.vnode.props || {};
  const keys = eventHandlerKeys[eventName] || [];
  let result: unknown;

  keys.forEach(key => {
    const values = callHandler(vnodeProps[key], args);
    values.forEach(value => {
      if (value === false) {
        result = false;
        return;
      }
      if (result !== false && value != null) {
        result = value;
      }
    });
  });

  return result;
}

export function createGridLayoutEventBridge(
  emit: EmitFn,
  instance: ComponentInternalInstance | null
) {
  const emitInteraction = (eventName: GridLayoutEmitName): EventCallback =>
    (layout, oldItem, item, placeholder, event, node) => {
      emit(eventName, layout, oldItem, item, placeholder, event, node);
    };

  return {
    emitModelValue(layout: Layout | undefined) {
      emit("update:modelValue", layout);
    },
    emitLayoutChange(layout: Layout | undefined) {
      emit("layoutChange", layout);
    },
    emitDragStart: emitInteraction("dragStart"),
    emitDrag: emitInteraction("drag"),
    emitDragStop: emitInteraction("dragStop"),
    emitResizeStart: emitInteraction("resizeStart"),
    emitResize: emitInteraction("resize"),
    emitResizeStop: emitInteraction("resizeStop"),
    emitDrop(layout: Layout, event: Event, item?: LayoutItem) {
      emit("drop", layout, event, item);
    },
    callDropDragOver(event: DragEvent): Exclude<DropDragOverResult, void> | undefined {
      const result = callReturnableEvent(instance, "dropDragOver", [event]);
      if (result === false) return false;
      if (result && typeof result === "object") {
        return result as { w?: number; h?: number };
      }
      return undefined;
    }
  };
}
