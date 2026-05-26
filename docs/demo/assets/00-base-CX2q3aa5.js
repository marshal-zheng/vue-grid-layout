import{a5 as t,r as e,aS as s,aD as l}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as a}from"./VueGridLayout-BFL_boXH.js";import{W as d}from"./WidthProvider-CnIrU8Vb.js";import"./createGridLayoutComponent-De6d2Lgh.js";const o=d(a);t("span",{class:"custom-handle custom-handle-se"});const y={setup(c,{attrs:v}){const i=s({mounted:!1,rowHeight:30,layout:[{i:"a",x:0,y:0,w:1,h:2,static:!1},{i:"b",x:1,y:0,w:3,h:2,minW:2,maxW:4},{i:"c",x:4,y:0,w:1,h:2}],layout2:[],availableHandles:["s","w","e","n","sw","nw","se","ne"]});return l(()=>{}),{state:i}},components:{VGL:a,VueGridLayout:o},template:`
    <div>
        <div class="layoutJSON">
          Displayed as <code>[x, y, w, h]</code>:
          <div class="columns">
            <div v-for="l in state.layout1" :key="l.i" class="layoutItem">
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
          :resizeHandles="state.availableHandles"
        >
          <div key="a">a</div>
          <div key="b">b</div>
          <div key="c">c</div>
        </VGL>
          <div class="layoutJSON">
            Displayed as <code>[x, y, w, h]</code>:
            <div class="columns">
              <div v-for="l in state.layout2" :key="l.i" class="layoutItem">
                <b>{{ l.i === '__dropping-elem__' ? 'drop' : l.i }}</b>
                {{ ":"+l.x+","+l.y+","+l.w+","+l.h }}
              </div>
            </div>
          </div>
        <VGL
          class="layout"
          v-model="state.layout2"
          :cols="12"
          :rowHeight="30"
          :width="1200"
        >
          <div key="a" :data-grid="{ x: 0, y: 0, w: 1, h: 2, static: true }">
            a
          </div>
          <div key="b" :data-grid="{ x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 }">
            b
          </div>
          <div key="c" :data-grid="{ x: 4, y: 0, w: 1, h: 2 }">
            c
          </div>
        </VGL>
    </div>
  `};e(y).mount("#container");
