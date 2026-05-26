import{r as T,aU as d,aS as U,q as l,aD as V}from"./vue.esm-bundler-DbJ0TIm9.js";import{W as z}from"./WidthProvider-CnIrU8Vb.js";import{m as N,u as q}from"./persistence-CMJrtt_j.js";import{b as B,a as X,E as Y,i as j}from"./EditorGridLayout-gJeOxgVF.js";import"./createGridLayoutComponent-De6d2Lgh.js";const K=z(Y),p=i=>i.map(s=>({...s})),g=()=>[{i:"revenue",x:0,y:0,w:3,h:3},{i:"pipeline",x:3,y:0,w:3,h:3},{i:"retention",x:6,y:0,w:3,h:3},{i:"forecast",x:9,y:0,w:3,h:3},{i:"region",x:0,y:3,w:4,h:3},{i:"accounts",x:4,y:3,w:4,h:3},{i:"health",x:8,y:3,w:4,h:3,static:!0}],y={revenue:"Revenue",pipeline:"Pipeline",retention:"Retention",forecast:"Forecast",region:"Region Mix",accounts:"Accounts",health:"Customer Health"},W=()=>Array.from({length:520},(i,s)=>({i:`m-${s+1}`,x:s%12,y:Math.floor(s/12),w:1,h:1})),Z={setup(){const i=d(p(g())),s=d("edit"),u=d({forecast:{locked:!0,label:"Forecast",copyable:!0},health:{label:"Customer Health"}}),b=d({version:1,items:{executive:{id:"executive",kind:"row",label:"Executive KPIs",order:1,bounds:{x:0,y:0,w:12,h:3},itemIds:["revenue","pipeline","retention","forecast"],dropPolicy:"inside",crossScopePolicy:"block",allowedDropZones:["inside","between"]},customer:{id:"customer",kind:"row",label:"Customer Detail",order:2,bounds:{x:0,y:3,w:12,h:3},itemIds:["region","accounts","health"],dropPolicy:"inside",crossScopePolicy:"block",allowedDropZones:["inside","between"]}},itemMembership:{revenue:{rowId:"executive"},pipeline:{rowId:"executive"},retention:{rowId:"executive"},forecast:{rowId:"executive"},region:{rowId:"customer"},accounts:{rowId:"customer"},health:{rowId:"customer"}}}),m=d(!1),t=U({mounted:!1,lastEvent:"(none)",lastResult:"(none)",ariaMessage:"",conflict:"",largeLayout:!1,debugGuides:!1,predictiveGuides:!0,spacingChips:!0,measurementHud:!0,sectionSnap:!0}),n=N(),r=q({key:"professional-editor-demo",kind:"layout",target:i,adapter:{load:e=>n.load(e),save:(e,o)=>{if(m.value)throw m.value=!1,new Error("Simulated save failure");return n.save(e,o)},remove:e=>n.remove(e),subscribe:(e,o)=>n.subscribe?n.subscribe(e,o):()=>{}},autoSave:!1,meta:()=>({editor:B(u.value,b.value)}),onEvent:e=>{t.lastEvent=e.type}}),a=X({layout:i,mode:s,editorMetaById:u,sectionRows:b,persistence:r,layoutEngineOptions:{cols:12,maxRows:1/0,compactType:"vertical",allowOverlap:!1,preventCollision:!1,diagnostics:{debug:!0}},clipboard:j,guides:{enabled:!0,snap:!0,maxItems:500,maxVisibleGuides:{drag:3,drop:3,resize:2},showGrid:"interaction",showSpacingLabels:!0,predictRadiusX:2,predictRadiusY:1,snapThresholdCells:.5,showSpacingChips:!0,showMeasurementHud:!0,highlightAlignmentTargets:!0,detectEqualSpacing:!0,sectionSnap:!0,itemLabels:y},keyboard:{ariaMessage:e=>{t.ariaMessage=`${e.level}: ${e.message}`}},commandPolicy:"skip-blocked",beforeCommand:async({command:e,targetIds:o})=>e.type==="delete"&&o.includes("forecast")?{status:"block",reason:"before-command-blocked",message:"Forecast is protected by a demo policy."}:{status:"allow"},onEvent:e=>{var o;t.lastEvent=e.type,(e.type==="command-blocked"||e.type==="command-error"||e.type==="command-commit")&&(t.lastResult=`${e.result.type}: ${e.result.status}`,(o=e.result.blocked)!=null&&o.message&&(t.ariaMessage=e.result.blocked.message)),e.type==="conflict"&&(t.conflict=e.conflict.reason)}}),v=l(()=>({enabled:!0,snap:!0,maxItems:500,maxVisibleGuides:{drag:3,drop:3,resize:2},showGrid:"interaction",showSpacingLabels:!0,predictRadiusX:t.predictiveGuides?2:.5,predictRadiusY:t.predictiveGuides?1:.5,snapThresholdCells:.5,showSpacingChips:t.spacingChips,showMeasurementHud:t.measurementHud,highlightAlignmentTargets:!0,detectEqualSpacing:!0,sectionSnap:t.sectionSnap,itemLabels:y,debug:t.debugGuides?"layer":!1})),k=l(()=>({controller:a,commandPolicy:"skip-blocked",keyboard:{ariaMessage:e=>{t.ariaMessage=`${e.level}: ${e.message}`}},guides:v.value}));V(()=>{t.mounted=!0,r.load()});const f=e=>{a.execute(e)},h=()=>{a.save()},S=()=>{m.value=!0,h()},x=()=>{r.discard(),a.setExternalLayout(i.value,"discard"),t.lastResult="discard: changed"},C=()=>{i.value=p(g()),u.value={forecast:{locked:!0,label:"Forecast",copyable:!0},health:{label:"Customer Health"}},r.reset(i.value),a.setExternalLayout(i.value,"reset"),t.largeLayout=!1,t.lastResult="reset: changed"},R=()=>{t.conflict="dirty-external-change",t.lastEvent="conflict",t.ariaMessage="External change detected; local layout is still in memory."},D=()=>{t.largeLayout=!t.largeLayout,i.value=t.largeLayout?W():p(g()),a.setExternalLayout(i.value,"large-layout-toggle")},$=()=>{t.debugGuides=!t.debugGuides},L=()=>{t.predictiveGuides=!t.predictiveGuides},G=()=>{t.spacingChips=!t.spacingChips},E=()=>{t.measurementHud=!t.measurementHud},I=()=>{t.sectionSnap=!t.sectionSnap},P=l(()=>a.selection.value.selectedIds.join(", ")||"(none)"),c=l(()=>a.getToolbarState()),H=l(()=>c.value.selectionSummary.sectionRowIds[0]||"executive"),M=e=>{var o;return!((o=c.value.commands[e])!=null&&o.enabled)},F=e=>{var o;return((o=c.value.commands[e])==null?void 0:o.messageKey)||""},A=l(()=>{var w;const e=a.guides.value.diagnostics;return e?`${((w=a.guides.value.displayGuides)==null?void 0:w.length)||0}/${a.guides.value.guides.length} shown, ${e.itemCount} items${e.degraded?", degraded":""}, predict ${e.predictCount||0}, snapped ${e.snappedCount||0}, chips ${e.spacingChipCount||0}, anchors ${e.anchorEdgeCount||0}`:"guides idle"}),O=l(()=>{const e=a.guides.value.measurementHud;if(!e)return"(idle)";const o=e.delta&&(e.delta.dw||e.delta.dh||e.delta.dx||e.delta.dy)?` Δ ${e.delta.dw?`${e.delta.dw}c `:""}${e.delta.dh?`${e.delta.dh}r `:""}${e.delta.dx?`x${e.delta.dx} `:""}${e.delta.dy?`y${e.delta.dy}`:""}`:"";return`${e.label||e.itemId} ${e.size.w}×${e.size.h} @ ${e.position.x},${e.position.y}${o}${e.blocked?` (blocked: ${e.blocked})`:""}`});return{layout:i,labels:y,mode:s,editor:a,editorProp:k,sectionRows:b,guideOptions:v,state:t,persistence:r,selectedSummary:P,toolbarState:c,primarySectionRowId:H,commandDisabled:M,disabledReason:F,guideSummary:A,hudSummary:O,run:f,save:h,failSave:S,discard:x,reset:C,simulateConflict:R,toggleLargeLayout:D,toggleDebugGuides:$,togglePredictive:L,toggleChips:G,toggleHud:E,toggleSectionSnap:I}},components:{VueGridLayout:K},template:`
    <div>
      <h1>Professional Dashboard Editor</h1>
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin:10px 0;">
        <button @click="mode = mode === 'edit' ? 'view' : 'edit'">{{ mode === 'edit' ? 'View' : 'Edit' }}</button>
        <button @click="run({ type: 'duplicate', source: 'toolbar' })">Duplicate</button>
        <button @click="run({ type: 'delete', source: 'toolbar' })">Delete</button>
        <button @click="run({ type: 'lock', source: 'toolbar' })">Lock</button>
        <button @click="run({ type: 'unlock', source: 'toolbar' })">Unlock</button>
        <button @click="run({ type: 'hide', source: 'toolbar' })">Hide</button>
        <button @click="run({ type: 'show', targetIds: Object.keys(editor.editorMetaById.value), source: 'toolbar' })">Show all</button>
        <button @click="run({ type: 'copy', source: 'toolbar' })">Copy</button>
        <button @click="run({ type: 'paste', source: 'toolbar', payload: { strategy: 'nearest-fit', cols: 12 } })">Paste</button>
        <button :disabled="commandDisabled('align')" :title="disabledReason('align')" @click="run({ type: 'align', source: 'toolbar', payload: { mode: 'left', cols: 12 } })">Align L</button>
        <button :disabled="commandDisabled('align')" :title="disabledReason('align')" @click="run({ type: 'align', source: 'toolbar', payload: { mode: 'center-x', cols: 12 } })">Align CX</button>
        <button :disabled="commandDisabled('align')" :title="disabledReason('align')" @click="run({ type: 'align', source: 'toolbar', payload: { mode: 'right', cols: 12 } })">Align R</button>
        <button :disabled="commandDisabled('align')" :title="disabledReason('align')" @click="run({ type: 'align', source: 'toolbar', payload: { mode: 'top', cols: 12 } })">Align T</button>
        <button :disabled="commandDisabled('align')" :title="disabledReason('align')" @click="run({ type: 'align', source: 'toolbar', payload: { mode: 'center-y', cols: 12 } })">Align CY</button>
        <button :disabled="commandDisabled('align')" :title="disabledReason('align')" @click="run({ type: 'align', source: 'toolbar', payload: { mode: 'bottom', cols: 12 } })">Align B</button>
        <button :disabled="commandDisabled('distribute')" :title="disabledReason('distribute')" @click="run({ type: 'distribute', source: 'toolbar', payload: { mode: 'horizontal', strategy: 'edge-to-edge', cols: 12 } })">Distribute H</button>
        <button :disabled="commandDisabled('distribute')" :title="disabledReason('distribute')" @click="run({ type: 'distribute', source: 'toolbar', payload: { mode: 'vertical', strategy: 'edge-to-edge', cols: 12 } })">Distribute V</button>
        <button :disabled="commandDisabled('tidy')" :title="disabledReason('tidy')" @click="run({ type: 'tidy', source: 'toolbar', payload: { axis: 'both', minSpacing: 1, cols: 12 } })">Tidy</button>
        <button :disabled="commandDisabled('section-row-collapse')" :title="disabledReason('section-row-collapse')" @click="run({ type: 'section-row-collapse', source: 'toolbar', payload: { id: primarySectionRowId } })">Collapse row</button>
        <button :disabled="commandDisabled('section-row-expand')" :title="disabledReason('section-row-expand')" @click="run({ type: 'section-row-expand', source: 'toolbar', payload: { id: primarySectionRowId } })">Expand row</button>
        <button :disabled="commandDisabled('section-row-move')" :title="disabledReason('section-row-move')" @click="run({ type: 'section-row-move', source: 'toolbar', payload: { id: primarySectionRowId, dy: 1, cols: 12 } })">Move row</button>
        <button :disabled="commandDisabled('section-row-reorder')" :title="disabledReason('section-row-reorder')" @click="run({ type: 'section-row-reorder', source: 'toolbar', payload: { id: primarySectionRowId, order: 0 } })">Reorder row</button>
        <button :disabled="commandDisabled('section-row-delete')" :title="disabledReason('section-row-delete')" @click="run({ type: 'section-row-delete', source: 'toolbar', payload: { id: primarySectionRowId } })">Clear row metadata</button>
        <button @click="editor.undo()">Undo</button>
        <button @click="editor.redo()">Redo</button>
        <button @click="save">Save</button>
        <button @click="failSave">Fail save</button>
        <button @click="discard">Discard</button>
        <button @click="reset">Reset</button>
        <button @click="simulateConflict">Simulate conflict</button>
        <button @click="toggleLargeLayout">{{ state.largeLayout ? 'Small layout' : '500+ layout' }}</button>
        <button @click="toggleDebugGuides">{{ state.debugGuides ? 'User guides' : 'Debug guides' }}</button>
        <button @click="togglePredictive">{{ state.predictiveGuides ? 'Predict ON' : 'Predict OFF' }}</button>
        <button @click="toggleChips">{{ state.spacingChips ? 'Chips ON' : 'Chips OFF' }}</button>
        <button @click="toggleHud">{{ state.measurementHud ? 'HUD ON' : 'HUD OFF' }}</button>
        <button @click="toggleSectionSnap">{{ state.sectionSnap ? 'Section snap ON' : 'Section snap OFF' }}</button>
      </div>
      <div class="layoutJSON">
        <strong>Mode:</strong> {{ mode }} |
        <strong>State:</strong> {{ editor.state.value }} |
        <strong>Dirty:</strong> {{ editor.dirty.value }} |
        <strong>Persistence:</strong> {{ persistence.status.value }} |
        <strong>Selected:</strong> {{ selectedSummary }}
        <div><strong>Toolbar:</strong> {{ toolbarState.selectionSummary.count }} selected, align {{ toolbarState.commands.align?.enabled ? 'enabled' : toolbarState.commands.align?.reason }}, distribute {{ toolbarState.commands.distribute?.enabled ? 'enabled' : toolbarState.commands.distribute?.reason }}</div>
        <div><strong>Guides:</strong> {{ guideSummary }}</div>
        <div><strong>HUD:</strong> {{ hudSummary }}</div>
        <div><strong>Group move:</strong> Ctrl/Cmd-click cards, then drag a selected card or use arrow keys. Forecast is editor-locked; Customer Health is layout static.</div>
        <div><strong>Last event:</strong> {{ state.lastEvent }} | <strong>Last result:</strong> {{ state.lastResult }}</div>
        <div v-if="state.ariaMessage" style="color:#8a4b00;">{{ state.ariaMessage }}</div>
        <div v-if="state.conflict" style="color:#b00020;">Conflict: {{ state.conflict }}</div>
      </div>
      <VueGridLayout
        class="layout"
        v-model="layout"
        :cols="12"
        :rowHeight="42"
        :useCSSTransforms="state.mounted"
        :editor="editorProp"
        :layoutEngine="{ scheduler: { mode: 'auto', auto: { workerMinItems: 500 } }, diagnostics: true }"
      >
        <div v-for="item in layout" :key="item.i" :class="{ static: item.static }">
          <span class="text">{{ labels[item.i] || item.i }}</span>
          <small style="display:block;font-size:11px;color:#666;">{{ item.x }},{{ item.y }} / {{ item.w }}x{{ item.h }}</small>
        </div>
      </VueGridLayout>
    </div>
  `};T(Z).mount("#container");
