const { Vue: VueInstance } = window;
const { createApp } = VueInstance;

const demos = [
  ["Main responsive playground", "example"],
  ["Basic", "01-VueGridLayout"],
  ["Responsive", "02-Response"],
  ["No Dragging", "03-no-dragging"],
  ["Messy", "04-messy"],
  ["Static Elements", "05-static-elements"],
  ["Dynamic Add/Remove", "06-dynamic-add-remove"],
  ["Drag From Outside", "07-drag-from-outside"],
  ["Minimum and Maximum Width/Height", "08-min-max-wh"],
  ["Dynamic Min/Max Width/Height", "09-dynamic-min-max-wh"],
  ["No Vertical Compacting", "10-no-vertical-compact"],
  ["Prevent Collision", "11-prevent-collision"],
  ["Toolbox", "12-toolbox"],
  ["Bounded Layout", "13-bounded"],
  ["Responsive Bootstrap-style Layout", "14-responsive-bootstrap-style"],
  ["Allow Overlap", "15-allow-overlap"],
  ["History / Undo-Redo", "16-history"],
  ["Drop Strategy", "17-drop-strategy"],
  ["Persistence - localStorage", "18-persistence"],
  ["Persistence - sessionStorage", "19-persistence-sessionstorage"],
  ["Persistence - IndexedDB", "20-persistence-indexeddb"],
  ["Persistence - Remote HTTP", "21-persistence-remote-http"],
  ["Layout Engine Diagnostics / Worker", "22-layout-engine-performance"],
  ["Professional Dashboard Editor", "23-professional-dashboard-editor"]
];

const App = {
  setup() {
    return { demos };
  },
  template: `
    <div>
      <h1>Vue Grid Layout Examples</h1>
      <p>Choose an example:</p>
      <ol style="line-height: 1.9; padding-left: 24px;">
        <li v-for="demo in demos" :key="demo[1]">
          <a :href="'./index.html?demo=' + demo[1]">{{ demo[0] }}</a>
          <code style="margin-left: 8px;">{{ demo[1] }}</code>
        </li>
      </ol>
    </div>
  `
};

createApp(App).mount("#container");
