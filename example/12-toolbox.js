const {VueGridLayout: VGL, Vue: VueInstance} = window;
const { createApp, ref, h, reactive, onMounted, defineComponent } = VueInstance

const { WidthProvider, Responsive } = VGL
const ResponsiveVueGridLayout = WidthProvider(Responsive);

const len = 15

const ToolBoxItem = defineComponent({
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  emits: ['takeItem'],
  methods: {
    handleClick() {
      this.$emit('takeItem', this.item);
    }
  },
  template: `
    <div class="toolbox__items__item" @click="handleClick">
      {{ item.i }}
    </div>
  `
});

const App = {
  setup(props, { attrs }) {
    const generateLayout = (resizeHandles) => {
      console.log(123)
      return Array.from({ length: len }, (item, i) => {
        const y = Math.ceil(Math.random() * 4) + 1;
        return {
          x: Math.round(Math.random() * 5) * 2,
          y: Math.floor(i / 6) * y,
          w: 2,
          h: y,
          i: (i + 1).toString(), // 从1开始
          static: Math.random() < 0.05,
          resizeHandles
        };
      });
    }

    const state = reactive({
      currentBreakpoint: "lg",
      compactType: "vertical",
      mounted: false,
      toolbox: { lg: [] },
      layouts: { lg: generateLayout(['se']) },
    })

    onMounted(() => {
      state.mounted = true
    })


    const compactTypeChange = () => {
      const { compactType: oldCompactType } = state;
      const compactType =
        oldCompactType === "horizontal"
          ? "vertical"
          : oldCompactType === "vertical"
          ? null
          : "horizontal";
      state.compactType = compactType;
    };

    const newLayout = () => {
      state.layouts = { lg: generateLayout(state.resizeHandles) }
    };

    const onBreakpointChange = ({ breakpoint }) => {
      state.currentBreakpoint = breakpoint
    };

    const onLayoutChange = (layout, layouts) => {
      state.layout = layout;
    }

    const onPutItem = item => {
      state.toolbox = {
        [state.currentBreakpoint]: [
          ...(state.toolbox[state.currentBreakpoint] || []),
          item
        ]
      };
      state.layouts = {
        [state.currentBreakpoint]: state.layouts[state.currentBreakpoint].filter(({ i }) => i !== item.i)
      }
    };

    const onTakeItem = item => {
      state.toolbox = {
        [state.currentBreakpoint]: state.toolbox[
          state.currentBreakpoint
        ].filter(({ i }) => i !== item.i)
      };
      state.layouts = {
        [state.currentBreakpoint]: [
          ...state.layouts[state.currentBreakpoint],
          item
        ]
      }
    };
  
    return {
      state,
      compactTypeChange,
      newLayout,
      onBreakpointChange,
      onLayoutChange,
      onPutItem,
      onTakeItem
    }
  },
  components: {
    VGL,
    ResponsiveVueGridLayout,
    ToolBoxItem
  },
  template: `
    <div>
      <h1>Vue Grid Layout</h1>
      <div class="toolbox">
        <span class="toolbox__title">Toolbox</span>
        <div class="toolbox__items">
        {{state.toolbox.lg}}
          <ToolBoxItem
            v-for="item in state.toolbox.lg"
            :key="item.i"
            :item="item"
            @takeItem="onTakeItem"
          />
        </div>
      </div>
      <ResponsiveVueGridLayout
        class="layout"
        :rowHeight="30"
        :cols="state.cols"
        :layouts="state.layouts"
        @breakpointChange={onBreakpointChange}
        @layoutChange="onLayoutChange"
        :measureBeforeMount="false"
        :useCSSTransforms="state.mounted"
        :compactType="state.compactType"
        :preventCollision="!state.compactType"
        :containerPadding="[16, 16]"
      >
        <div v-for="(l, i) in state.layouts.lg" :key="l.i" :class="{ static: l.static }">
          <div class="hide-button" @click="onPutItem(l)">
            &times;
          </div>
          <span v-if="l.static" class="text" title="This item is static and cannot be removed or resized.">
            Static - {{ l.i }}
          </span>
          <span v-else class="text">{{ l.i }}</span>
        </div>
      </ResponsiveVueGridLayout>
    </div>
  `
};

createApp(App).mount('#container')
