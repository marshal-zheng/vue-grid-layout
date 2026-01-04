const {VueGridLayout: VGL, Vue: VueInstance} = window;
const { createApp, ref, h, reactive, onMounted } = VueInstance

const { WidthProvider, Responsive } = VGL
const ResponsiveVueGridLayout = WidthProvider(Responsive);

const App = {
  setup(props, { attrs }) {
    const generateLayout = () => {
      return [
        { x: 0, y: 0, w: 2, h: 2, i: '1' },
        { x: 2, y: 0, w: 2, h: 3, i: '2' },
        { x: 4, y: 0, w: 2, h: 2, i: '3' },
        { x: 0, y: 2, w: 2, h: 2, i: '4' },
        { x: 6, y: 0, w: 2, h: 4, i: '5' },
      ];
    }

    const state = reactive({
      currentBreakpoint: "lg",
      mounted: false,
      layout: [],
      layouts: { lg: generateLayout() },
      dropStrategy: 'auto',
      dropCount: 5,
    })

    onMounted(() => {
      state.mounted = true
    })

    const resetLayout = () => {
      state.layouts = { lg: generateLayout() }
      state.dropCount = 5
    };

    const onBreakpointChange = ({ breakpoint }) => {
      state.currentBreakpoint = breakpoint
    };

    const onLayoutChange = (layout, layouts) => {
      state.layout = layout;
    }

    const onDrop = (layout, _event, layoutItem) => {
      state.dropCount++
      const newItems = layout.concat({
        ...layoutItem,
        i: state.dropCount.toString(),
      });
      state.layouts = { lg: newItems };
    };

    const onDropDragOver = (e) => {
      return { w: 2, h: 2 };
    };

    const toggleDropStrategy = () => {
      state.dropStrategy = state.dropStrategy === 'auto' ? 'cursor' : 'auto'
    };

    return {
      state,
      resetLayout,
      onBreakpointChange,
      onLayoutChange,
      onDrop,
      onDropDragOver,
      toggleDropStrategy,
    }
  },
  components: {
    VGL,
    ResponsiveVueGridLayout
  },
  template: `
    <div>
      <h1>Drop Strategy Demo</h1>
      <p>
        <strong>dropStrategy</strong> 属性控制外部元素拖入时的落点行为：
      </p>
      <ul>
        <li><code>cursor</code>（默认）：落点跟随鼠标光标位置</li>
        <li><code>auto</code>：自动吸附到离光标最近的已有块旁边</li>
      </ul>
      <div style="margin: 10px 0;">
        <button @click="toggleDropStrategy" style="margin-right: 10px;">
          切换策略: {{ state.dropStrategy }}
        </button>
        <button @click="resetLayout">
          重置布局
        </button>
      </div>
      <div style="margin: 10px 0; padding: 10px; background: #e8f4e8; border-radius: 4px;">
        当前策略：<strong>{{ state.dropStrategy === 'auto' ? '自动吸附 (auto)' : '跟随光标 (cursor)' }}</strong>
        <span v-if="state.dropStrategy === 'auto'" style="color: #666;">
          — 拖入的元素会吸附到离光标最近的已有块旁边
        </span>
        <span v-else style="color: #666;">
          — 拖入的元素会放到鼠标位置
        </span>
      </div>
      <div class="layoutJSON">
        Displayed as <code>[x, y, w, h]</code>:
        <div class="columns">
          <div v-for="l in state.layout" :key="l.i" class="layoutItem">
            <b>{{ l.i === '__dropping-elem__' ? 'drop' : l.i }}</b>
            {{ ': [' + l.x + ',' + l.y + ',' + l.w + ',' + l.h + ']' }}
          </div>
        </div>
      </div>
      <div
        class="droppable-element"
        :draggable="true"
        unselectable="on"
        onDragStart="(e) => e.dataTransfer.setData('text/plain', '')"
      >
        拖拽我到下方网格！
      </div>
      <ResponsiveVueGridLayout
        class="layout"
        :rowHeight="30"
        :cols="{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }"
        :layouts="state.layouts"
        @breakpointChange="onBreakpointChange"
        @layoutChange="onLayoutChange"
        @dropDragOver="onDropDragOver"
        @drop="onDrop"
        :measureBeforeMount="false"
        :useCSSTransforms="state.mounted"
        :containerPadding="[16, 16]"
        :isDroppable="true"
        :dropStrategy="state.dropStrategy"
      >
        <div v-for="l in state.layouts.lg" :key="l.i">
          <span class="text">{{ l.i }}</span>
        </div>
      </ResponsiveVueGridLayout>
    </div>
  `
};

createApp(App).mount('#container')
