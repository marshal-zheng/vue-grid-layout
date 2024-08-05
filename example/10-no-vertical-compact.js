const {VueGridLayout: VGL, Vue: VueInstance} = window;
const { createApp, ref, h, reactive, onMounted } = VueInstance

const len = 14

const App = {
  setup(props, { attrs }) {
    setTimeout(() => {
      state.items = Array.from({ length: len }, (_, index) => index + 1)
    }, 1000)


    const generateLayout = (items) => {
      return new Array(items).fill().map((item, i) => {
        const y = Math.ceil(Math.random() * 4) + 1;
        return {
          x: (i * 2) % 12,
          y: Math.floor(i / 6) * y,
          w: 2,
          h: y,
          i: (i + 1).toString()
        };
      });
    }

    const state = reactive({
      currentBreakpoint: "lg",
      compactType: "vertical",
      resizeHandles: ['se'],
      mounted: false,
      rowHeight: 30,
      layout: generateLayout(len),
    })

    return {
      state
    }
  },
  components: {
    VGL
  },
  template: `
    <div>
      <div class="layoutJSON">
        Displayed as <code>[x, y, w, h]</code>:
        <div class="columns">
          <div v-for="l in state.layout" :key="l.i" class="layoutItem">
            <b>{{ l.i === '__dropping-elem__' ? 'drop' : l.i }}</b>
            {{ ":"+l.x+","+l.y+","+l.w+","+l.h }}
          </div>
        </div>
      </div>
      <VGL
        class="layout"
        v-model="state.layout"
        :cols="12"
        :rowHeight="30"
        :width="1200"
        :verticalCompact="false"
      >
        <div v-for="(item, i) in state.items" :key="i+1">
          <span class="text">{{i+1}}</span>
        </div>
      </VGL>
    </div>
  `
};

createApp(App).mount('#container')
