import { createApp, computed, reactive, onMounted, defineComponent } from "vue/dist/vue.esm-bundler.js";
import VGL, { WidthProvider } from "@marsio/vue-grid-layout";
import { ResponsiveVueGridLayout as Responsive } from "@marsio/vue-grid-layout/responsive";
import {
  createToolboxLayoutModel,
  getToolboxLayoutView,
  reduceToolboxLayoutModel
} from "./toolbox-layout-model.mjs";

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
    <button type="button" class="toolbox__items__item" @click="handleClick">
      {{ item.i }}
    </button>
  `
});

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
          i: (i + 1).toString(), // 从1开始
          static: (i + 1) % 4 === 0,
          resizeHandles
        };
      });
    }

    const initialLayout = generateLayout(['se']);
    const state = reactive({
      currentBreakpoint: "lg",
      compactType: "vertical",
      mounted: false,
      toolboxModel: createToolboxLayoutModel({ lg: initialLayout }),
    })

    const updateToolboxModel = action => {
      state.toolboxModel = reduceToolboxLayoutModel(state.toolboxModel, action);
    };

    const currentView = computed(() => getToolboxLayoutView(state.toolboxModel, state.currentBreakpoint));
    const currentLayout = computed(() => currentView.value.layout);
    const currentToolbox = computed(() => currentView.value.toolbox);

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
      const breakpoint = state.currentBreakpoint;
      const layout = generateLayout(['se']);
      updateToolboxModel({ type: "resetLayout", breakpoint, layout });
    };

    const onBreakpointChange = (breakpoint) => {
      state.currentBreakpoint = breakpoint
      updateToolboxModel({
        type: "ensureBreakpoint",
        breakpoint,
        layout: state.toolboxModel.visibleLayouts[breakpoint] || []
      });
    };

    const onLayoutChange = (layout, layouts) => {
      if (layouts) updateToolboxModel({ type: "syncLayouts", layouts });
    }

    const onPutItem = item => {
      updateToolboxModel({
        type: "putItem",
        breakpoint: state.currentBreakpoint,
        item
      });
    };

    const onTakeItem = item => {
      updateToolboxModel({
        type: "takeItem",
        breakpoint: state.currentBreakpoint,
        item
      });
    };
  
    return {
      state,
      currentLayout,
      currentToolbox,
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
          <ToolBoxItem
            v-for="item in currentToolbox"
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
        :layouts="state.toolboxModel.visibleLayouts"
        @breakpointChange="onBreakpointChange"
        @layoutChange="onLayoutChange"
        draggableCancel=".hide-button"
        :measureBeforeMount="false"
        :useCSSTransforms="state.mounted"
        :compactType="state.compactType"
        :preventCollision="!state.compactType"
        :containerPadding="[16, 16]"
      >
        <div v-for="l in currentLayout" :key="l.i" :class="{ static: l.static }">
          <button v-if="!l.static" type="button" class="hide-button" :aria-label="'Move item ' + l.i + ' to toolbox'" @click.stop="onPutItem(l)">
            &times;
          </button>
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
