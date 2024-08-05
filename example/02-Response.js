const {VueGridLayout: VGL, Vue: VueInstance} = window;
const { createApp, ref, h, reactive, onMounted } = VueInstance

const { WidthProvider, Responsive } = VGL
const ResponsiveVueGridLayout = WidthProvider(Responsive);

const len = 20

const App = {
  setup(props, { attrs }) {
    const generateLayout = (resizeHandles) => {
      return Array.from({ length: len }, (item, i) => {
        const y = Math.ceil(Math.random() * 4) + 1;
        return {
          x: Math.round(Math.random() * 5) * 2,
          y: Math.floor(i / 6) * y,
          w: 2,
          h: y,
          i: (i + 1).toString(),
          static: Math.random() < 0.05,
          resizeHandles
        };
      });
    }

    const state = reactive({
      currentBreakpoint: "lg",
      compactType: "vertical",
      resizeHandles: ['se'],
      mounted: false,
      layout: [],
      layouts: { lg: generateLayout(['se']) },
    })

    onMounted(() => {
      state.mounted = true
    })

    const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];

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

    const resizeTypeChange = () => {
      const resizeHandles = state.resizeHandles === availableHandles ? ['se'] : availableHandles;
      state.resizeHandles = resizeHandles;
      state.layouts = { lg: generateLayout(resizeHandles) }
    };

    const onBreakpointChange = ({ breakpoint }) => {
      state.currentBreakpoint = breakpoint
    };

    const onLayoutChange = (layout, layouts) => {
      state.layout = layout;
    }
  

    const onDrop  = (elemParams) => {
      alert(`Element parameters: ${JSON.stringify(elemParams)}`);
    };


    return {
      state,
      compactTypeChange,
      resizeTypeChange,
      newLayout,
      onBreakpointChange,
      onLayoutChange,
      availableHandles,
      onDrop
    }
  },
  components: {
    VGL,
    ResponsiveVueGridLayout
  },
  template: `
    <div>
      <h1>Vue Grid Layout</h1>
      <div>
        Current Breakpoint: {{state.currentBreakpoint}} (
      </div>
      <div>
        Compaction type:
        {{state.compactType && state.compactType.charAt(0).toUpperCase() + state.compactType.slice(1).toLowerCase() || "No Compaction"}}
      </div>
      <button @click="newLayout">Generate New Layout</button>
      <button @click="compactTypeChange">
        Change Compaction Type
      </button>
      <button @click="resizeTypeChange">
        Resize {{state.resizeHandles === availableHandles ? "One Corner" : "All Corners"}}
      </button>
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
        @drop="onDrop"
        :measureBeforeMount="false"
        :useCSSTransforms="state.mounted"
        :compactType="state.compactType"
        :preventCollision="!state.compactType"
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
