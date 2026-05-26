import{r as d,aS as i}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as n}from"./VueGridLayout-BFL_boXH.js";import{W as l}from"./WidthProvider-CnIrU8Vb.js";import"./createGridLayoutComponent-De6d2Lgh.js";const s=l(n),y=30,u={setup(c,{attrs:h}){const t=i({layout:Array.from({length:y},(e,a)=>{const r=Math.ceil(Math.random()*4),o=Math.ceil(Math.random()*4)+1;return{x:a*2%12,y:Math.floor(a/6)*o,w:r,h:o,i:(a+1).toString()}})});return{state:t,onLayoutChange:e=>{t.layout=e}}},components:{VueGridLayout:s},template:`
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
  `};d(u).mount("#container");
