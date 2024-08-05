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
  
    return {
      state
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
        v-model="state.layout"
        :isDraggable="false"
        :isResizable="false"
        :rowHeight="30"
        :cols="12"
        :containerPadding="[16, 16]"
      >
        <div v-for="item in state.layout" :key="item.i">
          <span class="text">{{ item.i }}</span>
        </div>
      </VueGridLayout>
    </div>
  `
};

createApp(App).mount('#container')
