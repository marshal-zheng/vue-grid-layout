const {VueGridLayout: VGL, Vue: VueInstance} = window;
const { createApp, ref, h, reactive, onMounted } = VueInstance

const { WidthProvider, Responsive } = VGL
const ResponsiveVueGridLayout = WidthProvider(Responsive);

const len = 10

const App = {
  setup(props, { attrs }) {
    const generateLayout = () => {
      return Array.from({ length: len }, (item, i) => {
        const y = Math.ceil(Math.random() * 4) + 1;
        return {
          x: Math.round(Math.random() * 5) * 2,
          y: Math.floor(i / 6) * y,
          w: 2,
          h: y,
          i: (i+1).toString(),
          static: Math.random() < 0.05,
        };
      });
    }

    const state = reactive({
      currentBreakpoint: "lg",
      compactType: "vertical",
      mounted: false,
      layout: [],
      layouts: { lg: generateLayout(['se']) },
    })

    onMounted(() => {
      state.mounted = true
    })

    const newLayout = () => {
      state.layouts = { lg: generateLayout(state.resizeHandles) }
    };

    const onBreakpointChange = ({ breakpoint }) => {
      state.currentBreakpoint = breakpoint
    };

    const onLayoutChange = (layout, layouts) => {
      state.layout = layout;
    }
  

    const onDrop  = (layout, _event, layoutItem) => {
      const newItems = layout.concat({
        ...layoutItem,
        i:  (state.layouts.lg.length+1).toString(),
      });
      state.layouts = { lg: newItems };
    };
  
    const onDropDragOver  = (e) => {
      return { w: 2, h: 2 };
    };
    const onDragStop  = (layout, oldLay, newLay) => {
      // console.log('onDragStop')
    };

    return {
      state,
      newLayout,
      onBreakpointChange,
      onLayoutChange,
      onDrop,
      onDropDragOver
    }
  },
  components: {
    VGL,
    ResponsiveVueGridLayout
  },
  template: `
    <div>
      <h1>Vue Grid Layout</h1>
      <div className="layoutJSON">
        Displayed as <code>[x, y, w, h]</code>:
        <div className="columns">
          <div v-for="l in state.layout" :key="l.i" class="layoutItem">
            <b>{{ l.i === '__dropping-elem__' ? 'drop' : l.i }}</b>
            {{ ': ['  + l.x + ',' + l.y + ',' + l.w + ',' + l.h + ']' }}
          </div>
        </div>
      </div>
      <div
        class="droppable-element"
        :draggable="true"
        unselectable="on"
        onDragStart="(e) => e.dataTransfer.setData('text/plain', '')"
      >
        Droppable Element (Drag me!)
      </div>
      <ResponsiveVueGridLayout
        class="layout"
        :rowHeight="30"
        :cols="{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }"
        :layouts="state.layouts"
        @breakpointChange={onBreakpointChange}
        @layoutChange="onLayoutChange"
        @dropDragOver="onDropDragOver"
        @drop="onDrop"
        @dragStop="onDragStop"
        :measureBeforeMount="false"
        :useCSSTransforms="state.mounted"
        :containerPadding="[16, 16]"
        :isDroppable="true"
      >
        <div v-for="(l, i) in state.layouts.lg" :key="l.i" :class="{ static: l.static }">
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
