import { defineComponent, ref, onMounted, onBeforeUnmount, reactive, PropType, Ref, DefineComponent } from 'vue';
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
      const elementRef: Ref<InstanceType<typeof ComposedComponent> | null> = ref(null);
      const state = reactive<WPState>({
        width: 1280
      });
      const mounted = ref(false);
      let resizeObserver: ResizeObserver;

      onMounted(() => {
        mounted.value = true;
        resizeObserver = new ResizeObserver(entries => {
          const node = elementRef?.value?.$el;
          if (node instanceof HTMLElement) {
            const width = entries[0].contentRect.width;
            state.width = width;
          }
        });
        const node = elementRef.value?.$el;
        if (node instanceof HTMLElement) {
          resizeObserver.observe(elementRef?.value?.$el);
        }
      });

      onBeforeUnmount(() => {
        mounted.value = false;
        const node = elementRef.value?.$el;
        if (node instanceof HTMLElement) {
          resizeObserver.unobserve(node);
        }
        resizeObserver.disconnect();
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
