import { defineComponent, onBeforeUnmount, onMounted, toRef, type PropType, type Ref } from "vue";
import type { CompactType } from "../utils";
import {
  Breakpoints,
  ResponsiveLayout
} from "../responsiveUtils";
import type { GridLayoutEngineProp } from "../layout-engine";
import type { GridDragActivationDistance } from "../interaction-state-machine";
import type {
  GridLayoutPersistenceController,
  LayoutPersistenceEvent,
  LayoutPersistenceMeta,
  LayoutsMap as PersistentLayoutsMap,
  ResponsiveGridLayoutPersistenceProp
} from "../persistence";
import {
  useGridLayoutPersistence
} from "../persistence";
import {
  getIndentationValue,
  useResponsiveGridLayoutModel,
  type BreakpointMap,
  type LayoutsMap,
  type MarginPaddingMap
} from "../responsive/useResponsiveGridLayoutModel";
import {
  createGridEditorController
} from "./controller";
import type {
  GridEditorController,
  GridEditorEvent,
  GridEditorProp
} from "./types";
import {
  createGridEditorPersistenceEnvelope,
  readGridEditorPersistenceEnvelope
} from "./persistenceBridge";
import EditorGridLayout from "./EditorGridLayout";

export interface EditorResponsiveGridLayoutProps<Breakpoint extends string = string> {
  breakpoint?: Breakpoint | null;
  breakpoints: Breakpoints<Breakpoint>;
  cols: Record<Breakpoint, number>;
  layouts: ResponsiveLayout<Breakpoint>;
  width: number;
  margin: Record<Breakpoint, [number, number]> | [number, number];
  containerPadding: Record<Breakpoint, [number, number] | null> | [number, number] | null;
  persistence?: false | ResponsiveGridLayoutPersistenceProp | GridLayoutPersistenceController<PersistentLayoutsMap>;
  layoutEngine?: false | GridLayoutEngineProp;
  editor?: false | GridEditorProp;
  dragActivationDistance?: GridDragActivationDistance;
}

const isResponsivePersistenceController = (
  value: unknown
): value is GridLayoutPersistenceController<PersistentLayoutsMap> =>
  Boolean(value && typeof value === "object" && "save" in value && "commit" in value && "load" in value);

const isResponsivePersistenceConfig = (
  value: unknown
): value is Exclude<ResponsiveGridLayoutPersistenceProp, false> =>
  Boolean(value && typeof value === "object" && !isResponsivePersistenceController(value));

const resolvePersistenceMeta = (
  meta?: LayoutPersistenceMeta | (() => LayoutPersistenceMeta | undefined)
): LayoutPersistenceMeta =>
  typeof meta === "function" ? { ...(meta() || {}) } : { ...(meta || {}) };

const EditorResponsiveGridLayout = defineComponent({
  name: "EditorResponsiveGridLayout",
  props: {
    breakpoint: { type: String, default: "" },
    breakpoints: {
      type: Object as () => BreakpointMap,
      default: () => ({ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 })
    },
    allowOverlap: { type: Boolean, default: false },
    verticalCompact: { type: Boolean, default: true },
    cols: {
      type: Object as () => BreakpointMap,
      default: () => ({ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 })
    },
    margin: {
      type: [Array, Object] as PropType<MarginPaddingMap | [number, number]>,
      default: () => ([10, 10])
    },
    containerPadding: {
      type: [Array, Object] as PropType<MarginPaddingMap | [number, number]>,
      default: () => ({ lg: null, md: null, sm: null, xs: null, xxs: null })
    },
    layouts: {
      type: Object as PropType<LayoutsMap>,
      default: () => ({})
    },
    width: {
      type: Number,
      required: true
    },
    compactType: {
      type: String as PropType<CompactType>,
      default: "vertical",
      validator: (value: CompactType) => value == null || ["vertical", "horizontal"].includes(value)
    },
    persistence: {
      type: [Boolean, Object] as PropType<false | ResponsiveGridLayoutPersistenceProp | GridLayoutPersistenceController<PersistentLayoutsMap>>,
      default: false
    },
    layoutEngine: {
      type: [Boolean, Object] as PropType<false | GridLayoutEngineProp>,
      default: undefined
    },
    dragActivationDistance: {
      type: [Number, Object] as PropType<GridDragActivationDistance>,
      default: undefined
    },
    editor: {
      type: [Boolean, Object] as PropType<false | GridEditorProp>,
      default: false
    }
  },
  emits: ["update:layouts", "layoutChange", "breakpointChange", "widthChange"],
  setup(props, { slots, emit }) {
    const model = useResponsiveGridLayoutModel({
      props: props as never,
      slots,
      emit
    });
    const { state } = model;
    const editorConfig = props.editor && typeof props.editor === "object"
      ? props.editor
      : null;
    const layoutsRef = toRef(state, "layouts") as Ref<PersistentLayoutsMap>;
    const breakpointRef = toRef(state, "breakpoint");
    const persistenceInput = props.persistence || editorConfig?.persistence;
    let editorController: GridEditorController | null = null;
    const resolvedPersistenceController: GridLayoutPersistenceController<PersistentLayoutsMap> | null =
      editorConfig && isResponsivePersistenceController(persistenceInput)
        ? persistenceInput
        : editorConfig && isResponsivePersistenceConfig(persistenceInput)
          ? useGridLayoutPersistence<PersistentLayoutsMap>({
              ...persistenceInput,
              kind: "responsive",
              target: layoutsRef,
              watchTarget: false,
              meta: () => ({
                ...resolvePersistenceMeta(persistenceInput.meta),
                editor: createGridEditorPersistenceEnvelope(
                  editorController?.editorMetaById.value || {},
                  editorController?.sectionRows.value
                )
              }),
              onEvent: (event: LayoutPersistenceEvent<PersistentLayoutsMap>) => {
                if (event.type === "load-success" || event.type === "external-apply") {
                  const envelope = readGridEditorPersistenceEnvelope(event.document);
                  if (envelope.ok && envelope.envelope && editorController) {
                    editorController.editorMetaById.value = envelope.envelope.editorMetaById;
                    if (envelope.envelope.sectionRows) {
                      editorController.sectionRows.value = envelope.envelope.sectionRows;
                    }
                  }
                  editorController?.setExternalLayouts(event.value, breakpointRef.value, event.type);
                }
                persistenceInput.onEvent?.(event);
              }
            })
          : null;
    const ownsPersistenceController = Boolean(
      editorConfig && resolvedPersistenceController && isResponsivePersistenceConfig(persistenceInput)
    );
    const onEditorEvent = (event: GridEditorEvent) => {
      editorConfig?.onEvent?.(event);
      if (event.type === "command-commit" && event.result.status === "changed") {
        resolvedPersistenceController?.commit(layoutsRef.value, { source: "component" });
      }
    };
    editorController = editorConfig
      ? editorConfig.controller || createGridEditorController({
          ...editorConfig,
          kind: "responsive",
          layout: toRef(state, "layout"),
          layouts: layoutsRef,
          breakpoint: breakpointRef,
          persistence: (resolvedPersistenceController || editorConfig.persistence) as never,
          onEvent: onEditorEvent
        })
      : null;

    onMounted(() => {
      if (!ownsPersistenceController) return;
      void resolvedPersistenceController?.load().then(result => {
        if (result.value && result.fallbackApplied) {
          editorController?.setExternalLayouts(result.value, breakpointRef.value, "persistence-fallback");
        }
      });
    });

    onBeforeUnmount(() => {
      if (!editorConfig?.controller) editorController?.stop();
      else if (ownsPersistenceController) resolvedPersistenceController?.stop();
    });

    const getInnerEditorProp = () =>
      editorController ? { ...(editorConfig || {}), controller: editorController } : false;

    return () => {
      const {
        breakpoint,
        breakpoints,
        cols,
        layouts,
        margin,
        containerPadding,
        persistence,
        layoutEngine,
        editor,
        ...other
      } = props;

      void breakpoint;
      void breakpoints;
      void cols;
      void layouts;
      void persistence;
      void editor;

      const child = slots.default ? slots.default() : null;
      return (
        <EditorGridLayout
          {...other}
          margin={getIndentationValue(margin, state.breakpoint) || [10, 10]}
          containerPadding={getIndentationValue(containerPadding, state.breakpoint) || [0, 0]}
          onLayoutChange={model.onLayoutChange}
          modelValue={state.layout}
          cols={state.cols}
          layoutEngine={layoutEngine}
          editor={getInnerEditorProp()}
        >{child}</EditorGridLayout>
      );
    };
  }
});

export default EditorResponsiveGridLayout;
