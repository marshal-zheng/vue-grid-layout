const {VueGridLayout: VGL, Vue: VueInstance} = window;
const { createApp, ref, h, reactive, onMounted } = VueInstance

const { WidthProvider } = VGL
const VueGridLayout = WidthProvider(VGL);

const len = 30

const App = {
  setup(props, { attrs }) {
    const generateLayout = () => {
      return Array.from({ length: len }, (item, i) => {
        const w = Math.ceil(Math.random() * 4);
        const y = Math.ceil(Math.random() * 4) + 1;
        return {
          x: (i * 2) % 12,
          y: Math.floor(i / 6) * y,
          w: w,
          h: y,
          i: (i+1).toString()
        };
      });
    }

    const state = reactive({
      layout: generateLayout()
    })
    
    const onLayoutChange = (layout) => {
      state.layout = layout
    }
  
    return {
      state,
      onLayoutChange
    }
  },
  components: {
    VueGridLayout
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
      <VueGridLayout
        :rowHeight="30"
        :cols="12"
        :containerPadding="[16, 16]"
        @layoutChange="onLayoutChange"
        draggableHandle=".vue-grid-dragHandleExample"
      >
        <div key="a" :data-grid="{ x: 0, y: 0, w: 2, h: 3 }">
          a
        </div>
        <div key="b" :data-grid="{ x: 2, y: 0, w: 4, h: 3, static: true }">
          b
        </div>
        <div key="c" :data-grid="{ x: 6, y: 0, w: 2, h: 3 }">
          c
        </div>
        <div
          key="4"
          :data-grid="{
            x: 8,
            y: 0,
            w: 4,
            h: 3
          }"
        >
          <span class="text">
            4 - Draggable with Handle
            <hr />
            <hr />
            <span class="vue-grid-dragHandleExample">[Drag Me]</span>
            <hr />
            <hr />
          </span>
        </div>
      </VueGridLayout>
    </div>
  `
};

createApp(App).mount('#container')
