import{r as o,aS as e}from"./vue.esm-bundler-DbJ0TIm9.js";import{V as r}from"./VueGridLayout-BFL_boXH.js";import{W as i}from"./WidthProvider-CnIrU8Vb.js";import"./createGridLayoutComponent-De6d2Lgh.js";const s=i(r),l=30,n={setup(d,{attrs:u}){return{state:e({layout:Array.from({length:l},(c,t)=>{const a=Math.ceil(Math.random()*4)+1;return{x:Math.round(Math.random()*5)*2,y:Math.floor(t/6)*a,w:2,h:a,i:(t+1).toString()}})})}},components:{VueGridLayout:s},template:`
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
      {{state.layout}}
      <VueGridLayout
        v-model="state.layout"
        :rowHeight="30"
        :cols="12"
        :allowOverlap="true"
        :containerPadding="[16, 16]"
      >
        <div v-for="item in state.layout" :key="item.i">
          <span class="text">{{ item.i }}</span>
        </div>
      </VueGridLayout>
    </div>
  `};o(n).mount("#container");
