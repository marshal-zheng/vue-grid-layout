import{r as se,aU as o,q as m,bE as ne,aD as le,az as de}from"./vue.esm-bundler-DbJ0TIm9.js";import{c as A,u as ce,b as pe}from"./history-CirNMe4T.js";import{a as ue,b as ge,r as $,s as me,w as be,m as ve,D as he}from"./dashboard-migration-DTieP06g.js";import"./createGridLayoutComponent-De6d2Lgh.js";import"./EditorGridLayout-gJeOxgVF.js";import"./persistence-CMJrtt_j.js";const E=document.createElement("style");E.textContent=`
  .dashboard-migration-example {
    --surface: #ffffff;
    --canvas: #f3f2f1;
    --panel: #faf9f8;
    --border: #edebe9;
    --border-strong: #c8c6c4;
    --text: #323130;
    --muted: #605e5c;
    --subtle: #8a8886;
    --accent: #0078d4;
    --accent-dark: #106ebe;
    --warning: #8a6a00;
    --danger: #a4262c;
    color: var(--text);
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
  }

  .dashboard-migration-example * {
    box-sizing: border-box;
  }

  .dashboard-migration-example h1,
  .dashboard-migration-example h2,
  .dashboard-migration-example h3,
  .dashboard-migration-example p {
    margin: 0;
  }

  .demo-header {
    align-items: flex-start;
    display: flex;
    gap: 16px;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .demo-title {
    display: grid;
    gap: 4px;
    max-width: 860px;
  }

  .demo-title h1 {
    color: #201f1e;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0;
  }

  .demo-title p {
    color: var(--muted);
    font-size: 13px;
  }

  .demo-state {
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 4px;
    display: flex;
    gap: 8px;
    min-height: 32px;
    padding: 6px 10px;
    white-space: nowrap;
  }

  .state-dot {
    background: #107c10;
    border-radius: 50%;
    height: 8px;
    width: 8px;
  }

  .demo-state.warning .state-dot {
    background: var(--warning);
  }

  .demo-state.error .state-dot {
    background: var(--danger);
  }

  .demo-state span:last-child {
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
  }

  .command-bar {
    align-items: stretch;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    margin-bottom: 16px;
    min-height: 44px;
  }

  .command-group {
    align-items: center;
    border-right: 1px solid var(--border);
    display: flex;
    gap: 6px;
    padding: 6px 10px;
  }

  .command-group:last-child {
    border-right: 0;
  }

  .command-label {
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
    margin-right: 4px;
  }

  .command-button {
    appearance: none;
    background: var(--surface);
    border: 1px solid transparent;
    border-radius: 2px;
    color: var(--text);
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    min-height: 30px;
    padding: 5px 10px;
  }

  .command-button:hover {
    background: #f3f2f1;
    border-color: var(--border-strong);
  }

  .command-button:disabled {
    color: var(--subtle);
    cursor: default;
    opacity: 0.55;
  }

  .command-button:disabled:hover {
    background: var(--surface);
    border-color: transparent;
  }

  .command-button.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #ffffff;
    font-weight: 600;
  }

  .command-button.primary:hover {
    background: var(--accent-dark);
    border-color: var(--accent-dark);
  }

  .command-button.selected {
    background: #eff6fc;
    border-color: #c7e0f4;
    color: #004578;
    font-weight: 600;
  }

  .work-area {
    align-items: start;
    display: grid;
    gap: 16px;
    grid-template-columns: minmax(0, 1fr) 360px;
  }

  .canvas-panel,
  .side-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    min-width: 0;
  }

  .canvas-panel {
    overflow: hidden;
  }

  .panel-header {
    align-items: flex-start;
    border-bottom: 1px solid var(--border);
    display: flex;
    gap: 16px;
    justify-content: space-between;
    padding: 12px 14px;
  }

  .panel-heading {
    display: grid;
    gap: 2px;
  }

  .panel-heading h2,
  .side-section h3 {
    color: #201f1e;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0;
  }

  .panel-heading span {
    color: var(--muted);
    font-size: 12px;
  }

  .compact-meta {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }

  .meta-item {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--muted);
    font-size: 12px;
    padding: 4px 7px;
    white-space: nowrap;
  }

  .dashboard-canvas {
    background: var(--canvas);
    min-height: 380px;
  }

  .dashboard-canvas.vue-grid-layout {
    margin-top: 0;
  }

  .dashboard-canvas .vue-grid-item:not(.vue-grid-placeholder) {
    background: transparent;
    border: 0;
  }

  .dashboard-canvas .vue-grid-placeholder {
    background: rgba(0, 120, 212, 0.12);
    border: 1px dashed var(--accent);
  }

  .widget-slot {
    height: 100%;
    min-width: 0;
  }

  .widget-card {
    background: var(--surface);
    border: 1px solid var(--border-strong);
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100%;
    min-width: 0;
    padding: 12px;
  }

  .widget-card.warning {
    border-left: 3px solid var(--warning);
  }

  .widget-card.locked {
    background: #faf9f8;
  }

  .widget-top {
    align-items: start;
    display: flex;
    gap: 8px;
    justify-content: space-between;
    min-width: 0;
  }

  .widget-title {
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-type {
    color: var(--subtle);
    flex: 0 0 auto;
    font-size: 11px;
  }

  .widget-body {
    align-content: center;
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .widget-value {
    color: #201f1e;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-detail {
    color: var(--muted);
    font-size: 12px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-foot {
    color: var(--subtle);
    font-size: 11px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .side-panel {
    display: grid;
    gap: 0;
  }

  .side-section {
    border-bottom: 1px solid var(--border);
    display: grid;
    gap: 10px;
    padding: 14px;
  }

  .side-section:last-child {
    border-bottom: 0;
  }

  .property-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .property {
    border-bottom: 1px solid var(--border);
    min-width: 0;
    padding-bottom: 7px;
  }

  .property span {
    color: var(--muted);
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .property strong {
    color: var(--text);
    display: block;
    font-size: 14px;
    font-weight: 600;
    margin-top: 2px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .result-box {
    background: var(--panel);
    border: 1px solid var(--border);
    display: grid;
    gap: 4px;
    padding: 10px;
  }

  .result-title {
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
  }

  .result-detail {
    color: var(--muted);
    font-size: 12px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .diagnostic-table {
    border-collapse: collapse;
    width: 100%;
  }

  .diagnostic-table th,
  .diagnostic-table td {
    border-bottom: 1px solid var(--border);
    font-size: 12px;
    padding: 7px 0;
    text-align: left;
    vertical-align: top;
  }

  .diagnostic-table th {
    color: var(--muted);
    font-weight: 600;
  }

  .diagnostic-table td {
    color: var(--text);
  }

  .diagnostic-table .warning {
    color: var(--warning);
    font-weight: 600;
  }

  .diagnostic-table .error {
    color: var(--danger);
    font-weight: 600;
  }

  .empty-copy {
    color: var(--muted);
    font-size: 12px;
  }

  @media (max-width: 980px) {
    .demo-header,
    .panel-header {
      display: grid;
    }

    .demo-state,
    .compact-meta {
      justify-content: flex-start;
    }

    .work-area {
      grid-template-columns: 1fr;
    }

    .command-bar {
      display: grid;
    }

    .command-group {
      border-bottom: 1px solid var(--border);
      border-right: 0;
      flex-wrap: wrap;
    }

    .command-group:last-child {
      border-bottom: 0;
    }
  }
`;document.head.appendChild(E);let fe=0;const we=a=>JSON.parse(JSON.stringify(a)),xe=[{id:"revenue",title:"Revenue",type:"Metric",value:"$482K",detail:"QTD actual"},{id:"pipeline",title:"Pipeline",type:"Metric",value:"$1.9M",detail:"Weighted forecast"},{id:"utilization",title:"Utilization",type:"Metric",value:"84%",detail:"Team capacity"},{id:"service",title:"Service Health",type:"Locked",value:"Stable",detail:"Static governance tile",locked:!0},{id:"incidents",title:"Open Incidents",type:"Review",value:"17",detail:"Imported overlap candidate",warning:!0},{id:"region",title:"Region Performance",type:"Map",value:"5 zones",detail:"Hidden in mobile profile"}],V={mobile:0,tablet:720,default:1100},D={default:{label:"Desktop",width:1e3,breakpoint:"default",targetView:"desktop"},tablet:{label:"Tablet",width:860,breakpoint:"tablet",targetView:"desktop"},mobile:{label:"Mobile",width:390,breakpoint:"mobile",targetView:"mobile"}},ye=new Set(["deferred-layout-slot","settings-default","target-view-default","unsupported-field","unsupported-profile-field","list-height-source"]),M=a=>!a||ye.has(a.code)||a.code==="profile-fallback"&&a.profileId==="default"?!1:a.level==="warning"||a.level==="error",ze=a=>me(a,{key:"dashboard-migration-example",sourceId:"example-dashboard-migration",revision:()=>`migration-demo-${++fe}`,now:()=>new Date("2026-05-19T00:00:00.000Z")}),L=()=>ze({dashboardSchemaVersion:he,kind:"dashboard-layout",key:"dashboard-migration-example",revision:"seed",sourceId:"example-dashboard-migration",savedAt:"2026-05-19T00:00:00.000Z",primaryLayoutId:"default",layouts:{default:{widgets:{revenue:{col:0,row:0,sizeX:6,sizeY:3,minSizeX:3,mobileOrder:0,mobileHeight:3},pipeline:{col:6,row:0,sizeX:6,sizeY:3,minSizeX:3,mobileOrder:1,mobileHeight:3},utilization:{col:12,row:0,sizeX:6,sizeY:3,minSizeX:3,mobileOrder:2,mobileHeight:3},service:{col:18,row:0,sizeX:6,sizeY:3,static:!0,draggable:!1,resizable:!1,mobileOrder:3,mobileHeight:2},incidents:{col:0,row:3,sizeX:10,sizeY:4,minSizeX:4,mobileOrder:4,mobileHeight:3},region:{col:10,row:3,sizeX:14,sizeY:4,minSizeX:6,mobileHide:!0,mobileOrder:5,mobileHeight:4,preserveAspectRatio:!0,aspectRatio:2.6}},gridSettings:{columns:24,minColumns:6,margin:[8,8],containerPadding:[12,12],rowHeight:48,heightMode:"auto",minRowHeight:28,renderPrecision:"integer"},profiles:{tablet:{widgets:{revenue:{col:0,row:0,sizeX:4,sizeY:3},pipeline:{col:4,row:0,sizeX:4,sizeY:3},utilization:{col:8,row:0,sizeX:4,sizeY:3},service:{col:0,row:3,sizeX:6,sizeY:3},incidents:{col:6,row:3,sizeX:6,sizeY:3},region:{col:0,row:6,sizeX:12,sizeY:4}},gridSettings:{columns:12,margin:[8,8],containerPadding:[10,10],rowHeight:46,heightMode:"fit",renderPrecision:"subpixel"}},mobile:{widgets:{revenue:{col:0,row:0,sizeX:6,sizeY:3,mobileOrder:0,mobileHeight:3},pipeline:{col:0,row:3,sizeX:6,sizeY:3,mobileOrder:1,mobileHeight:3},utilization:{col:0,row:6,sizeX:6,sizeY:3,mobileOrder:2,mobileHeight:3},service:{col:0,row:9,sizeX:6,sizeY:2,mobileOrder:3,mobileHeight:2},incidents:{col:0,row:11,sizeX:6,sizeY:3,mobileOrder:4,mobileHeight:3},region:{col:0,row:14,sizeX:6,sizeY:4,mobileHide:!0,mobileOrder:5,mobileHeight:4}},gridSettings:{columns:6,margin:[8,8],containerPadding:[8,8],viewFormat:"list",rowHeight:44,mobileRowHeight:42,mobileHeightMode:"auto",renderPrecision:"subpixel"}}},editor:{version:1,editorMetaById:{service:{locked:!0,label:"Service Health"},region:{label:"Region Performance"}}}},importSlot:{widgets:{importedA:{col:0,row:0,sizeX:6,sizeY:2},importedB:{col:4,row:0,sizeX:6,sizeY:2},importedLock:{col:10,row:0,sizeX:2,sizeY:2,static:!0}},gridSettings:{columns:12,minColumns:4,margin:[8,8],containerPadding:[8,8],rowHeight:44,heightMode:"auto",renderPrecision:"integer"}}},meta:{example:"dashboard-migration"}}),j=a=>a==="default"?null:a,ke=(a,r)=>{var b;const l=r.operation||{},d=l.affectedIds||[],p=l.patches||[];return{label:a,ok:r.ok,status:r.ok?l.status||"ok":((b=r.error)==null?void 0:b.code)||"error",affected:d.length?d.join(", "):"none",patches:p.length,diagnosticCount:(r.diagnostics||[]).filter(M).length}},He={setup(){const a=o(L()),r=o("default"),l=o("default"),d=o("desktop"),p=o(1e3),b=o(16),v=o("edit"),s=o(null),u=o([]),w=o([]),x=o(null),g=A?ce({pinia:A(),maxSize:100}):null;let S=null,y=null;const z=o({label:"No action run",ok:!0,status:"idle",affected:"none",patches:0,diagnosticCount:0}),I=o(!1),O={mobileBreakpointIds:["mobile"],mobileMaxWidth:520},N=m(()=>({scheduler:{mode:"auto",auto:{eagerMaxItems:30,rafMaxItems:120,workerMinItems:400}},diagnostics:{debug:!0,budgetMs:10}})),c=m(()=>{var e;return((e=s.value)==null?void 0:e.gridSettings)||{columns:24,rowHeight:48,heightMode:"auto",renderPrecision:"integer",viewFormat:"grid"}}),R=m(()=>{const e=w.value.concat(u.value),t=new Set;return e.filter(i=>{if(!M(i))return!1;const n=`${i.code}:${i.level}:${i.itemId||""}:${i.profileId||""}`;return t.has(n)?!1:(t.add(n),!0)}).slice(0,5)}),T=m(()=>{const e=R.value.filter(i=>i.level==="error").length,t=R.value.filter(i=>i.level==="warning").length;return e>0?{className:"error",label:`${e} issue${e===1?"":"s"}`}:t>0?{className:"warning",label:`${t} warning${t===1?"":"s"}`}:{className:"",label:"Ready"}}),U=m(()=>D[r.value]),G=m(()=>{var t,i,n,H,Y;const e=(t=s.value)==null?void 0:t.heightRuntime;return[{label:"Profile",value:((i=s.value)==null?void 0:i.resolvedProfileId)||"default"},{label:"Mode",value:v.value},{label:"Columns",value:c.value.columns},{label:"Format",value:((n=s.value)==null?void 0:n.viewFormat)||"grid"},{label:"Hidden",value:((Y=(H=s.value)==null?void 0:H.hiddenItemIds)==null?void 0:Y.length)||0},{label:"Row height",value:`${(e==null?void 0:e.rowHeight)||c.value.rowHeight}px`}]}),W=m(()=>[`${c.value.columns} columns`,`${c.value.rowHeight}px rows`,c.value.renderPrecision||"integer"]),f=()=>{const e=ge(a.value,{width:p.value,breakpoints:V,breakpoint:l.value,targetView:d.value,targetViewRule:O,mode:v.value,validation:"strict"});e.ok?(s.value=e.runtime,u.value=e.diagnostics||[]):u.value=e.diagnostics||[]},B=e=>{a.value=e},F=e=>{const t=D[e];r.value=e,l.value=t.breakpoint,d.value=t.targetView,h()},h=()=>{var i;const e=D[r.value];if(!e)return;if(r.value!=="default"){p.value=e.width;return}const t=(i=x.value)==null?void 0:i.clientWidth;p.value=Math.max(720,Math.floor(t||e.width))},J=e=>{b.value=e,X(`Apply ${e} columns`,{columns:e})},K=e=>{v.value=e},C=(e,t)=>{t.ok&&(a.value=t.document),w.value=t.diagnostics||[],z.value=ke(e,t),f()},k=(e,t)=>{var n;if(!e||!s.value)return;const i=be(a.value,s.value,e,{createMissingProfileOnEdit:!0,validation:"strict"});i.ok&&(a.value=i.document),w.value=i.diagnostics||[],z.value={label:t,ok:i.ok,status:i.ok?"changed":((n=i.error)==null?void 0:n.code)||"error",affected:"layout history",patches:0,diagnosticCount:(i.diagnostics||[]).filter(M).length},f()},Z=()=>{g&&k(g.undo(),"Undo layout")},_=()=>{g&&k(g.redo(),"Redo layout")},P=()=>({axis:"horizontal",sanitizeInvalidItems:!0,forceRepair:!0,repair:{strategy:"nearest-then-first",createDiagnostics:!0,objective:{minimizeMovement:1,minimizeResize:1,preserveOrder:1,preserveStatic:1}}}),X=(e,t)=>{const i=ve(a.value,{profileId:j(l.value),previousSettings:we(c.value),nextSettings:t,createMissingProfile:!0,validation:"strict",policy:P()});C(e,i)},q=()=>{const e=c.value.rowHeight>=48;X(e?"Apply compact density":"Apply comfortable density",{rowHeight:e?40:48,renderPrecision:e?"subpixel":"integer"})},Q=()=>{const e=$(a.value,{profileId:j(l.value),validation:"strict",policy:P().repair});C("Repair active profile",e)},ee=()=>{const e=$(a.value,{layoutId:"importSlot",validation:"strict",policy:P().repair});C("Repair import slot",e)},te=()=>{a.value=L(),r.value="default",l.value="default",d.value="desktop",b.value=16,v.value="edit",u.value=[],w.value=[],z.value={label:"No action run",ok:!0,status:"idle",affected:"none",patches:0,diagnosticCount:0},h(),f()},ae=e=>{var t;s.value=e.runtime,u.value=((t=e.runtime)==null?void 0:t.diagnostics)||u.value},ie=e=>{u.value=e.diagnostics||[]},oe=(e,t)=>{a.value=e,s.value=t},re=e=>{var i,n;const t=(n=(i=s.value)==null?void 0:i.layout)==null?void 0:n.find(H=>H.i===e);return t?`${t.x},${t.y} / ${t.w}x${t.h}`:"not rendered"};return ne(()=>[a.value,l.value,d.value,p.value,v.value],f,{deep:!0}),le(()=>{if(I.value=!0,h(),typeof ResizeObserver!="undefined"&&x.value){const e=new ResizeObserver(h);e.observe(x.value),y=()=>e.disconnect()}else typeof window!="undefined"&&(window.addEventListener("resize",h),y=()=>window.removeEventListener("resize",h));f(),g&&(S=pe(g,{onUndo:e=>k(e,"Undo layout"),onRedo:e=>k(e,"Redo layout")}))}),de(()=>{y&&y(),S&&S()}),{activePreset:U,applyDensity:q,breakpoints:V,canvasMeta:W,canvasHost:x,currentSettings:c,dashboardDocument:a,formatGeometry:re,gridWidth:p,handleDiagnosticsChange:ie,handleDocumentChange:oe,handleProjectionChange:ae,health:T,history:g,lastOperation:z,layoutEngine:N,mode:v,mounted:I,profilePresets:D,repairActive:Q,repairImportSlot:ee,reset:te,runtime:s,runtimeProperties:G,selectedProfile:r,setColumns:J,setDocument:B,setMode:K,setProfile:F,targetColumns:b,targetView:d,targetViewRule:O,undoHistory:Z,redoHistory:_,visibleDiagnostics:R,widgetCatalog:xe}},components:{DashboardResponsiveVueGridLayout:ue},template:`
    <div class="dashboard-migration-example">
      <header class="demo-header">
        <div class="demo-title">
          <h1>Dashboard Settings Migration</h1>
          <p>Apply grid-setting changes to a saved dashboard document and verify the responsive projection after repair.</p>
        </div>
        <div class="demo-state" :class="health.className">
          <span class="state-dot"></span>
          <span>{{ health.label }}</span>
        </div>
      </header>

      <div class="command-bar" aria-label="Dashboard migration commands">
        <div class="command-group">
          <span class="command-label">Profile</span>
          <button
            v-for="preset in profilePresets"
            :key="preset.breakpoint"
            class="command-button"
            :class="{ selected: selectedProfile === preset.breakpoint }"
            @click="setProfile(preset.breakpoint)"
          >
            {{ preset.label }}
          </button>
        </div>
        <div class="command-group">
          <span class="command-label">Mode</span>
          <button class="command-button" :class="{ selected: mode === 'edit' }" @click="setMode('edit')">Edit</button>
          <button class="command-button" :class="{ selected: mode === 'view' }" @click="setMode('view')">View</button>
        </div>
        <div class="command-group">
          <button class="command-button" :disabled="!history || !history.canUndo" @click="undoHistory">Undo</button>
          <button class="command-button" :disabled="!history || !history.canRedo" @click="redoHistory">Redo</button>
        </div>
        <div class="command-group">
          <span class="command-label">Columns</span>
          <button class="command-button" :class="{ selected: targetColumns === 24 }" @click="setColumns(24)">24</button>
          <button class="command-button" :class="{ selected: targetColumns === 16 }" @click="setColumns(16)">16</button>
          <button class="command-button" :class="{ selected: targetColumns === 12 }" @click="setColumns(12)">12</button>
        </div>
        <div class="command-group">
          <button class="command-button" @click="applyDensity">Toggle density</button>
          <button class="command-button" @click="repairActive">Repair active profile</button>
          <button class="command-button" @click="repairImportSlot">Repair import slot</button>
          <button class="command-button" @click="reset">Reset</button>
        </div>
      </div>

      <div class="work-area">
        <main class="canvas-panel" ref="canvasHost">
          <div class="panel-header">
            <div class="panel-heading">
              <h2>{{ activePreset.label }} projection</h2>
              <span>{{ gridWidth }}px width, {{ targetView }} target</span>
            </div>
            <div class="compact-meta">
              <span v-for="item in canvasMeta" :key="item" class="meta-item">{{ item }}</span>
            </div>
          </div>

          <DashboardResponsiveVueGridLayout
            class="dashboard-canvas"
            :document="dashboardDocument"
            :width="gridWidth"
            :breakpoints="breakpoints"
            :breakpoint="activePreset.breakpoint"
            :targetView="targetView"
            :targetViewRule="targetViewRule"
            :mode="mode"
            validation="strict"
            :autoSize="true"
            :isDraggable="mode === 'edit'"
            :isResizable="mode === 'edit'"
            :preventCollision="false"
            :verticalCompact="false"
            :compactType="null"
            :useCSSTransforms="mounted"
            :historyStore="history"
            :layoutEngine="layoutEngine"
            :createMissingProfileOnEdit="true"
            @update:document="setDocument"
            @projectionChange="handleProjectionChange"
            @diagnosticsChange="handleDiagnosticsChange"
            @documentChange="handleDocumentChange"
          >
            <div v-for="widget in widgetCatalog" :key="widget.id" class="widget-slot">
              <article class="widget-card" :class="{ warning: widget.warning, locked: widget.locked }">
                <div class="widget-top">
                  <span class="widget-title">{{ widget.title }}</span>
                  <span class="widget-type">{{ widget.type }}</span>
                </div>
                <div class="widget-body">
                  <strong class="widget-value">{{ widget.value }}</strong>
                  <span class="widget-detail">{{ widget.detail }}</span>
                </div>
                <span class="widget-foot">{{ formatGeometry(widget.id) }}</span>
              </article>
            </div>
          </DashboardResponsiveVueGridLayout>
        </main>

        <aside class="side-panel">
          <section class="side-section">
            <h3>Runtime state</h3>
            <div class="property-grid">
              <div v-for="property in runtimeProperties" :key="property.label" class="property">
                <span>{{ property.label }}</span>
                <strong>{{ property.value }}</strong>
              </div>
            </div>
          </section>

          <section class="side-section">
            <h3>Last action</h3>
            <div class="result-box">
              <span class="result-title">{{ lastOperation.label }}</span>
              <span class="result-detail">Status: {{ lastOperation.status }}; patches: {{ lastOperation.patches }}</span>
              <span class="result-detail">Affected: {{ lastOperation.affected }}</span>
              <span class="result-detail">Actionable diagnostics: {{ lastOperation.diagnosticCount }}</span>
            </div>
          </section>

          <section class="side-section">
            <h3>Actionable diagnostics</h3>
            <table v-if="visibleDiagnostics.length" class="diagnostic-table">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Code</th>
                  <th>Item</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(diagnostic, index) in visibleDiagnostics" :key="index + diagnostic.code">
                  <td :class="diagnostic.level">{{ diagnostic.level }}</td>
                  <td>{{ diagnostic.code }}</td>
                  <td>{{ diagnostic.itemId || diagnostic.profileId || "-" }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-copy">No user-actionable diagnostics.</p>
          </section>
        </aside>
      </div>
    </div>
  `};se(He).mount("#container");
