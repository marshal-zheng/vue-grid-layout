import{r as d,aS as m}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as p}from"./VueGridLayout-BFL_boXH.js";import"./createGridLayoutComponent-De6d2Lgh.js";const i=10,u={setup(y,{attrs:v}){setTimeout(()=>{e.items=Array.from({length:i},(o,a)=>a+1)},1e3);const e=m({currentBreakpoint:"lg",compactType:"vertical",resizeHandles:["se"],mounted:!1,rowHeight:30,layout:(o=>Array.from({length:o},(a,t)=>{const r=(s,c)=>Math.floor(Math.random()*(c-s+1))+s,l=r(1,2),n=r(1,3);return{x:t*2%12,y:Math.floor(t/6),w:l,h:n,i:t.toString()}}))(i)});return{state:e}},components:{VGL:p},template:`
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
      >
        <div v-for="(item, i) in state.items" :key="i+1">
          <span class="text">{{i+1}}</span>
        </div>
      </VGL>
    </div>
  `};d(u).mount("#container");
