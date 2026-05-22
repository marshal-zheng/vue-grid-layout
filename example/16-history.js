import { createApp, reactive, onMounted, ref } from "vue/dist/vue.esm-bundler.js";
import { createPinia } from "pinia";
import VGL, { WidthProvider } from "@marsio/vue-grid-layout";
import { useGridHistoryStore } from "@marsio/vue-grid-layout/history";

const VueGridLayout = WidthProvider(VGL);

const initialLayout = [
  { i: "a", x: 0, y: 0, w: 2, h: 2 },
  { i: "b", x: 2, y: 0, w: 2, h: 2 },
  { i: "c", x: 4, y: 0, w: 2, h: 2 },
  { i: "d", x: 6, y: 0, w: 2, h: 2 },
  { i: "e", x: 0, y: 2, w: 2, h: 2 },
  { i: "f", x: 2, y: 2, w: 2, h: 2 }
];

const App = {
  setup() {
    const pinia = createPinia();
    const state = reactive({
      layout: initialLayout.map(item => ({ ...item })),
      mounted: false
    });
    const history = useGridHistoryStore({ pinia, maxSize: 200 });

    // Initialize snapshot
    history.replacePresent(state.layout);

    onMounted(() => {
      state.mounted = true;
    });

    const undo = () => {
      const snap = history.undo();
      if (snap) state.layout.splice(0, state.layout.length, ...snap);
    };

    const redo = () => {
      const snap = history.redo();
      if (snap) state.layout.splice(0, state.layout.length, ...snap);
    };

    const handleLayoutChange = layout => {
      history.push(layout);
    };

    return {
      state,
      history,
      handleLayoutChange,
      undo,
      redo
    };
  },
  components: {
    VueGridLayout
  },
  template: `
    <div>
      <h2>History / Undo-Redo</h2>
      <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: center;">
        <button :disabled="!history.canUndo" @click="undo">Undo</button>
        <button :disabled="!history.canRedo" @click="redo">Redo</button>
        <span style="font-size:12px;color:#555;">Past: {{ history.past.length }} | Future: {{ history.future.length }}</span>
      </div>
      <div class="layoutJSON">
        Displayed as <code>[x, y, w, h]</code>:
        <div class="columns">
          <div v-for="l in state.layout" :key="l.i" class="layoutItem">
            <b>{{ l.i }}</b>
            {{ ":"+l.x+","+l.y+","+l.w+","+l.h }}
          </div>
        </div>
      </div>
      <VueGridLayout
        class="layout"
        v-model="state.layout"
        :cols="12"
        :rowHeight="30"
        :useCSSTransforms="state.mounted"
        @layoutChange="handleLayoutChange"
      >
        <div v-for="item in state.layout" :key="item.i">
          <span class="text">{{ item.i }}</span>
        </div>
      </VueGridLayout>
    </div>
  `
};

createApp(App).use(createPinia()).mount('#container');
