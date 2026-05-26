import{r as u,aS as y}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as h}from"./VueGridLayout-BFL_boXH.js";import"./createGridLayoutComponent-De6d2Lgh.js";const r=10,m={setup(v,{attrs:g}){setTimeout(()=>{a.items=Array.from({length:r},(e,s)=>s+1)},1e3);const n=(e,s,t,o)=>{t.h<3&&t.w>2&&(t.w=2,o.w=2),t.h>=3&&t.w<2&&(t.w=2,o.w=2)},l=e=>{a.layout=e},a=y({currentBreakpoint:"lg",compactType:"vertical",resizeHandles:["se"],mounted:!1,rowHeight:30,layout:(e=>Array.from({length:e},(s,t)=>{const o=(i,p)=>Math.floor(Math.random()*(p-i+1))+i,c=o(1,2),d=o(1,3);return{x:t*2%12,y:Math.floor(t/6),w:c,h:d,i:t.toString()}}))(r)});return{state:a,handleResize:n,layoutChange:l}},components:{VGL:h},template:`
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
        @layoutChange="layoutChange"
        @resize="handleResize"
      >
        <div v-for="(item, i) in state.items" :key="i+1">
          <span class="text">{{i+1}}</span>
        </div>
      </VGL>
    </div>
  `};u(m).mount("#container");
