import{r,aS as l}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as n}from"./VueGridLayout-BFL_boXH.js";import"./createGridLayoutComponent-De6d2Lgh.js";const i=14,c={setup(d,{attrs:m}){setTimeout(()=>{e.items=Array.from({length:i},(a,o)=>o+1)},1e3);const e=l({currentBreakpoint:"lg",compactType:"vertical",resizeHandles:["se"],mounted:!1,rowHeight:30,layout:(a=>new Array(a).fill().map((o,t)=>{const s=Math.ceil(Math.random()*4)+1;return{x:t*2%12,y:Math.floor(t/6)*s,w:2,h:s,i:(t+1).toString(),resizeHandles:["s","w","e","n","sw","nw","se","ne"]}}))(i)});return{state:e}},components:{VGL:n},template:`
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
  `};r(c).mount("#container");
