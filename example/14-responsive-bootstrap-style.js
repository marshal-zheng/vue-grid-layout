const {VueGridLayout: VGL, Vue: VueInstance} = window;
const { createApp, ref, h, reactive, onMounted } = VueInstance

const { WidthProvider, Responsive } = VGL
const ResponsiveVueGridLayout = WidthProvider(Responsive);

const len = 20

const App = {
  setup(props, { attrs }) {
    const generateLayouts = () => {
      const times = [...Array(len)];
      console.log('times', times)
      const initCols = {lg: 12, md: 12, sm: 12, xs: 12, xxs: 12}
      const widths = {lg: 3, md: 4, sm: 6, xs: 12, xxs: 12};
      return Object.keys(widths).reduce((memo, breakpoint) => {
        const width = widths[breakpoint];
        const cols = initCols[breakpoint];
        memo[breakpoint] = [
          // You can set y to 0, the collision algo will figure it out.
          ...times.map((_, i) => ({x: (i * width) % cols, y: 0, w: width, h: 4, i: String(i)}))
        ];
        return memo;
      }, {});
    }

    const state = reactive({
      currentBreakpoint: "lg",
      compactType: "vertical",
      resizeHandles: ['se'],
      mounted: false,
      layout: [],
      layouts: generateLayouts(),
      cols: {lg: 12, md: 12, sm: 12, xs: 12, xxs: 12}
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

    const onBreakpointChange = ({ breakpoint }) => {
      state.currentBreakpoint = breakpoint
    };

    const onLayoutChange = (layout, layouts) => {
      state.layout = layout;
    }
  
    return {
      state,
      compactTypeChange,
      onBreakpointChange,
      onLayoutChange,
    }
  },
  components: {
    VGL,
    ResponsiveVueGridLayout
  },
  template: `
    <div>
      <h1>Vue Grid Layout</h1>
      <div class="layoutJSON">
        Displayed as <code>[x, y, w, h]</code>:
        <div class="columns">
          <div v-for="l in state.layout" :key="l.i" class="layoutItem">
            <b>{{ l.i === '__dropping-elem__' ? 'drop' : l.i }}</b>
            {{ ":"+l.x+","+l.y+","+l.w+","+l.h }}
          </div>
        </div>
      </div>
      <ResponsiveVueGridLayout
        class="layout"
        :rowHeight="30"
        :cols="state.cols"
        :layouts="state.layouts"
        @breakpointChange={onBreakpointChange}
        @layoutChange="onLayoutChange"
        :containerPadding="[16, 16]"
      >
        <div v-for="(l, i) in state.layouts.lg" :key="i+1" :class="{ static: l.static }">
          <span v-if="l.static" class="text" title="This item is static and cannot be removed or resized.">
            Static - {{ i }}
          </span>
          <span v-else class="text">{{ i }}</span>
        </div>
      </ResponsiveVueGridLayout>
    </div>
  `
};

createApp(App).mount('#container')
