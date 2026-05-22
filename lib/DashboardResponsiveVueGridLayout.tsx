import { Fragment, defineComponent, getCurrentInstance, h, onMounted, toRef, watch, type PropType, type VNode } from "vue";
import EditorGridLayout from "./editor/EditorGridLayout";
import { basicProps as gridLayoutProps } from "./VueGridLayoutPropTypes";
import { getNonFragmentChildren, type Layout } from "./utils";
import { resolveGridHeightRuntime } from "./grid-height";
import type { GridEditorProp } from "./editor";
import type { GridLayoutEngineProp } from "./layout-engine";
import {
  createDashboardResponsiveDiagnostic,
  useDashboardResponsiveProfileModel
} from "./dashboard-responsive";
import type {
  DashboardDiagnostic,
  DashboardHeightOptionOverrides,
  DashboardLayoutDocument,
  DashboardResponsiveMode,
  DashboardTargetView,
  DashboardTargetViewRule
} from "./dashboard-responsive";
import type { LayoutValidationMode } from "./persistence";

const toPair = (value: number | [number, number] | undefined): [number, number] => {
  if (Array.isArray(value)) return [value[0], value[1]];
  const spacing = typeof value === "number" ? value : 10;
  return [spacing, spacing];
};

const hasHeightOption = (
  options: DashboardHeightOptionOverrides,
  key: keyof DashboardHeightOptionOverrides
) => Object.prototype.hasOwnProperty.call(options, key);

const resolveDashboardRowHeight = (
  options: DashboardHeightOptionOverrides,
  fallback: number
): number | undefined =>
  hasHeightOption(options, "rowHeight") ? options.rowHeight : fallback;

const eventNames = [
  "update:document",
  "documentChange",
  "breakpointChange",
  "profileChange",
  "projectionChange",
  "diagnosticsChange",
  "projectionError",
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

const DashboardResponsiveVueGridLayout = defineComponent({
  name: "DashboardResponsiveVueGridLayout",
  inheritAttrs: false,
  props: {
    ...gridLayoutProps,
    document: {
      type: Object as PropType<DashboardLayoutDocument>,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    breakpoints: {
      type: Object as PropType<Record<string, number>>,
      default: () => ({ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 })
    },
    breakpoint: {
      type: String,
      default: null
    },
    targetView: {
      type: String as PropType<DashboardTargetView | null>,
      default: null
    },
    targetViewRule: {
      type: Object as PropType<DashboardTargetViewRule>,
      default: undefined
    },
    mode: {
      type: String as PropType<DashboardResponsiveMode>,
      default: "view"
    },
    validation: {
      type: String as PropType<LayoutValidationMode>,
      default: "strict"
    },
    allowUnknownProfileItems: {
      type: Boolean,
      default: false
    },
    createMissingProfileOnEdit: {
      type: Boolean,
      default: false
    },
    layoutEngine: {
      type: [Boolean, Object] as PropType<false | GridLayoutEngineProp>,
      default: undefined
    },
    editor: {
      type: [Boolean, Object] as PropType<false | GridEditorProp>,
      default: false
    }
  },
  emits: eventNames,
  setup(props, { attrs, slots, emit }) {
    const instance = getCurrentInstance();
    let lastSlotDiagnosticSignature = "";
    const model = useDashboardResponsiveProfileModel({
      document: toRef(props, "document"),
      width: toRef(props, "width"),
      breakpoints: toRef(props, "breakpoints"),
      breakpoint: toRef(props, "breakpoint"),
      targetView: toRef(props, "targetView"),
      targetViewRule: props.targetViewRule,
      mode: toRef(props, "mode"),
      validation: props.validation,
      layoutEngine: props.layoutEngine,
      editor: props.editor,
      createMissingProfileOnEdit: props.createMissingProfileOnEdit,
      allowUnknownProfileItems: props.allowUnknownProfileItems,
      onEvent: event => {
        if (event.type === "documentChange") {
          emit("update:document", event.document);
          emit("documentChange", event.document, event.runtime);
          return;
        }
        emit(event.type, event);
      }
    });

    const emitGridEvent = (eventName: string) =>
      (...args: unknown[]) => emit(eventName, ...args, model.state.value);

    const handleLayoutChange = (layout: Layout) => {
      model.onLayoutChange(layout);
      emit("layoutChange", layout, model.state.value);
    };

    const kebab = (value: string) =>
      value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);

    const hasExplicitProp = (name: string) => {
      const rawProps = instance?.vnode.props || {};
      return Object.prototype.hasOwnProperty.call(rawProps, name) ||
        Object.prototype.hasOwnProperty.call(rawProps, kebab(name));
    };

    const resolveHeightOptions = (runtimeOptions: DashboardHeightOptionOverrides): DashboardHeightOptionOverrides => {
      const out: DashboardHeightOptionOverrides = { ...runtimeOptions };
      if (hasExplicitProp("heightMode")) out.heightMode = props.heightMode;
      if (hasExplicitProp("containerHeight")) out.containerHeight = props.containerHeight;
      if (hasExplicitProp("autoMeasureContainerHeight")) out.autoMeasureContainerHeight = props.autoMeasureContainerHeight;
      if (hasExplicitProp("minRowHeight")) out.minRowHeight = props.minRowHeight;
      if (hasExplicitProp("rowHeight")) out.rowHeight = props.rowHeight;
      if (hasExplicitProp("renderPrecision")) out.renderPrecision = props.renderPrecision;
      return out;
    };

    let lastOuterHeightRuntimeSignature = "";
    const publishOuterHeightRuntime = () => {
      const runtime = model.state.value;
      const heightOptions = resolveHeightOptions(runtime.heightOptions);
      const heightRuntime = resolveGridHeightRuntime({
        layout: runtime.layout,
        autoSize: props.autoSize,
        heightMode: heightOptions.heightMode,
        rowHeight: resolveDashboardRowHeight(heightOptions, runtime.gridSettings.rowHeight),
        minRowHeight: heightOptions.minRowHeight,
        margin: toPair(runtime.gridSettings.margin),
        containerPadding: runtime.gridSettings.containerPadding || [0, 0],
        containerHeight: heightOptions.containerHeight,
        autoMeasureContainerHeight: heightOptions.autoMeasureContainerHeight,
        renderPrecision: heightOptions.renderPrecision,
        context: {
          source: "dashboard-responsive",
          layoutId: runtime.layoutId,
          profileId: runtime.resolvedProfileId,
          targetView: runtime.targetView
        }
      });
      const signature = JSON.stringify(heightRuntime);
      const currentSignature = runtime.heightRuntime ? JSON.stringify(runtime.heightRuntime) : "";
      if (
        signature === lastOuterHeightRuntimeSignature &&
        signature === currentSignature
      ) {
        return;
      }
      lastOuterHeightRuntimeSignature = signature;
      model.onHeightRuntimeChange(heightRuntime);
    };

    watch(
      () => [
        model.state.value.layout,
        model.state.value.gridSettings,
        model.state.value.heightOptions,
        props.autoSize,
        props.heightMode,
        props.containerHeight,
        props.autoMeasureContainerHeight,
        props.minRowHeight,
        props.rowHeight,
        props.renderPrecision
      ],
      publishOuterHeightRuntime,
      { deep: true }
    );
    onMounted(publishOuterHeightRuntime);

    const filterSlotChildren = (): VNode[] => {
      const runtime = model.state.value;
      const children = slots.default ? getNonFragmentChildren(h(Fragment, null, slots.default())) : [];
      const childByKey: Record<string, VNode> = {};
      const diagnostics: DashboardDiagnostic[] = runtime.diagnostics.slice();
      children.forEach(child => {
        if (child && child.key != null) {
          childByKey[String(child.key)] = child;
        }
      });
      const renderIds = runtime.renderItemIds.slice();
      renderIds.forEach(id => {
        if (!childByKey[id]) {
          diagnostics.push(createDashboardResponsiveDiagnostic(
            "slot-widget-mismatch",
            "warning",
            `No slot child was provided for dashboard widget "${id}".`,
            { layoutId: runtime.layoutId, profileId: runtime.resolvedProfileId || undefined, itemId: id }
          ));
        }
      });
      Object.keys(childByKey)
        .sort()
        .forEach(id => {
          if (runtime.allItemIds.indexOf(id) === -1) {
            diagnostics.push(createDashboardResponsiveDiagnostic(
              "slot-widget-mismatch",
              "warning",
              `Slot child "${id}" does not match a dashboard widget.`,
              { layoutId: runtime.layoutId, profileId: runtime.resolvedProfileId || undefined, itemId: id }
            ));
          }
        });

      const signature = JSON.stringify(diagnostics);
      if (signature !== lastSlotDiagnosticSignature) {
        lastSlotDiagnosticSignature = signature;
        emit("diagnosticsChange", { type: "diagnosticsChange", diagnostics });
      }
      return renderIds
        .map(id => childByKey[id])
        .filter(Boolean);
    };

    return () => {
      const runtime = model.state.value;
      const {
        document,
        breakpoints,
        breakpoint,
        targetView,
        targetViewRule,
        mode,
        validation,
        allowUnknownProfileItems,
        createMissingProfileOnEdit,
        modelValue,
        cols,
        margin,
        containerPadding,
        rowHeight,
        heightMode,
        containerHeight,
        autoMeasureContainerHeight,
        minRowHeight,
        renderPrecision,
        editor,
        layoutEngine,
        ...gridProps
      } = props;

      void document;
      void breakpoints;
      void breakpoint;
      void targetView;
      void targetViewRule;
      void mode;
      void validation;
      void allowUnknownProfileItems;
      void createMissingProfileOnEdit;
      void modelValue;
      void cols;
      void margin;
      void containerPadding;
      void rowHeight;
      void heightMode;
      void containerHeight;
      void autoMeasureContainerHeight;
      void minRowHeight;
      void renderPrecision;
      void editor;
      void layoutEngine;
      const heightOptions = resolveHeightOptions(runtime.heightOptions);

      return (
        <EditorGridLayout
          {...attrs}
          {...gridProps}
          {...{
            onHeightRuntimeChange: model.onHeightRuntimeChange,
            "onHeight-runtime-change": model.onHeightRuntimeChange
          }}
          width={props.width}
          modelValue={runtime.layout}
          cols={runtime.gridSettings.columns}
          margin={toPair(runtime.gridSettings.margin)}
          containerPadding={runtime.gridSettings.containerPadding || [0, 0]}
          rowHeight={resolveDashboardRowHeight(heightOptions, runtime.gridSettings.rowHeight)}
          heightMode={heightOptions.heightMode}
          containerHeight={heightOptions.containerHeight}
          autoMeasureContainerHeight={heightOptions.autoMeasureContainerHeight}
          minRowHeight={heightOptions.minRowHeight}
          renderPrecision={heightOptions.renderPrecision}
          layoutEngine={props.layoutEngine}
          editor={model.getInnerEditorProp()}
          itemCapabilities={runtime.capabilitiesById}
          resizeConstraints={runtime.resizeConstraintsById}
          onLayoutChange={handleLayoutChange}
          onDragStart={emitGridEvent("dragStart")}
          onDrag={emitGridEvent("drag")}
          onDragStop={emitGridEvent("dragStop")}
          onResizeStart={emitGridEvent("resizeStart")}
          onResize={emitGridEvent("resize")}
          onResizeStop={emitGridEvent("resizeStop")}
          onDrop={emitGridEvent("drop")}
          onDropDragOver={emitGridEvent("dropDragOver")}
        >
          {filterSlotChildren()}
        </EditorGridLayout>
      );
    };
  }
});

export default DashboardResponsiveVueGridLayout;
