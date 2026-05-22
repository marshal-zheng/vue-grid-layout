import { defineComponent, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue";
import VueGridLayout from "../VueGridLayout";
import { basicProps as gridLayoutProps } from "../VueGridLayoutPropTypes";
import { cloneLayout, type Layout } from "../utils";
import {
  useGridLayoutPersistence,
  type GridLayoutPersistenceProp,
  type LayoutPersistenceEvent
} from "../persistence";

const PersistentGridLayout = defineComponent({
  name: "PersistentGridLayout",
  inheritAttrs: false,
  props: {
    ...gridLayoutProps,
    persistence: {
      type: Object as PropType<Exclude<GridLayoutPersistenceProp, false>>,
      required: true
    }
  },
  emits: ["update:modelValue", "layoutChange"],
  setup(props, { attrs, slots, emit }) {
    const layout = ref<Layout>(cloneLayout(props.modelValue || []));
    let applyingPersistence = false;

    const applyLayout = (nextLayout: Layout) => {
      applyingPersistence = true;
      const cloned = cloneLayout(nextLayout);
      layout.value = cloned;
      emit("update:modelValue", cloned);
      emit("layoutChange", cloned);
      queueMicrotask(() => {
        applyingPersistence = false;
      });
    };

    const config = props.persistence;
    const controller = useGridLayoutPersistence<Layout>({
      ...config,
      kind: "layout",
      target: layout,
      watchTarget: false,
      onEvent: (event: LayoutPersistenceEvent<Layout>) => {
        if (event.type === "external-apply") applyLayout(event.value);
        config.onEvent?.(event);
      }
    });

    watch(
      () => props.modelValue,
      next => {
        if (!applyingPersistence && next && !Object.is(next, layout.value)) {
          layout.value = cloneLayout(next);
        }
      },
      { deep: true }
    );

    onMounted(() => {
      void controller.load().then(result => {
        if (result.value && (result.ok || result.fallbackApplied)) {
          applyLayout(result.value);
        }
      });
    });

    onBeforeUnmount(() => {
      controller.stop();
    });

    const onLayoutChange = (nextLayout: Layout) => {
      if (applyingPersistence) return;
      const cloned = cloneLayout(nextLayout);
      layout.value = cloned;
      emit("update:modelValue", cloned);
      emit("layoutChange", cloned);
      controller.commit(cloned, { source: "component" });
    };

    return () => {
      const {
        persistence,
        modelValue,
        ...gridProps
      } = props;

      void persistence;
      void modelValue;

      return (
        <VueGridLayout
          {...attrs}
          {...gridProps}
          modelValue={layout.value}
          onLayoutChange={onLayoutChange}
        >
          {slots.default?.()}
        </VueGridLayout>
      );
    };
  }
});

export default PersistentGridLayout;
