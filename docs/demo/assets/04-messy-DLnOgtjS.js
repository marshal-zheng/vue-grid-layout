import{r as o,aS as i}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as r}from"./VueGridLayout-BFL_boXH.js";import{W as s}from"./WidthProvider-CnIrU8Vb.js";import"./createGridLayoutComponent-De6d2Lgh.js";const l=s(r),n=30,d={setup(u,{attrs:c}){return{state:i({layout:Array.from({length:n},(p,t)=>{const a=Math.ceil(Math.random()*4),e=Math.ceil(Math.random()*4)+1;return{x:t*2%12,y:Math.floor(t/6)*e,w:a,h:e,i:(t+1).toString()}})})}},components:{VueGridLayout:l},template:`
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
        v-model="state.layout"
        :isDraggable="false"
        :isResizable="false"
        :rowHeight="30"
        :cols="12"
        :containerPadding="[16, 16]"
      >
        <div v-for="item in state.layout" :key="item.i">
          <span class="text">{{ item.i }}</span>
        </div>
      </VueGridLayout>
    </div>
  `};o(d).mount("#container");
