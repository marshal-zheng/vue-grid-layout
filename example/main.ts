/// <reference types="vite/client" />

import "@marsio/vue-grid-layout/style.css";

const demoModules = import.meta.glob("./*.js");

const demoAliases: Record<string, string> = {
  basic: "01-VueGridLayout",
  responsive: "02-Response",
  persistence: "18-persistence",
  editor: "23-professional-dashboard-editor",
  "dashboard-runtime": "24-dashboard-runtime-lab",
  "dashboard-shell": "25-dashboard-editor-shell",
  placement: "17-drop-strategy",
  migration: "24-dashboard-runtime-lab",
  worker: "22-layout-engine-performance"
};

const getRequestedDemo = () => {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("demo") || "00-list";
  return demoAliases[requested] || requested;
};

const renderMissingDemo = (demo: string) => {
  const container = document.querySelector("#container");
  if (!container) return;
  container.innerHTML = `
    <div>
      <h1>Vue Grid Layout Examples</h1>
      <p>Unknown example: <code>${demo}</code></p>
      <p><a href="./index.html?demo=00-list">Back to examples</a></p>
    </div>
  `;
};

const runDemo = async (demo: string) => {
  const loadDemo = demoModules[`./${demo}.js`];
  if (!loadDemo) {
    renderMissingDemo(demo);
    return;
  }
  await loadDemo();
};

void runDemo(getRequestedDemo());
