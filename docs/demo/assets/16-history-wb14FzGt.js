import{r as s,aS as n,aD as l}from"./vue.esm-bundler-DbJ0TIm9.js";import{c as a,u}from"./history-CirNMe4T.js";import{V as d}from"./VueGridLayout-BFL_boXH.js";import{W as r}from"./WidthProvider-CnIrU8Vb.js";import"./createGridLayoutComponent-De6d2Lgh.js";const y=r(d),c=[{i:"a",x:0,y:0,w:2,h:2},{i:"b",x:2,y:0,w:2,h:2},{i:"c",x:4,y:0,w:2,h:2},{i:"d",x:6,y:0,w:2,h:2},{i:"e",x:0,y:2,w:2,h:2},{i:"f",x:2,y:2,w:2,h:2}],p={setup(){const i=a(),o=n({layout:c.map(t=>({...t})),mounted:!1}),e=u({pinia:i,maxSize:200});return e.replacePresent(o.layout),l(()=>{o.mounted=!0}),{state:o,history:e,handleLayoutChange:t=>{e.push(t)},undo:()=>{const t=e.undo();t&&o.layout.splice(0,o.layout.length,...t)},redo:()=>{const t=e.redo();t&&o.layout.splice(0,o.layout.length,...t)}}},components:{VueGridLayout:y},template:`
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
  `};s(p).use(a()).mount("#container");
