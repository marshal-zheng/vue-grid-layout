import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
  PropType,
  DefineComponent,
  ComponentPublicInstance,
  watch
} from 'vue';
import ResizeObserver from 'resize-observer-polyfill';
import clsx from 'clsx';

import { Kv } from './type';

type WPState = {
  width: number;
};

const layoutClassName = "vue-grid-layout";

export default function WidthProvideRG(ComposedComponent:  DefineComponent) {
  return defineComponent({
    name: 'WidthProvider',
    props: {
      measureBeforeMount: {
        type: Boolean as PropType<boolean>,
        default: false
      },
      class: {
        type: String as PropType<string>,
        default: ''
      },
      style: {
        type: Object as PropType<Kv>,
        default: () => ({})
      }
    },
    setup(props, { attrs, slots }) {
      const elementRef = ref<HTMLElement | ComponentPublicInstance | null>(null);
      const state = reactive<WPState>({
        width: 1280
      });
      const mounted = ref(false);
      let resizeObserver: ResizeObserver | null = null;
      let observedNode: HTMLElement | null = null;

      const resolveNode = (): HTMLElement | null => {
        const value = elementRef.value;
        if (!value) return null;
        if (value instanceof HTMLElement) return value;
        const maybeEl = (value as { $el?: unknown }).$el;
        return maybeEl instanceof HTMLElement ? maybeEl : null;
      };

      const updateWidth = (rawWidth: number | undefined) => {
        if (typeof rawWidth !== "number" || !Number.isFinite(rawWidth)) return;
        const nextWidth = Math.round(rawWidth);
        if (nextWidth > 0 && nextWidth !== state.width) state.width = nextWidth;
      };

      const updateObserverTarget = () => {
        if (!resizeObserver) return;
        const node = resolveNode();

        if (observedNode && observedNode !== node) {
          resizeObserver.unobserve(observedNode);
        }
        observedNode = node;

        if (node) {
          resizeObserver.observe(node);
          updateWidth(node.getBoundingClientRect().width);
        }
      };

      onMounted(() => {
        resizeObserver = new ResizeObserver(entries => {
          const entry = entries[0];
          if (!entry) return;
          updateWidth(entry.contentRect.width);
        });

        // For `measureBeforeMount`, the first render is a placeholder <div>. Measure/observe it
        // before mounting children to avoid an initial layout jump.
        updateObserverTarget();
        mounted.value = true;
      });

      onBeforeUnmount(() => {
        mounted.value = false;
        if (resizeObserver) {
          if (observedNode) resizeObserver.unobserve(observedNode);
          resizeObserver.disconnect();
        }
        observedNode = null;
        resizeObserver = null;
      });

      watch(elementRef, () => {
        updateObserverTarget();
      });

      return () => {
        const { measureBeforeMount, ...rest } = props;
        if (measureBeforeMount && !mounted.value) {
          return (
            <div
              class={clsx(props.class, layoutClassName)}
              style={props.style}
              ref={el => (elementRef.value = el)}
            />
          );
        }
        const child = slots.default ? slots.default() : null;

        return (
          <ComposedComponent
            ref={elementRef}
            {...attrs}
            {...rest}
            {...state}
          >
            {child}
          </ComposedComponent>
        );
      };
    }
  });
}
