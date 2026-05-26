import{aU as O,bk as xe,bE as et,a0 as Lt,az as jt,aT as Vt,r as Xt,q as ie}from"./vue.esm-bundler-DbJ0TIm9.js";import{t as Yt,w as Nt,a as Kt,u as Gt,s as qt}from"./dashboard-migration-DTieP06g.js";import{d as Ut}from"./createGridLayoutComponent-De6d2Lgh.js";import{c as Jt,i as wt}from"./EditorGridLayout-gJeOxgVF.js";import"./persistence-CMJrtt_j.js";const oe=e=>typeof e=="number"&&Number.isFinite(e),It=(e,s)=>{if(typeof e=="number"&&Number.isFinite(e))return[e,e];if(Array.isArray(e)){const i=typeof e[0]=="number"&&Number.isFinite(e[0])?e[0]:s[0],l=typeof e[1]=="number"&&Number.isFinite(e[1])?e[1]:s[1];return[i,l]}return s},Tt=(e,s,i,l={})=>({code:e,level:s,message:i,...l}),kt=(e,s=[])=>({ok:!0,position:e,diagnostics:s}),tt=(e,s,i=[])=>({ok:!1,status:"blocked",reason:e,diagnostics:i.concat(Tt(`position-${e}`,"warning",s,{reason:e,recoverable:!0}))}),ot=(e,s,i,l)=>{if(!e||!oe(e.x)||!oe(e.y))return null;const p=Math.max(0,Math.min(Math.floor(e.x),Math.max(0,i-1))),h=Math.max(0,Number.isFinite(l)?Math.min(Math.floor(e.y),Math.max(0,l-1)):Math.floor(e.y));return{x:p,y:h,source:e.source||s,list:e.list,clientX:e.clientX,clientY:e.clientY,cols:i}},Qt=(e,s,i,l)=>({x:Math.max(0,Math.min(Math.floor(e.x+e.w),Math.max(0,i-1))),y:Math.max(0,Number.isFinite(l)?Math.min(Math.floor(e.y+e.h),Math.max(0,l-1)):Math.floor(e.y+e.h)),source:s,cols:i}),Zt=(e,s,i,l)=>{const p=e.filter(P=>s.indexOf(P.i)!==-1);if(p.length===0)return null;const h=Math.min(...p.map(P=>P.x)),y=Math.min(...p.map(P=>P.y)),x=Math.max(...p.map(P=>P.x+P.w)),H=Math.max(...p.map(P=>P.y+P.h));return{x:Math.max(0,Math.min(Math.floor((h+x)/2),Math.max(0,i-1))),y:Math.max(0,Number.isFinite(l)?Math.min(Math.floor((y+H)/2),Math.max(0,l-1)):Math.floor((y+H)/2)),source:"selection",cols:i}},_t=e=>{var p,h;if(!e)return null;const s=e;if(oe(s.clientX)&&oe(s.clientY))return{clientX:s.clientX,clientY:s.clientY};const i=e,l=((p=i.touches)==null?void 0:p[0])||((h=i.changedTouches)==null?void 0:h[0]);return l&&oe(l.clientX)&&oe(l.clientY)?{clientX:l.clientX,clientY:l.clientY}:null},Ot=e=>({left:oe(e.scrollLeft)?e.scrollLeft:0,top:oe(e.scrollTop)?e.scrollTop:0}),xt=(e,s)=>oe(s.width)&&s.width>0?s.width:oe(e.clientWidth)&&e.clientWidth>0?e.clientWidth:oe(e.offsetWidth)&&e.offsetWidth>0?e.offsetWidth:0,eo=e=>{const s=e!=null&&e.gridSettings?e.gridSettings.maxRows:void 0;return oe(s)&&s>0?Math.floor(s):1/0},to=e=>{var i;const s=(i=e==null?void 0:e.gridSettings)==null?void 0:i.columns;return oe(s)&&s>0?Math.floor(s):12},at=e=>{var l;const s=e==null?void 0:e.heightRuntime;if(s&&oe(s.rowHeight)&&s.rowHeight>0)return s.rowHeight;const i=(l=e==null?void 0:e.gridSettings)==null?void 0:l.rowHeight;return oe(i)&&i>0?i:150},oo=(e,s)=>{var p,h;const i=e.slice().sort((y,x)=>y.y-x.y||y.x-x.x||y.i.localeCompare(x.i)),l=Math.max(0,Math.min(Math.floor(s),i.length));return{listIndex:l,beforeId:(p=i[l])==null?void 0:p.i,afterId:l>0?(h=i[l-1])==null?void 0:h.i:void 0}},ao=(e,s)=>{var i,l;return{...e,x:0,y:Math.max(0,(l=(i=e.list)==null?void 0:i.listIndex)!=null?l:e.y),source:e.source==="event"?"list":e.source,list:e.list||oo(s,e.y)}},it=e=>{var ue,D,k,T,se,v;const s=e.runtime||null,i=e.layout||(s==null?void 0:s.layout)||[],l=to(s),p=eo(s),h=[],y=e.itemSize||{w:1,h:1},x=M=>((s==null?void 0:s.viewFormat)||"grid")==="list"?kt(ao(M,i),h):kt(M,h),H=_t(e.event);if(H){const M=e.gridElement||null;if(!M||typeof M.getBoundingClientRect!="function")return tt("missing-grid-element","Grid element is required to resolve event coordinates.",h);const V=M.getBoundingClientRect(),z=xt(M,V);if(!Number.isFinite(z)||z<=0)return tt("missing-grid-element","Grid element has no measurable width.",h);const q=Ot(M),B=H.clientX-V.left+q.left,X=H.clientY-V.top+q.top,ae={margin:It((ue=s==null?void 0:s.gridSettings)==null?void 0:ue.margin,[10,10]),containerPadding:It((D=s==null?void 0:s.gridSettings)==null?void 0:D.containerPadding,[0,0]),containerWidth:z,cols:l,rowHeight:at(s),maxRows:p,renderPrecision:(k=s==null?void 0:s.gridSettings)==null?void 0:k.renderPrecision},J=Ut(ae,X,B,y.w,y.h);return!oe(J.x)||!oe(J.y)||J.x<0||J.y<0?tt("invalid-input","Event coordinates produced an invalid grid position.",h):x({x:J.x,y:J.y,source:"event",clientX:H.clientX,clientY:H.clientY,left:B,top:X,cols:l,rowHeight:ae.rowHeight})}const P=e.activeItemId||((T=e.selection)==null?void 0:T.activeId),A=P?i.find(M=>M.i===P):null;if(A)return x(Qt(A,"active-item",l,p));if((v=(se=e.selection)==null?void 0:se.selectedIds)!=null&&v.length){const M=Zt(i,e.selection.selectedIds,l,p);if(M)return x(M)}const S=ot(e.lastMenuPosition,"last-menu",l,p);if(S)return x(S);const K=ot(e.lastPointerPosition,"last-pointer",l,p);if(K)return x(K);const G=e.gridElement||null;if(G&&typeof G.getBoundingClientRect=="function"){const M=G.getBoundingClientRect();if(xt(G,M)>0){const z=at(s),q=Number.isFinite(p)?p:Math.max(1,Math.ceil((G.clientHeight||z)/z));return x({x:Math.max(0,Math.floor(l/2)),y:Math.max(0,Math.floor(q/2)),source:"viewport-center",cols:l,rowHeight:z})}}const ce=ot(e.fallback||null,"fallback",l,p);return ce?x(ce):(h.push(Tt("position-fallback-origin","info","No pointer, selection, menu, pointer, viewport or caller fallback was available; using origin.",{details:{positionSource:"none"},recoverable:!0})),x({x:0,y:0,source:"none",cols:l,rowHeight:at(s)}))},so=e=>it(e);let Rt=0;const N=e=>(Rt+=1,`dashboard-shell-${e}-${Date.now().toString(36)}-${Rt.toString(36)}`),no=e=>({layoutId:(e==null?void 0:e.layoutId)||null,requestedBreakpoint:(e==null?void 0:e.requestedBreakpoint)||null,resolvedProfileId:(e==null?void 0:e.resolvedProfileId)||null,targetView:(e==null?void 0:e.targetView)||null,viewFormat:(e==null?void 0:e.viewFormat)||null}),Z=(e,s,i,l={})=>{const p={code:e,level:s,message:i};return Object.keys(l).sort().forEach(y=>{const x=l[y];typeof x!="undefined"&&(p[y]=x)}),p},rt=(e,s={})=>{const i=e instanceof Error?e.message:String(e||"Unknown error");return Z("shell-error","error",i,{reason:"validation",recoverable:!0,...s})},ee=e=>{var s,i,l;return{ok:e.ok,status:e.status,actionId:e.actionId,actionType:e.actionType,source:e.source,itemIds:e.itemIds||[],affectedIds:e.affectedIds||((s=e.commandResult)==null?void 0:s.affectedIds)||e.itemIds||[],position:e.position,commandResult:e.commandResult,writeResult:e.writeResult,adapter:e.adapter,placement:e.placement,proposedDocument:e.proposedDocument,idMap:e.idMap||((i=e.adapter)==null?void 0:i.idMap),patches:e.patches||((l=e.commandResult)==null?void 0:l.layoutPatches),diagnostics:Ce(e.diagnostics||[]),data:e.data}},te=(e,s,i)=>{e==null||e({type:"action-result",actionId:s.actionId,actionType:s.actionType,source:s.source,status:s.status,ok:s.ok,itemIds:s.itemIds,affectedIds:s.affectedIds,profile:i,position:s.position,commandResult:s.commandResult,adapter:s.adapter,placement:s.placement,diagnostics:s.diagnostics})},Ce=e=>e.filter(Boolean).map(s=>{const i={code:s.code,level:s.level,message:s.message};return Object.keys(s).filter(l=>l!=="code"&&l!=="level"&&l!=="message").sort().forEach(l=>{const p=s[l];typeof p!="undefined"&&(i[l]=ct(p))}),i}).sort((s,i)=>`${s.actionId||""}:${s.code}:${s.path||""}:${s.itemId||""}`.localeCompare(`${i.actionId||""}:${i.code}:${i.path||""}:${i.itemId||""}`)),ct=e=>{if(e==null||typeof e=="string"||typeof e=="number"||typeof e=="boolean")return e;if(Array.isArray(e))return e.map(ct);if(e instanceof Error)return{name:e.name,message:e.message};if(typeof e=="object"){const s={};return Object.keys(e).sort().forEach(i=>{i==="opaque"||i==="payload"||i==="businessPayload"||(s[i]=ct(e[i]))}),s}return String(e)},Ve=(e,s,i)=>({stage:e,ok:(s==null?void 0:s.ok)!==!1,status:s==null?void 0:s.status,reason:s==null?void 0:s.reason,preparedId:i==null?void 0:i.id,sourceIds:(s==null?void 0:s.sourceIds)||(i==null?void 0:i.sourceIds),newIds:(s==null?void 0:s.newIds)||(i==null?void 0:i.newIds),idMap:(s==null?void 0:s.idMap)||(i==null?void 0:i.idMap),metadata:(s==null?void 0:s.metadata)||(i==null?void 0:i.metadata),diagnostics:Ce((s==null?void 0:s.diagnostics)||(i==null?void 0:i.diagnostics)||[]),error:s!=null&&s.error?{code:s.error.code,message:s.error.message}:void 0}),io=e=>!!(e&&typeof e=="object"&&"ok"in e&&!("kind"in e)),ro=e=>!!(e&&typeof e=="object"&&"kind"in e),Be=async(e,s,i,l,p)=>{if(e.rollback)try{const h=await e.rollback(s,{...e.context,stage:i,error:l});return p.push(...(h==null?void 0:h.diagnostics)||[]),Ve("rollback",h,s)}catch(h){return p.push(rt(h,{actionId:e.actionId,actionType:e.actionType,source:e.source,reason:"adapter-rejected"})),{stage:"rollback",ok:!1,status:"error",reason:"adapter-rejected",preparedId:s.id,error:{message:h instanceof Error?h.message:String(h)}}}},st=async e=>{var h,y,x,H,P,A,S,K,G,ce,ue,D,k,T,se;const s=e.itemIds||e.context.itemIds||[],i=e.context.diagnostics.slice();(h=e.emit)==null||h.call(e,{type:"action-start",actionId:e.actionId,actionType:e.actionType,source:e.source,itemIds:s,profile:e.profile,position:e.position,diagnostics:i});let l=null,p;try{if(e.prepare){const B=await e.prepare(e.context);if(io(B)){if(i.push(...B.diagnostics||[]),p=Ve("prepare",B),!B.ok){const X=ee({ok:!1,status:B.status||"blocked",actionId:e.actionId,actionType:e.actionType,source:e.source,itemIds:s,affectedIds:[],position:e.position,adapter:p,idMap:B.idMap,diagnostics:i});return te(e.emit,X,e.profile),X}}else ro(B)&&(l=B,i.push(...l.diagnostics||[]),p=Ve("prepare",{ok:!0,diagnostics:l.diagnostics},l))}const v=await e.mutate(l,e.context);if(i.push(...v.diagnostics||[]),((y=v.commandResult)==null?void 0:y.status)==="blocked"||((x=v.commandResult)==null?void 0:x.status)==="cancelled"||((H=v.commandResult)==null?void 0:H.status)==="timeout"||((P=v.commandResult)==null?void 0:P.status)==="error"||((A=v.writeResult)==null?void 0:A.ok)===!1||v.status==="blocked"||v.status==="cancelled"||v.status==="timeout"||v.status==="unsupported"||v.status==="error"){const B=l?await Be(e,l,"mutate",v,i):void 0,X=((S=v.writeResult)==null?void 0:S.ok)===!1?"blocked":v.status||(((K=v.commandResult)==null?void 0:K.status)==="cancelled"?"cancelled":((G=v.commandResult)==null?void 0:G.status)==="timeout"?"timeout":((ce=v.commandResult)==null?void 0:ce.status)==="error"?"error":"blocked"),ae=ee({ok:!1,status:X,actionId:e.actionId,actionType:e.actionType,source:e.source,itemIds:s,affectedIds:v.affectedIds||((ue=v.commandResult)==null?void 0:ue.affectedIds)||[],position:e.position,commandResult:v.commandResult,writeResult:v.writeResult,proposedDocument:v.proposedDocument,adapter:B||p,placement:v.placement,idMap:l==null?void 0:l.idMap,patches:v.patches,diagnostics:i,data:v.data});return te(e.emit,ae,e.profile),ae}if(l&&e.commit){let B;try{B=await e.commit(l,{...e.context,commandResult:v.commandResult,writeResult:v.writeResult,proposedDocument:v.proposedDocument})}catch(X){i.push(rt(X,{actionId:e.actionId,actionType:e.actionType,source:e.source,reason:"adapter-rejected"})),p={stage:"commit",ok:!1,status:"error",reason:"adapter-rejected",preparedId:l.id,sourceIds:l.sourceIds,newIds:l.newIds,idMap:l.idMap,diagnostics:Ce(l.diagnostics||[]),error:{message:X instanceof Error?X.message:String(X)}};const ae=await Be(e,l,"commit",X,i),J=ee({ok:!1,status:"error",actionId:e.actionId,actionType:e.actionType,source:e.source,itemIds:s,affectedIds:v.affectedIds||((D=v.commandResult)==null?void 0:D.affectedIds)||[],position:e.position,commandResult:v.commandResult,writeResult:v.writeResult,proposedDocument:v.proposedDocument,adapter:ae||p,placement:v.placement,idMap:l.idMap,patches:v.patches,diagnostics:i,data:v.data});return te(e.emit,J,e.profile),J}if(i.push(...(B==null?void 0:B.diagnostics)||[]),p=Ve("commit",B,l),(B==null?void 0:B.ok)===!1){const X=await Be(e,l,"commit",B,i),ae=ee({ok:!1,status:B.status||"error",actionId:e.actionId,actionType:e.actionType,source:e.source,itemIds:s,affectedIds:v.affectedIds||((k=v.commandResult)==null?void 0:k.affectedIds)||[],position:e.position,commandResult:v.commandResult,writeResult:v.writeResult,proposedDocument:v.proposedDocument,adapter:X||p,placement:v.placement,idMap:l.idMap,patches:v.patches,diagnostics:i,data:v.data});return te(e.emit,ae,e.profile),ae}}const V=(T=v.commandResult)==null?void 0:T.status,z=v.status||(V==="changed"?"success":V==="noop"?"noop":V==="cancelled"?"cancelled":V==="timeout"?"timeout":V==="error"?"error":V==="blocked"?"blocked":"success"),q=ee({ok:z==="success"||z==="noop",status:z,actionId:e.actionId,actionType:e.actionType,source:e.source,itemIds:s,affectedIds:v.affectedIds||((se=v.commandResult)==null?void 0:se.affectedIds)||(l==null?void 0:l.newIds)||s,position:e.position,commandResult:v.commandResult,writeResult:v.writeResult,proposedDocument:v.proposedDocument,adapter:p,placement:v.placement,idMap:l==null?void 0:l.idMap,patches:v.patches,diagnostics:i,data:v.data});return te(e.emit,q,e.profile),q}catch(v){i.push(rt(v,{actionId:e.actionId,actionType:e.actionType,source:e.source}));const M=l?await Be(e,l,"mutate",v,i):void 0,V=ee({ok:!1,status:"error",actionId:e.actionId,actionType:e.actionType,source:e.source,itemIds:s,affectedIds:[],position:e.position,adapter:M||p,idMap:l==null?void 0:l.idMap,diagnostics:i});return te(e.emit,V,e.profile),V}},ut=e=>{var s;return!e.readonly&&(e.mode==="edit"||((s=e.editor)==null?void 0:s.mode.value)==="edit")},re=(e,s)=>e?void 0:s,ne=(e,s,i)=>{var l,p;return{label:((p=(l=i.options)==null?void 0:l.labelFactory)==null?void 0:p.call(l,e,i.context))||s,labelKey:`dashboardEditorShell.${e}`}},he=(e,s)=>{var i,l;return(l=(i=s.options)==null?void 0:i.shortcuts)==null?void 0:l[e]},Xe=(e,s,i)=>{if(!ut(e.context))return!1;const l=e.context.editor;if(!l)return!1;const p=l.canExecute({type:s,targetIds:i,source:"context-menu"});return p.status!=="blocked"&&p.status!=="error"},zt=(e,s,i)=>{var h,y;const l=i==="dashboard"?(h=e.options)==null?void 0:h.customDashboardItems:(y=e.options)==null?void 0:y.customWidgetItems,p=typeof l=="function"?l(e.context):l||[];return s.concat(p,e.customItems||[])},$t=(e,s)=>s?e:e.filter(i=>!i.hidden),de=e=>e,co=e=>{var G,ce,ue,D;const s=ut(e.context),i=Xe(e,"paste"),l=e.referenceAvailable===!0,p=e.paletteAvailable===!0,h=e.explicitPlacementTarget===!0,y=h?"here":"auto",x=h?"cursor":((G=e.options)==null?void 0:G.defaultPasteStrategy)||((ce=e.options)==null?void 0:ce.defaultAddStrategy),H=h?"cursor":(ue=e.options)==null?void 0:ue.defaultReferencePasteStrategy,P=h?"cursor":(D=e.options)==null?void 0:D.defaultAddStrategy,A=e.readonlyReason||"mode-readonly",S=e.target,K=[{id:"paste",type:"item",...ne("paste",h?"Paste here":"Paste",e),icon:"clipboard-paste",shortcut:he("paste",e),enabled:i,reason:re(i,s?"clipboard-unavailable":A),target:S,metadata:{strategy:x,placementIntent:y},action:de(()=>e.actions.pasteWidget(e.position||null,{source:"context-menu",strategy:x,placementIntent:y}))},{id:"place-clipboard",type:"item",...ne("place-clipboard","Place from clipboard",e),icon:"crosshair",enabled:i,reason:re(i,s?"clipboard-unavailable":A),target:S,metadata:{strategy:x,placementIntent:y,placementMode:"interactive"},action:de(()=>e.actions.placeClipboard(e.position||null,{source:"context-menu",strategy:x,placementIntent:y,placementMode:"interactive"}))},{id:"paste-reference",type:"item",...ne("paste-reference",h?"Paste reference here":"Paste reference",e),icon:"link",shortcut:he("paste-reference",e),enabled:s&&l,reason:re(s&&l,s?"adapter-unavailable":A),target:S,metadata:{strategy:H,placementIntent:y},action:de(()=>e.actions.pasteWidgetReference(e.position||null,{source:"context-menu",strategy:H,placementIntent:y}))},{id:"add-widget",type:"item",...ne("add-widget",h?"Add widget here":"Add widget",e),icon:"plus",enabled:s,reason:re(s,A),target:S,metadata:{strategy:P,placementIntent:y},action:de(()=>e.actions.addWidgetFromTemplate({w:2,h:2},e.position||null,{source:"context-menu",strategy:P,placementIntent:y}))},{id:"open-palette",type:"item",...ne("open-palette",h?"Open palette here":"Open palette",e),icon:"layout-grid",shortcut:he("open-palette",e),enabled:s&&p,reason:re(s&&p,s?"adapter-unavailable":A),target:S,metadata:{strategy:P,placementIntent:y},action:de(()=>e.actions.openWidgetPalette(e.position||null,{source:"context-menu",strategy:P,placementIntent:y}))},{id:"move-all-widgets",type:"item",...ne("move-all-widgets","Move all widgets",e),icon:"move",shortcut:he("move-all",e),enabled:s,reason:re(s,A),target:S,metadata:{dx:0,dy:1},action:de(()=>e.actions.moveAllWidgets(0,1,{source:"context-menu"}))},{id:"dashboard-settings",type:"item",...ne("dashboard-settings","Dashboard settings",e),icon:"settings",enabled:!0,target:S,metadata:{hook:!0}}];return{id:e.id,target:S,position:e.position,items:$t(zt(e,K,"dashboard"),e.includeHidden),diagnostics:e.diagnostics||[]}},lo=e=>{const s=ut(e.context),i=e.readonlyReason||"mode-readonly",l=[e.itemId],p=e.hiddenItem===!0,h=e.lockedItem===!0,y=!p&&!!e.context.editor,x=!p&&Xe(e,"copy",l),H=!p&&Xe(e,"duplicate",l),P=!p&&!h&&Xe(e,"delete",l),A=e.referenceAvailable===!0,S=e.target,K=[{id:"select",type:"item",...ne("select","Select",e),icon:"mouse-pointer-2",enabled:y,reason:re(y,p?"hidden":"missing-editor"),target:S,action:de(()=>e.actions.selectItem(e.itemId,{source:"context-menu"}))},{id:"edit-widget",type:"item",...ne("edit-widget","Edit",e),icon:"pencil",enabled:s&&!h&&!p,reason:re(s&&!h&&!p,p?"hidden":h?"locked":i),target:S,metadata:{hook:!0}},{id:"copy-widget",type:"item",...ne("copy-widget","Copy widget",e),icon:"copy",shortcut:he("copy-widget",e),enabled:x,reason:re(x,p?"hidden":i),target:S,action:de(()=>e.actions.copyWidget(e.itemId,{source:"context-menu"}))},{id:"copy-reference",type:"item",...ne("copy-reference","Copy reference",e),icon:"link",shortcut:he("copy-reference",e),enabled:!p&&A,reason:re(!p&&A,p?"hidden":"adapter-unavailable"),target:S,action:de(()=>e.actions.copyWidgetReference(e.itemId,{source:"context-menu"}))},{id:"duplicate",type:"item",...ne("duplicate","Duplicate",e),icon:"copy-plus",shortcut:he("duplicate-widget",e),enabled:H,reason:re(H,p?"hidden":i),target:S,action:de(()=>e.actions.duplicateWidget(e.itemId,{source:"context-menu"}))},{id:"remove",type:"item",...ne("remove","Remove",e),icon:"trash-2",shortcut:he("remove-widget",e),danger:!0,enabled:P,reason:re(P,p?"hidden":h?"locked":i),target:S,action:de(()=>e.actions.removeWidget(e.itemId,{source:"context-menu"}))},{id:"replace-reference",type:"item",...ne("replace-reference","Replace reference with copy",e),icon:"replace",enabled:s&&!p&&A,reason:re(s&&!p&&A,p?"hidden":s?"adapter-unavailable":i),target:S,action:de(()=>e.actions.replaceReferenceWithWidgetCopy(e.itemId,{source:"context-menu"}))},{id:"scroll-highlight",type:"item",...ne("scroll-highlight","Scroll and highlight",e),icon:"scan-search",enabled:!p,reason:re(!p,"hidden"),target:S,action:de(async()=>{const G=e.actions.highlightItem(e.itemId,{source:"context-menu"});return await e.actions.scrollToItem(e.itemId,{source:"context-menu"}),G})}];return{id:e.id,target:S,position:e.position,items:$t(zt(e,K,"widget"),e.includeHidden),diagnostics:e.diagnostics||[]}},Se=e=>e.map(s=>({...s})),le=e=>typeof e=="number"&&Number.isFinite(e),uo=e=>!!(e&&typeof e=="object"&&"value"in e),Le=e=>Array.isArray(e)?e.filter(Boolean):e?[e]:[],nt=e=>e==="context-menu"?"context-menu":e==="keyboard"?"keyboard":e==="toolbar"?"toolbar":e==="pointer"?"pointer":"api",Ae=(e,s)=>e.strategy||s,mo=e=>e==="first-fit"||e==="insert-top-shift",po=e=>e?typeof Event!="undefined"&&e instanceof Event?!0:typeof e=="object"&&("x"in e||"y"in e):!1,De=(e,s)=>s.placementIntent||(po(e)?"here":"auto"),Te=e=>({collisionPolicy:e.collisionPolicy,compactType:e.compactType,allowOverlap:e.allowOverlap,preventCollision:e.preventCollision}),go=e=>{var p,h;if(!e)return!1;const s=e;if(le(s.clientX)&&le(s.clientY))return!0;const i=e,l=((p=i.touches)==null?void 0:p[0])||((h=i.changedTouches)==null?void 0:h[0]);return!!(l&&le(l.clientX)&&le(l.clientY))},fo=(e,s,i,l,p)=>{const h=(e==null?void 0:e.newIds)||[];if(!h.length)return[];const y=new Set(s.map(A=>A.i)),x=new Set,H=[],P=[];return h.forEach(A=>{if(typeof A!="string"||A.trim().length===0){H.push(String(A));return}(x.has(A)||y.has(A))&&P.push(A),x.add(A)}),!H.length&&!P.length?[]:[Z("shell-adapter-invalid-new-ids","error","Adapter prepare returned invalid or duplicate new widget ids.",{actionId:i,actionType:l,source:p,reason:"adapter-rejected",itemIds:P.concat(H),details:{duplicateIds:P,invalidIds:H},recoverable:!0})]},ho=()=>({ready:!1,degraded:!0,runtime:null,layoutId:null,requestedBreakpoint:null,resolvedProfileId:null,targetView:null,viewFormat:null,gridSettings:null,heightRuntime:null,activeItemIds:[],renderItemIds:[],hiddenItemIds:[],mode:null,selection:null,dirty:!1,conflict:null,lastResult:null,toolbar:null,lastPointerPosition:null,lastMenuPosition:null,menu:null,highlightedId:null,emptyAdd:{enabled:!1,reason:"missing-runtime",target:{layoutId:null,requestedBreakpoint:null,resolvedProfileId:null,targetView:null,viewFormat:null},descriptors:[]},diagnostics:[]}),Pt=(e,s,i,l=[])=>Jt({id:e,type:s},"blocked",{targetIds:l,blocked:{reason:i,itemIds:l,message:`Command was blocked by dashboard editor shell: ${i}.`}}),Mt=(e,s)=>{var p,h;const i=(h=(p=s.diagnostics)==null?void 0:p.operationResult)==null?void 0:h.layout;if(i)return Se(i);let l=Se(e.layout);return s.layoutPatches.forEach(y=>{if(y.type==="add"){l.push({...y.item});return}if(y.type==="remove"){l=l.filter(x=>x.i!==y.id);return}if(y.type==="move"){l=l.map(x=>x.i===y.id?{...x,x:y.to.x,y:y.to.y}:x);return}y.type==="resize"&&(l=l.map(x=>x.i===y.id?{...x,x:y.to.x,y:y.to.y,w:y.to.w,h:y.to.h}:x))}),l},je=e=>typeof CSS!="undefined"&&typeof CSS.escape=="function"?CSS.escape(e):e.replace(/["\\]/g,"\\$&"),bo=e=>!!(e&&typeof e=="object"),yo=(e,s={})=>{var p;if(e.defaultPrevented)return!0;const i=e.target;if(!bo(i))return!1;const l=(p=i.tagName)==null?void 0:p.toUpperCase();return l==="INPUT"||l==="TEXTAREA"||l==="SELECT"||i.isContentEditable?!0:(s.ignoredTargets||[]).some(h=>typeof h=="string"?typeof i.matches=="function"&&i.matches(h):h(i))},vo=(e="auto")=>e==="mac"||e==="standard"?e:typeof navigator!="undefined"&&/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"mac":"standard",wo=[{key:"c",primary:!0,action:"copy-widget",source:"keyboard"},{key:"r",primary:!0,action:"copy-reference",source:"keyboard"},{key:"v",primary:!0,action:"paste-widget",source:"keyboard"},{key:"i",primary:!0,action:"paste-reference",source:"keyboard"},{key:"v",primary:!0,shift:!0,action:"paste-reference",source:"keyboard"},{key:"Enter",primary:!0,action:"place-clipboard",source:"keyboard"},{key:"Enter",ctrl:!0,action:"place-clipboard",source:"keyboard"},{key:"x",primary:!0,action:"cut-widget",source:"keyboard"},{key:"Delete",action:"remove-widget",source:"keyboard"},{key:"Backspace",action:"remove-widget",source:"keyboard"},{key:"z",primary:!0,action:"undo",source:"keyboard"},{key:"z",primary:!0,shift:!0,action:"redo",source:"keyboard"},{key:"y",primary:!0,action:"redo",source:"keyboard"},{key:"p",primary:!0,action:"open-palette",source:"keyboard"},{key:"F10",shift:!0,action:"prepare-dashboard-menu",source:"keyboard"},{key:"m",primary:!0,shift:!0,action:"move-all",source:"keyboard"}],Io=(e,s,i)=>{const l=i==="mac"?e.metaKey:e.ctrlKey,p=i==="mac"?e.ctrlKey:e.metaKey,h=s.primary===!0,y=typeof s.ctrl=="boolean"||typeof s.meta=="boolean";if(e.key.toLowerCase()!==s.key.toLowerCase())return!1;if(y){if((s.ctrl||!1)!==e.ctrlKey||(s.meta||!1)!==e.metaKey)return!1}else if(h!==l||h&&p||!h&&(e.ctrlKey||e.metaKey))return!1;return!((s.shift||!1)!==e.shiftKey||(s.alt||!1)!==e.altKey)},ko=(e,s,i,l)=>{const p=s.placementOptions||e.placementOptions,h=typeof p=="function"?p():p;return{...i,...h||{},source:l}};function xo(e={}){var C,_,pe,Pe;const s=O(xe(e.document)||null),i=O(ho()),l=[],p=[];let h=!1,y=null,x=Promise.resolve(),H=null;const P=new Map,A=new Map,S=e.controlled!==!1,K=t=>{const o=x.catch(()=>{}).then(t);return x=o.then(()=>{},()=>{}),o},G=()=>{H=null},ce=(t,o)=>{H={mode:"interactive",reason:"cut-widget",sourceActionId:t,itemIds:o.slice()}},ue=()=>{const t=H;return H=null,t},D=t=>{var o;(o=e.onEvent)==null||o.call(e,t)},k=()=>{var t;return((t=e.model)==null?void 0:t.state.value)||xe(e.runtime)||null},T=()=>{var t;return e.editor||((t=e.model)==null?void 0:t.editorController)||null},se=()=>xe(e.gridElement)||null,v=()=>xe(e.document)||s.value||null,M=()=>no(k()),V=(t,o)=>{const a=k(),n=[];return a||n.push(Z("shell-missing-runtime","warning","Dashboard responsive runtime is not available.",{actionId:t,actionType:o,reason:"missing-runtime",recoverable:!0})),T()||n.push(Z("shell-missing-editor","warning","Grid editor controller is not available.",{actionId:t,actionType:o,reason:"missing-editor",recoverable:!0})),((a==null?void 0:a.diagnostics)||[]).forEach(r=>{n.push(Z(r.code,r.level,r.message,{actionId:t,actionType:o,itemId:r.itemId,layoutId:r.layoutId,path:r.path,resolvedProfileId:r.profileId||(a==null?void 0:a.resolvedProfileId)||null,targetView:r.targetView||(a==null?void 0:a.targetView)||null,details:r.details}))}),n},z=(t,o)=>{var u,g;const a=(xe(e.mode)||(t==null?void 0:t.mode)||(o==null?void 0:o.mode.value))==="edit",n=((t==null?void 0:t.renderItemIds)||(t==null?void 0:t.activeItemIds)||[]).length===0,r=!!(t&&a&&n),c={layoutId:(t==null?void 0:t.layoutId)||null,requestedBreakpoint:(t==null?void 0:t.requestedBreakpoint)||null,resolvedProfileId:(t==null?void 0:t.resolvedProfileId)||null,targetView:(t==null?void 0:t.targetView)||null,viewFormat:(t==null?void 0:t.viewFormat)||null},m=r&&L?[{id:"open-palette",labelKey:"dashboardEditorShell.open-palette",icon:"layout-grid",enabled:!0,target:{type:"dashboard"},metadata:{strategy:(u=e.menu)==null?void 0:u.defaultAddStrategy},action:()=>{var f;return L.openWidgetPalette(null,{source:"api",strategy:(f=e.menu)==null?void 0:f.defaultAddStrategy})}},{id:"add-widget",labelKey:"dashboardEditorShell.add-widget",icon:"plus",enabled:!0,target:{type:"dashboard"},metadata:{strategy:(g=e.menu)==null?void 0:g.defaultAddStrategy},action:()=>{var f;return L.addWidgetFromTemplate({w:2,h:2},null,{source:"api",strategy:(f=e.menu)==null?void 0:f.defaultAddStrategy})}}]:[];return{enabled:r,reason:r?void 0:t?a?"not-empty":"mode-readonly":"missing-runtime",target:c,descriptors:m}},q=()=>{const t=k(),o=T(),a=V(),n=!t||!o||!se();i.value={...i.value,ready:!!(t&&o),degraded:n,runtime:t,layoutId:(t==null?void 0:t.layoutId)||null,requestedBreakpoint:(t==null?void 0:t.requestedBreakpoint)||null,resolvedProfileId:(t==null?void 0:t.resolvedProfileId)||null,targetView:(t==null?void 0:t.targetView)||null,viewFormat:(t==null?void 0:t.viewFormat)||null,gridSettings:(t==null?void 0:t.gridSettings)||null,heightRuntime:(t==null?void 0:t.heightRuntime)||null,activeItemIds:(t==null?void 0:t.activeItemIds.slice())||[],renderItemIds:(t==null?void 0:t.renderItemIds.slice())||[],hiddenItemIds:(t==null?void 0:t.hiddenItemIds.slice())||[],mode:xe(e.mode)||(t==null?void 0:t.mode)||(o==null?void 0:o.mode.value)||null,selection:(o==null?void 0:o.selection.value)||null,dirty:(o==null?void 0:o.dirty.value)||!1,conflict:(o==null?void 0:o.conflict.value)||null,lastResult:(o==null?void 0:o.lastResult.value)||null,toolbar:(o==null?void 0:o.getToolbarState())||null,emptyAdd:z(t,o),diagnostics:Ce(a)}},B=(t,o,a)=>{var r;const n={type:"documentChange",actionId:t,document:o,runtime:a,controlled:S,persist:!1};(r=e.onDocumentChange)==null||r.call(e,n),D({type:"documentChange",event:n})},X=t=>{S||(s.value=t,uo(e.document)&&(e.document.value=t))},ae=(t,o,a,n={})=>{const r=k(),c=v(),m=T(),u=[];if(!r||!c)return u.push(Z("shell-write-back-skipped","info","Dashboard document or runtime is unavailable; action result is returned without proposed document.",{actionId:t,reason:r?"profile-write-back":"missing-runtime",recoverable:!0})),{diagnostics:u};const g=Nt(c,r,o,{createMissingProfileOnEdit:e.createMissingProfileOnEdit,createMissingItems:!0,removeMissingItems:n.removeMissingItems,editorMetaById:m==null?void 0:m.editorMetaById.value,writeItemIds:a});return u.push(...g.diagnostics.map(f=>Z(f.code,f.level,f.message,{actionId:t,itemId:f.itemId,layoutId:f.layoutId||r.layoutId,path:f.path,resolvedProfileId:f.profileId||r.resolvedProfileId,targetView:f.targetView||r.targetView,details:f.details}))),g.ok?{writeResult:g,proposedDocument:g.document,diagnostics:u}:(u.push(Z("shell-profile-write-back-blocked","error",g.error.message,{actionId:t,reason:"profile-write-back",recoverable:!0,path:g.error.path})),{writeResult:g,proposedDocument:g.document,diagnostics:u})},J=(t,o,a,n,r,c={})=>({actionId:t,actionType:o,source:a,itemIds:n,runtime:k(),document:v(),position:r,diagnostics:V(t,o),...c}),Re=async t=>{for(const o of e.guards||[]){const a=await o(t);if(a===!1)return{ok:!1,status:"blocked",reason:"guard-blocked",diagnostics:[Z("shell-guard-blocked","warning","Shell action was blocked by a caller guard.",{actionId:t.actionId,actionType:t.actionType,source:t.source,reason:"guard-blocked",recoverable:!0})]};if(a&&typeof a=="object"&&"available"in a&&!a.available)return{ok:!1,status:"blocked",reason:a.reason||"guard-blocked",diagnostics:a.diagnostics};if(a&&typeof a=="object"&&"ok"in a&&!a.ok)return a}return null},F=(t,o,a,n=[],r=[],c=N(t))=>{const m=ee({ok:!1,status:a==="adapter-unavailable"?"unsupported":"blocked",actionId:c,actionType:t,source:o,itemIds:n,affectedIds:[],diagnostics:r.concat(Z(`shell-${a}`,a==="missing-runtime"||a==="missing-editor"?"warning":"error",`Dashboard editor shell action was blocked: ${a}.`,{actionId:c,actionType:t,source:o,reason:a,itemIds:n,...M()}))});return te(D,m,M()),m},be=(t,o,a,n)=>((t==null?void 0:t.diagnostics)||[]).map(r=>{const c=r.code.startsWith("grid-editor.placement.")?`shell-placement-${r.code.slice(22).replace(/\./g,"-")}`:r.code;return Z(c,r.level,r.message,{actionId:o,actionType:a,source:n,reason:r.reason,itemIds:r.itemIds,details:r.details,recoverable:r.level!=="error",...M()})}),Ee=(t,o,a,n)=>{var c,m;const r=(m=(c=t==null?void 0:t.diagnostics)==null?void 0:c.computed)==null?void 0:m.placement;if(r)return{...r,strategy:r.strategy,diagnostics:Ce(be(r,o,a,n))}},Ye=(t,o,a,n)=>{if(!t)return;const r={strategy:t.strategy,placementSource:t.strategy,collisionPolicy:t.collisionPolicy,insertedIds:t.ghostItems.map(c=>c.id),shiftedIds:t.affectedOutlines.filter(c=>c.kind==="shift").map(c=>c.id),before:t.affectedOutlines.map(c=>({id:c.id,...c.before})),after:t.affectedOutlines.map(c=>({id:c.id,...c.after})),diagnostics:t.diagnostics};return{...r,strategy:r.strategy,diagnostics:Ce(be(r,o,a,n))}},ze=(t,o,a,n,r=N(t))=>{const c=Ye(a,r,t,o),m=ee({ok:!0,status:"success",actionId:r,actionType:t,source:o,itemIds:a.items.map(u=>u.i),affectedIds:[],position:n,placement:c,diagnostics:(c==null?void 0:c.diagnostics)||[],data:ge({placementSessionId:a.id,phase:a.phase,source:a.source},c)});return te(D,m,M()),m},ge=(t,o)=>o?t&&typeof t=="object"&&!Array.isArray(t)?{...t,placement:o}:{value:t,placement:o}:t,Ne=t=>t?t.kind==="layout"?Se(t.layout):Se(t.layouts[t.breakpoint]||[]):null,$e=async(t,o={})=>K(async()=>{var R,$,W,U,j,E,Y;const a=N(t),n=o.source||"api",r=T();if(!r)return F(t,n,"missing-editor",[],[],a);const c=await r.execute({id:a,type:t,source:nt(n)}),m=Ne(t==="undo"?(R=c.undo)==null?void 0:R.before:($=c.undo)==null?void 0:$.after),u=c.status==="changed"&&m?ae(a,m,c.affectedIds,{removeMissingItems:!0}):{diagnostics:[]},g=c.status==="changed"?"success":c.status==="cancelled"?"cancelled":c.status==="timeout"?"timeout":c.status==="error"?"error":c.status==="blocked"?"blocked":"noop",f=g==="success"||g==="noop",I=u.diagnostics.concat(c.blocked?[Z(`shell-command-${c.blocked.reason}`,"warning",c.blocked.message||`Editor command was blocked: ${c.blocked.reason}.`,{actionId:a,actionType:t,source:n,reason:c.blocked.reason,itemIds:c.blocked.itemIds,recoverable:!0})]:[]);((W=u.writeResult)==null?void 0:W.ok)===!1&&m&&k()&&r.setExternalLayout(k().layout,"shell-history-write-back-rollback");const b=ee({ok:f&&((U=u.writeResult)==null?void 0:U.ok)!==!1,status:((j=u.writeResult)==null?void 0:j.ok)===!1?"blocked":g,actionId:a,actionType:t,source:n,itemIds:c.targetIds,affectedIds:c.affectedIds,commandResult:c,writeResult:u.writeResult,proposedDocument:u.proposedDocument,patches:c.layoutPatches,diagnostics:I,data:{historyEntry:(E=c.undo)==null?void 0:E.id}});return b.ok&&b.proposedDocument&&((Y=b.writeResult)==null?void 0:Y.ok)!==!1&&(X(b.proposedDocument),B(a,b.proposedDocument,k())),te(D,b,M()),b}),me=async(t,o,a={})=>K(async()=>{var I,b;const n=o.id||N(t),r=a.source||"api",c=a.itemIds||o.targetIds||[],m=J(n,t,r,c,a.position,a.contextExtra);let u=null,g=!1;const f=await st({actionId:n,actionType:t,source:r,itemIds:c,position:a.position,context:m,profile:M(),emit:D,prepare:async R=>{var W;const $=await Re(R);return $||((W=a.prepare)==null?void 0:W.call(a,R))||null},mutate:async R=>{var ft,ht,bt,yt,vt;const $=T(),W=k();if(!$)return{status:"blocked",commandResult:Pt(n,o.type,"missing-editor",c),diagnostics:[Z("shell-missing-editor","error","Grid editor controller is required for this action.",{actionId:n,actionType:t,source:r,reason:"missing-editor",recoverable:!0})]};u=W?Se(W.layout):null;const U=fo(R,(W==null?void 0:W.layout)||[],n,t,r);if(U.length>0)return{status:"blocked",commandResult:Pt(n,o.type,"invalid-input",c),affectedIds:[],diagnostics:U};const j=(ft=R==null?void 0:R.newIds)!=null&&ft[0]&&o.type==="add"?{...o,payload:{...o.payload||{},item:{...((ht=o.payload)==null?void 0:ht.item)||{},i:R.newIds[0]}}}:o,E=await $.execute({...j,id:n,source:nt(r)});g=E.status==="changed";const Y=Ee(E,n,t,r),Q=be((yt=(bt=E.diagnostics)==null?void 0:bt.computed)==null?void 0:yt.placement,n,t,r);if(E.status==="blocked"||E.status==="cancelled"||E.status==="timeout"||E.status==="error")return{status:E.status==="cancelled"?"cancelled":E.status==="timeout"?"timeout":E.status==="error"?"error":"blocked",commandResult:E,affectedIds:E.affectedIds,diagnostics:E.blocked?[Z(`shell-command-${E.blocked.reason}`,"warning",E.blocked.message||`Editor command was blocked: ${E.blocked.reason}.`,{actionId:n,actionType:t,source:r,reason:E.blocked.reason,itemIds:E.blocked.itemIds,recoverable:!0})].concat(Q):Q,placement:Y,data:ge(a.data,Y)};const Fe=E.layoutPatches.length>0||E.metadataPatches.length>0,ke=W?Mt(W,E):[],He=W&&Fe&&(E.status==="changed"||E.status==="noop")?ae(n,ke,E.affectedIds,{removeMissingItems:o.type==="delete"}):{diagnostics:[]};return((vt=He.writeResult)==null?void 0:vt.ok)===!1&&u&&$.setExternalLayout(u,"shell-write-back-rollback"),{status:E.status==="changed"?"success":"noop",commandResult:E,writeResult:He.writeResult,proposedDocument:He.proposedDocument,affectedIds:E.affectedIds,patches:E.layoutPatches,placement:Y,data:ge(a.data,Y),diagnostics:He.diagnostics.concat(Q)}},commit:a.commit,rollback:a.rollback});return!f.ok&&g&&u&&((I=T())==null||I.setExternalLayout(u,"shell-transaction-rollback")),f.ok&&f.proposedDocument&&((b=f.writeResult)==null?void 0:b.ok)!==!1&&(X(f.proposedDocument),B(n,f.proposedDocument,k())),f}),We=(t,o={})=>{var a,n,r;return t&&typeof Event!="undefined"&&t instanceof Event?fe(t,o):t&&typeof t=="object"&&("x"in t||"y"in t)?it({...o,runtime:k(),layout:(a=k())==null?void 0:a.layout,selection:null,gridElement:null,lastMenuPosition:null,lastPointerPosition:null,fallback:t}):it({...o,runtime:k(),layout:(n=k())==null?void 0:n.layout,selection:((r=T())==null?void 0:r.selection.value)||null,gridElement:se(),lastMenuPosition:i.value.lastMenuPosition,lastPointerPosition:i.value.lastPointerPosition,fallback:o.fallback||i.value.lastMenuPosition||i.value.lastPointerPosition||void 0})},ye=(t,o,a)=>{const n=Ae(o,a);if(!mo(n))return We(t,o);const r=o;return t?We(t,{...o,fallback:r.fallback||{x:0,y:0,source:"strategy"}}):We({x:0,y:0,source:"strategy"},o)},Ke=()=>{var t,o;return((t=e.menu)==null?void 0:t.defaultPasteStrategy)||((o=e.menu)==null?void 0:o.defaultAddStrategy)||"cursor"},fe=(t,o={})=>{var a,n,r;return so({...o,event:t,runtime:k(),layout:(a=k())==null?void 0:a.layout,selection:((n=T())==null?void 0:n.selection.value)||null,gridElement:se(),lastMenuPosition:i.value.lastMenuPosition,lastPointerPosition:i.value.lastPointerPosition,fallback:o.fallback||((r=e.position)==null?void 0:r.fallback)})},Ge=async(t,o={},a="paste")=>{var m,u;const n=k(),r=o.placementIntent||"here",c={strategy:o.strategy||"cursor",...Te(o),cursor:{x:t.x,y:t.y},cols:((m=n==null?void 0:n.gridSettings)==null?void 0:m.columns)||t.cols||12,maxRows:((u=n==null?void 0:n.gridSettings)==null?void 0:u.maxRows)||1/0,list:t.list,source:t.source,placementIntent:r,placementAnchor:r==="here"?"top-left":void 0};return me(a,{type:"paste",payload:c},{source:o.source||"api",position:t,contextExtra:{placementIntent:r}})},ve=t=>{var o;return(o=e.widgetAdapter)!=null&&o[t]?a=>{var n,r;return(r=(n=e.widgetAdapter)==null?void 0:n[t])==null?void 0:r.call(n,a)}:void 0},we=(C=e.widgetAdapter)!=null&&C.commit?(t,o)=>{var a,n;return(n=(a=e.widgetAdapter)==null?void 0:a.commit)==null?void 0:n.call(a,t,o)}:void 0,Ie=(_=e.widgetAdapter)!=null&&_.rollback?(t,o)=>{var a,n;return(n=(a=e.widgetAdapter)==null?void 0:a.rollback)==null?void 0:n.call(a,t,o)}:void 0,qe=t=>{var o;return(o=e.referenceAdapter)!=null&&o[t]?a=>{var n,r;return(r=(n=e.referenceAdapter)==null?void 0:n[t])==null?void 0:r.call(n,a)}:void 0},Ue=(pe=e.referenceAdapter)!=null&&pe.commit?(t,o)=>{var a,n;return(n=(a=e.referenceAdapter)==null?void 0:a.commit)==null?void 0:n.call(a,t,o)}:void 0,Je=(Pe=e.referenceAdapter)!=null&&Pe.rollback?(t,o)=>{var a,n;return(n=(a=e.referenceAdapter)==null?void 0:a.rollback)==null?void 0:n.call(a,t,o)}:void 0,Qe=t=>t===!0?null:t===!1?{ok:!1,status:"cancelled",reason:"confirm-cancelled"}:"available"in t?t.available?null:{ok:!1,status:"cancelled",reason:t.reason||"confirm-cancelled",diagnostics:t.diagnostics}:t.ok?null:t,Ze=(t,o)=>{P.set(t.id,{...o,itemIds:t.items.map(a=>a.i),baseLayout:Se(t.baseLayout)})},_e=t=>{var r,c;const o=(c=(r=t.diagnostics)==null?void 0:r.computed)==null?void 0:c.placement,a=o==null?void 0:o.sessionId;if(!a)return null;const n=P.get(a);return n&&o?{pending:n,placement:o}:null},pt=(t,o,a)=>{var I,b;const n=(o==null?void 0:o.actionType)||"place-clipboard",r=(o==null?void 0:o.actionId)||N(n),c=Ee(t,r,n,a),m=be((b=(I=t.diagnostics)==null?void 0:I.computed)==null?void 0:b.placement,r,n,a),u=t.status==="changed"?"success":t.status==="cancelled"?"cancelled":t.status==="timeout"?"timeout":t.status==="error"?"error":t.status==="blocked"?"blocked":"noop",g=t.blocked?[Z(`shell-command-${t.blocked.reason}`,"warning",t.blocked.message||`Editor command was blocked: ${t.blocked.reason}.`,{actionId:r,actionType:n,source:a,reason:t.blocked.reason,itemIds:t.blocked.itemIds,recoverable:!0})].concat(m):m,f=ee({ok:u==="success"||u==="noop",status:u,actionId:r,actionType:n,source:a,itemIds:t.targetIds,affectedIds:t.affectedIds,position:o==null?void 0:o.position,commandResult:t,patches:t.layoutPatches,placement:c,data:ge(o==null?void 0:o.data,c),diagnostics:g});return te(D,f,M()),f},Oe=async t=>{var m;const o=_e(t),a=o==null?void 0:o.placement.sessionId;if(!o||!a)return null;const n=A.get(t.id);if(n)return n;if(t.status==="blocked"&&((m=t.blocked)==null?void 0:m.reason)!=="stale-command")return null;const{pending:r}=o;P.delete(a);const c=K(async()=>{var $,W,U;const u=T(),g=k(),f=Ee(t,r.actionId,r.actionType,r.source),I=be((W=($=t.diagnostics)==null?void 0:$.computed)==null?void 0:W.placement,r.actionId,r.actionType,r.source),b=J(r.actionId,r.actionType,r.source,r.itemIds,r.position,r.contextExtra),R=await st({actionId:r.actionId,actionType:r.actionType,source:r.source,itemIds:r.itemIds,position:r.position,context:b,profile:M(),emit:D,prepare:r.prepare,mutate:()=>{var Q;if(t.status==="blocked"||t.status==="cancelled"||t.status==="timeout"||t.status==="error")return{status:t.status==="cancelled"?"cancelled":t.status==="timeout"?"timeout":t.status==="error"?"error":"blocked",commandResult:t,affectedIds:t.affectedIds,diagnostics:I,placement:f,data:ge(r.data,f)};const j=t.layoutPatches.length>0||t.metadataPatches.length>0,E=g?Mt(g,t):[],Y=g&&j&&(t.status==="changed"||t.status==="noop")?ae(r.actionId,E,t.affectedIds,{removeMissingItems:t.type==="delete"}):{diagnostics:[]};return((Q=Y.writeResult)==null?void 0:Q.ok)===!1&&u&&u.setExternalLayout(r.baseLayout,"shell-placement-write-back-rollback"),{status:t.status==="changed"?"success":"noop",commandResult:t,writeResult:Y.writeResult,proposedDocument:Y.proposedDocument,affectedIds:t.affectedIds,patches:t.layoutPatches,placement:f,data:ge(r.data,f),diagnostics:Y.diagnostics.concat(I)}},commit:r.commit,rollback:r.rollback});return!R.ok&&t.status==="changed"&&u&&u.setExternalLayout(r.baseLayout,"shell-placement-transaction-rollback"),R.ok&&R.proposedDocument&&((U=R.writeResult)==null?void 0:U.ok)!==!1&&(X(R.proposedDocument),B(r.actionId,R.proposedDocument,k())),R});return A.set(t.id,c),c.finally(()=>{A.get(t.id)===c&&A.delete(t.id)}),c},L={getEventGridPosition:(t,o={})=>fe(t,o),pasteAtEvent:async(t,o={})=>{const a=fe(t,o);return a.ok?(i.value={...i.value,lastPointerPosition:a.position},Ge(a.position,o,"paste")):F("paste",o.source||"api",a.reason,[],a.diagnostics)},pasteAtGridPosition:async(t,o={})=>{const a=We(t,o);return a.ok?Ge(a.position,o,"paste"):F("paste",o.source||"api",a.reason,[],a.diagnostics)},selectItem:async(t,o={})=>me("select",{type:"select",targetIds:[t],payload:{ids:[t]}},{source:o.source||"api",itemIds:[t]}),highlightItem:(t,o={})=>{const a=N("highlight"),n=k(),r=i.value.highlightedId;if(!(n!=null&&n.allItemIds.includes(t)))return F("highlight",o.source||"api","missing-item",[t],[],a);y&&clearTimeout(y),i.value={...i.value,highlightedId:t},D({type:"highlight-change",actionId:a,itemId:t,previous:r,profile:M()}),o.durationMs&&o.durationMs>0&&(y=setTimeout(()=>{L.resetHighlight()},o.durationMs));const c=ee({ok:!0,status:"success",actionId:a,actionType:"highlight",source:o.source||"api",itemIds:[t],affectedIds:[t],diagnostics:[]});return te(D,c,M()),o.scroll&&L.scrollToItem(t,o),c},resetHighlight:()=>{const t=N("reset-highlight"),o=i.value.highlightedId;y&&(clearTimeout(y),y=null),i.value={...i.value,highlightedId:null},D({type:"highlight-change",actionId:t,itemId:null,previous:o,profile:M()});const a=ee({ok:!0,status:o?"success":"noop",actionId:t,actionType:"reset-highlight",source:"api",itemIds:o?[o]:[],affectedIds:o?[o]:[],diagnostics:[]});return te(D,a,M()),a},scrollToItem:async(t,o={})=>{var I;const a=N("scroll-to-item"),n=k(),r=o.source||"api";if(!(n!=null&&n.allItemIds.includes(t)))return F("scroll-to-item",r,"missing-item",[t],[],a);if(n.hiddenItemIds.includes(t)||!n.renderItemIds.includes(t)){const b=F("scroll-to-item",r,"hidden",[t],[],a);return D({type:"action-result",actionId:a,actionType:"scroll-to-item",source:r,status:"blocked",ok:!1,itemIds:[t],affectedIds:[],profile:M(),diagnostics:b.diagnostics}),b}const c=se();if(!c||typeof c.querySelector!="function")return F("scroll-to-item",r,"missing-grid-element",[t],[],a);const m=typeof o.selector=="function"?o.selector(t):o.selector||`[data-grid-id="${je(t)}"],[data-grid-item-id="${je(t)}"],[data-i="${je(t)}"],[data-id="${je(t)}"]`,u=c.querySelector(m);if(!u)return F("scroll-to-item",r,"dom-unavailable",[t],[],a);const g=await((I=e.scrollAdapter)==null?void 0:I.call(e,{itemId:t,itemElement:u,gridElement:c,options:o,runtime:n}));if(g&&!g.available)return F("scroll-to-item",r,g.reason||"dom-unavailable",[t],g.diagnostics||[],a);typeof u.scrollIntoView=="function"&&u.scrollIntoView({behavior:o.behavior||"smooth",block:o.block||"nearest",inline:o.inline||"nearest"});const f=ee({ok:!0,status:"success",actionId:a,actionType:"scroll-to-item",source:r,itemIds:[t],affectedIds:[t],diagnostics:[]});return te(D,f,M()),f},prepareDashboardContextMenu:(t,o={})=>{var f,I;const a=fe(t||null,{source:o.source||"context-menu"}),n=a.ok?a.position:void 0,r=go(t||null)&&(n==null?void 0:n.source)==="event";n&&(i.value={...i.value,lastMenuPosition:n});const c=N("prepare-dashboard-menu"),m=k(),u=T(),g=co({id:c,target:{type:"dashboard",position:n},position:n,context:{target:{type:"dashboard",position:n},runtime:m,mode:i.value.mode,readonly:i.value.mode!=="edit",editor:u},actions:L,options:e.menu,customItems:o.customItems,includeHidden:o.includeHidden,explicitPlacementTarget:r,referenceAvailable:!!((f=e.referenceAdapter)!=null&&f.preparePasteReference),paletteAvailable:!!((I=e.palette)!=null&&I.open),diagnostics:(a.ok,a.diagnostics)});return i.value={...i.value,menu:g},D({type:"menu-change",actionId:c,menu:g,profile:M()}),g},prepareWidgetContextMenu:(t,o,a={})=>{var b;const n=fe(t||null,{source:a.source||"context-menu",activeItemId:o}),r=n.ok?n.position:void 0;r&&(i.value={...i.value,lastMenuPosition:r});const c=N("prepare-widget-menu"),m=k(),u=T(),g=u==null?void 0:u.editorMetaById.value[o],f={type:"widget",itemId:o,position:r},I=lo({id:c,target:f,itemId:o,hiddenItem:(m==null?void 0:m.hiddenItemIds.includes(o))||(g==null?void 0:g.visible)===!1,lockedItem:(g==null?void 0:g.locked)===!0||((b=m==null?void 0:m.layout.find(R=>R.i===o))==null?void 0:b.static)===!0,position:r,context:{target:f,runtime:m,mode:i.value.mode,readonly:i.value.mode!=="edit",editor:u},actions:L,options:e.menu,customItems:a.customItems,includeHidden:a.includeHidden,referenceAvailable:!!e.referenceAdapter,diagnostics:(n.ok,n.diagnostics)});return i.value={...i.value,menu:I},D({type:"menu-change",actionId:c,menu:I,profile:M()}),I},closeMenu:(t="close")=>{const o=N("close-menu");i.value={...i.value,menu:null,lastMenuPosition:null},D({type:"menu-change",actionId:o,menu:null,reason:t,profile:M()})},copyWidget:async(t,o={})=>{var I,b,R;const a=Le(t),n=a.length?a:((I=T())==null?void 0:I.selection.value.selectedIds)||[],r=N("copy-widget"),c=o.source||"api";G();const m=e.widgetAdapter,u=k(),g=J(r,"copy-widget",c,n),f=m!=null&&m.copyWidget?await m.copyWidget(g):m?void 0:{ok:!0,diagnostics:[Z("shell-widget-payload-unhandled","info","Widget adapter was not provided; copied layout/editor metadata only.",{actionId:r,actionType:"copy-widget",source:c,reason:"adapter-unavailable",recoverable:!0})]};return me("copy-widget",{type:"copy",targetIds:n,payload:{cols:(b=u==null?void 0:u.gridSettings)==null?void 0:b.columns,maxRows:(R=u==null?void 0:u.gridSettings)==null?void 0:R.maxRows,breakpoint:u==null?void 0:u.requestedBreakpoint,layoutId:u==null?void 0:u.layoutId,viewFormat:u==null?void 0:u.viewFormat}},{source:c,itemIds:n,data:f,contextExtra:{payload:f},prepare:async $=>{const W=await Re($);return W||((f==null?void 0:f.ok)===!1?f:null)}})},cutWidget:async(t,o={})=>{var f;const a=Le(t),n=a.length?a:((f=T())==null?void 0:f.selection.value.selectedIds)||[],r=N("cut-widget"),c=o.source||"api";if(G(),n.length===0)return F("cut-widget",c,"selection-count",[],[],r);const m=await L.copyWidget(n,{source:c});if(!m.ok)return m;const u=ve("prepareRemoveWidget"),g=await me("cut-widget",{id:r,type:"delete",targetIds:n},{source:c,itemIds:n,data:{clipboardActionId:m.actionId},prepare:async I=>{if(!o.skipConfirm&&e.confirm){const b=await e.confirm(I),R=Qe(b);if(R)return R}return(u==null?void 0:u(I))||null},commit:we,rollback:Ie});return g.ok&&ce(r,n),g},placeClipboard:async(t,o={})=>{var I,b,R,$,W,U,j;const a=T(),n=o.source||"api",r=N("place-clipboard");if(G(),!a)return F("place-clipboard",n,"missing-editor");const c=De(t,o),m=c==="auto"?Ke():"cursor",u=Ae(o,m),g=ye(t||null,o,m);if(!g.ok)return F("place-clipboard",n,g.reason,[],g.diagnostics);const f=await a.beginPlacement({source:"paste",commandType:"paste",strategy:u,...Te(o),placementIntent:c,placementAnchor:c==="here"?"top-left":void 0,cursor:g.position.source!=="none"?{x:g.position.x,y:g.position.y,source:g.position.source==="event"?"menu":"api",clientX:g.position.clientX,clientY:g.position.clientY}:void 0,cols:((b=(I=k())==null?void 0:I.gridSettings)==null?void 0:b.columns)||g.position.cols||12,maxRows:le(($=(R=k())==null?void 0:R.gridSettings)==null?void 0:$.maxRows)?((W=k())==null?void 0:W.gridSettings).maxRows:1/0,origin:"dashboard-editor-shell"});return f.session?(Ze(f.session,{actionId:r,actionType:"place-clipboard",source:n,position:g.position,prepare:ve("preparePasteWidget"),commit:we,rollback:Ie,contextExtra:{placementIntent:c}}),ze("place-clipboard",n,f.session,g.position,r)):F("place-clipboard",n,((U=f.blocked)==null?void 0:U.reason)||"clipboard-unavailable",((j=f.blocked)==null?void 0:j.itemIds)||[],[],r)},commitPlacement:async(t={})=>{var g,f;const o=T(),a=t.source||"api";if(!o)return F("place-clipboard",a,"missing-editor");const n=(g=o.placementSession.value)==null?void 0:g.id,r=n&&P.get(n)||null,c=await o.commitPlacement({source:nt(a),autoCancelOnBlocked:t.autoCancelOnBlocked}),m=await Oe(c);if(m)return m;const u=((f=_e(c))==null?void 0:f.pending)||r;return pt(c,u||null,a)},pasteWidget:async(t,o={})=>{var g,f,I,b,R;const a=ue();if(o.placementMode==="interactive")return L.placeClipboard(t,o);if((a==null?void 0:a.mode)==="interactive"&&!t)return L.placeClipboard(t,{...o,strategy:o.strategy||"cursor",placementIntent:o.placementIntent||"here",placementMode:"interactive"});const n=De(t,o),r=n==="auto"?Ke():"cursor",c=Ae(o,r),m=ye(t,o,r);if(!m.ok)return F("paste-widget",o.source||"api",m.reason,[],m.diagnostics);const u=ve("preparePasteWidget");return me("paste-widget",{type:"paste",payload:{strategy:c,...Te(o),cursor:{x:m.position.x,y:m.position.y},cols:((f=(g=k())==null?void 0:g.gridSettings)==null?void 0:f.columns)||m.position.cols||12,maxRows:le((b=(I=k())==null?void 0:I.gridSettings)==null?void 0:b.maxRows)?((R=k())==null?void 0:R.gridSettings).maxRows:1/0,list:m.position.list,source:m.position.source,placementIntent:n,placementAnchor:n==="here"?"top-left":void 0}},{source:o.source||"api",position:m.position,contextExtra:{placementIntent:n},prepare:u,commit:we,rollback:Ie})},duplicateWidget:async(t,o={})=>{var c,m,u;const a=Le(t),n=a.length?a:((c=T())==null?void 0:c.selection.value.selectedIds)||[],r=ve("prepareDuplicateWidget");return me("duplicate-widget",{type:"duplicate",targetIds:n,payload:{strategy:"nearest-fit",cols:((u=(m=k())==null?void 0:m.gridSettings)==null?void 0:u.columns)||12}},{source:o.source||"api",itemIds:n,prepare:r,commit:we,rollback:Ie})},removeWidget:async(t,o={})=>{var m;const a=Le(t),n=a.length?a:((m=T())==null?void 0:m.selection.value.selectedIds)||[],r=o.source||"api",c=ve("prepareRemoveWidget");return me("remove-widget",{type:"delete",targetIds:n},{source:r,itemIds:n,prepare:async u=>{if(!o.skipConfirm&&e.confirm){const g=await e.confirm(u),f=Qe(g);if(f)return f}return(c==null?void 0:c(u))||null},commit:we,rollback:Ie})},copyWidgetReference:async(t,o={})=>{const a=N("copy-reference"),n=o.source||"api",r=e.referenceAdapter;if(!(r!=null&&r.copyReference))return F("copy-reference",n,"adapter-unavailable",[t],[],a);const c=J(a,"copy-reference",n,[t]),m=r.canCopyReference?await r.canCopyReference(c):{available:!0};if(!m.available)return F("copy-reference",n,m.reason||"adapter-unavailable",[t],m.diagnostics||[],a);const u=await r.copyReference(c),g=ee({ok:u.ok,status:u.ok?"success":u.status||"blocked",actionId:a,actionType:"copy-reference",source:n,itemIds:[t],affectedIds:[t],adapter:{stage:"commit",ok:u.ok,status:u.status,reason:u.reason,sourceIds:u.sourceIds,newIds:u.newIds,idMap:u.idMap,metadata:u.metadata,diagnostics:u.diagnostics,error:u.error?{code:u.error.code,message:u.error.message}:void 0},diagnostics:u.diagnostics||[]});return te(D,g,M()),g},pasteWidgetReference:async(t,o={})=>{var c,m,u,g,f,I,b;if(!((c=e.referenceAdapter)!=null&&c.preparePasteReference))return F("paste-reference",o.source||"api","adapter-unavailable");const a=De(t,o),n=Ae(o,"cursor"),r=ye(t,o,"cursor");return r.ok?me("paste-reference",{type:"add",payload:{item:{i:`reference-${Date.now().toString(36)}`,x:r.position.x,y:r.position.y,w:((m=o.itemSize)==null?void 0:m.w)||2,h:((u=o.itemSize)==null?void 0:u.h)||2},strategy:n,cursor:{x:r.position.x,y:r.position.y},cols:((f=(g=k())==null?void 0:g.gridSettings)==null?void 0:f.columns)||12,maxRows:((b=(I=k())==null?void 0:I.gridSettings)==null?void 0:b.maxRows)||1/0,list:r.position.list,placementIntent:a,placementAnchor:a==="here"?"top-left":void 0}},{source:o.source||"api",position:r.position,contextExtra:{placementIntent:a},prepare:async R=>{var W,U;const $=await((W=qe("preparePasteReference"))==null?void 0:W(R));return $&&"kind"in $&&((U=$.newIds)!=null&&U[0])&&(R.payload={itemId:$.newIds[0]}),$},commit:Ue,rollback:Je}):F("paste-reference",o.source||"api",r.reason,[],r.diagnostics)},replaceReferenceWithWidgetCopy:async(t,o={})=>{var c;if(!((c=e.referenceAdapter)!=null&&c.prepareReplaceReferenceWithWidgetCopy))return F("replace-reference",o.source||"api","adapter-unavailable",[t]);const a=o.source||"api",n=N("replace-reference"),r=J(n,"replace-reference",a,[t]);return st({actionId:n,actionType:"replace-reference",source:a,itemIds:[t],context:r,profile:M(),emit:D,prepare:qe("prepareReplaceReferenceWithWidgetCopy"),mutate:m=>{var u,g;return{status:"success",affectedIds:(u=m==null?void 0:m.newIds)!=null&&u.length?m.newIds:[t],data:{sourceItemId:t,newItemId:(g=m==null?void 0:m.newIds)==null?void 0:g[0]}}},commit:Ue,rollback:Je})},openWidgetPalette:async(t,o={})=>{var b;const a=N("open-palette"),n=o.source||"api";if(!((b=e.palette)!=null&&b.open))return F("open-palette",n,"adapter-unavailable",[],[],a);const r=De(t,o),c=ye(t,o,"cursor"),m=J(a,"open-palette",n,[],c.ok?c.position:void 0,{placementIntent:r}),u=await Re(m);if(u)return F("open-palette",n,u.reason||"guard-blocked",[],u.diagnostics||[],a);const g=await e.palette.open(m);if(g&&typeof g=="object"&&"ok"in g&&!g.ok)return F("open-palette",n,g.reason||"adapter-rejected",[],g.diagnostics||[],a);const f=Array.isArray(g)?g:g&&typeof g=="object"&&!("ok"in g)?[g]:[];if(f.length&&o.autoAddReturnedTemplate!==!1)return L.addWidgetFromTemplate(f[0],c.ok?c.position:null,{source:"palette",strategy:o.strategy,placementIntent:r,placementMode:o.placementMode});const I=ee({ok:!0,status:"success",actionId:a,actionType:"open-palette",source:n,itemIds:[],affectedIds:[],position:c.ok?c.position:void 0,data:g,diagnostics:(c.ok,c.diagnostics)});return te(D,I,M()),I},addWidgetFromTemplate:async(t,o,a={})=>{var u,g,f,I,b,R,$,W,U,j,E;const n=De(o,a),r=Ae(a,"cursor"),c=ye(o,{...a,itemSize:{w:t.w||2,h:t.h||2}},"cursor");if(!c.ok)return F("add-widget",a.source||"api",c.reason,[],c.diagnostics);if(a.placementMode==="interactive"){const Y=T(),Q=a.source||"api",Fe=N("add-widget");if(!Y)return F("add-widget",Q,"missing-editor");const ke=await Y.beginPlacement({source:"template",commandType:"add",items:[{...t,i:t.i||t.id,x:le(t.x)?t.x:c.position.x,y:le(t.y)?t.y:c.position.y,w:t.w||2,h:t.h||2}],editorMetaById:t.id||t.i?{[String(t.i||t.id)]:{label:t.label,data:t.metadata}}:void 0,strategy:r,...Te(a),placementIntent:n,placementAnchor:n==="here"?"top-left":void 0,cursor:{x:c.position.x,y:c.position.y,source:c.position.source==="event"?"menu":"api",clientX:c.position.clientX,clientY:c.position.clientY},cols:((g=(u=k())==null?void 0:u.gridSettings)==null?void 0:g.columns)||c.position.cols||12,maxRows:le((I=(f=k())==null?void 0:f.gridSettings)==null?void 0:I.maxRows)?((b=k())==null?void 0:b.gridSettings).maxRows:1/0,origin:"dashboard-editor-shell"});return ke.session?(Ze(ke.session,{actionId:Fe,actionType:"add-widget",source:Q,position:c.position,contextExtra:{placementIntent:n,template:t}}),ze("add-widget",Q,ke.session,c.position,Fe)):F("add-widget",Q,((R=ke.blocked)==null?void 0:R.reason)||"invalid-input",(($=ke.blocked)==null?void 0:$.itemIds)||[])}const m=ve("prepareAddWidget");return me("add-widget",{type:"add",payload:{item:{...t,i:t.i||t.id,x:le(t.x)?t.x:c.position.x,y:le(t.y)?t.y:c.position.y,w:t.w||2,h:t.h||2},strategy:r,...Te(a),cursor:{x:c.position.x,y:c.position.y},cols:((U=(W=k())==null?void 0:W.gridSettings)==null?void 0:U.columns)||12,maxRows:((E=(j=k())==null?void 0:j.gridSettings)==null?void 0:E.maxRows)||1/0,list:c.position.list,placementIntent:n,placementAnchor:n==="here"?"top-left":void 0}},{source:a.source||"api",position:c.position,contextExtra:{template:t,payload:t.payload,placementIntent:n},prepare:m,commit:we,rollback:Ie}).then(Y=>{const Q=Y.affectedIds[0];return Y.ok&&Q&&(L.selectItem(Q,{source:a.source||"api"}),L.highlightItem(Q,{source:a.source||"api",durationMs:1200})),Y})},handleExternalDrop:async(t,o,a={})=>{const n=fe(o,{source:"drop"});if(!n.ok)return F("external-drop","drop",n.reason,[],n.diagnostics);if(t.preview){const r=ee({ok:!0,status:"success",actionId:N("external-drop"),actionType:"external-drop",source:"drop",itemIds:[],affectedIds:[],position:n.position,data:{preview:!0,payload:t.metadata},diagnostics:n.diagnostics});return te(D,r,M()),r}return L.addWidgetFromTemplate(t.template||{w:2,h:2,payload:t.payload},n.position,{source:a.source||"drop",strategy:a.strategy})},moveAllWidgets:async(t,o,a={})=>{var f,I;const n=N("move-all"),r=a.source||"api",c=k(),m=v();if(!c)return F("move-all",r,"missing-runtime",[],[],n);if(!le(t)||!le(o))return F("move-all",r,"invalid-input",[],[],n);const u=J(n,"move-all",r,c.activeItemIds),g=await Re(u);if(g)return F("move-all",r,g.reason||"guard-blocked",c.activeItemIds,g.diagnostics||[],n);if(m){const b=Yt(m,{layoutId:c.layoutId,profileId:c.resolvedProfileId,dx:t,dy:o,clampNegative:a.clampNegative!==!1,policy:a.repair,createMissingProfile:e.createMissingProfileOnEdit}),R=b.diagnostics.map(W=>Z(W.code,W.level,W.message,{actionId:n,actionType:"move-all",source:r,itemId:W.itemId,layoutId:W.layoutId||c.layoutId,resolvedProfileId:W.profileId||c.resolvedProfileId,targetView:W.targetView||c.targetView,path:W.path,details:W.details}));b.ok&&(X(b.document),B(n,b.document,c));const $=ee({ok:b.ok,status:b.ok?b.operation.status==="noop"?"noop":"success":"blocked",actionId:n,actionType:"move-all",source:r,itemIds:c.activeItemIds,affectedIds:((f=b.operation)==null?void 0:f.affectedIds)||c.activeItemIds,writeResult:b.ok?{ok:!0,document:b.document,diagnostics:b.diagnostics}:{ok:!1,document:b.document,error:b.error,diagnostics:b.diagnostics},proposedDocument:b.document,patches:(I=b.operation)==null?void 0:I.patches,data:{requestedDelta:{dx:t,dy:o},operation:b.operation},diagnostics:R});return te(D,$,M()),$}return me("move-all",{type:"move",targetIds:c.activeItemIds,payload:{dx:t,dy:o,cols:c.gridSettings.columns}},{source:r,itemIds:c.activeItemIds})},undo:async(t={})=>$e("undo",t),redo:async(t={})=>$e("redo",t),bindKeyboard:t=>{const o=e.keyboard&&typeof e.keyboard=="object"?e.keyboard:{},a=t||o.target||(typeof window!="undefined"?window:null),n=typeof a=="string"&&typeof document!="undefined"?document.querySelector(a)||window:a;if(!n||typeof n.addEventListener!="function")return()=>{};const r=m=>{var U;const u=m;if(yo(u,o))return;const g=vo(o.platform),I=(o.shortcuts||wo).find(j=>Io(u,j,g));if(!I)return;u.preventDefault(),u.stopPropagation(),u.stopImmediatePropagation();const b=I.source||"keyboard",R=((U=T())==null?void 0:U.selection.value.selectedIds)||[],$=(j={})=>ko(o,I,j,b);(async()=>{var j,E;if(I.action==="copy-widget")return L.copyWidget(R,{source:b});if(I.action==="cut-widget")return L.cutWidget(R,{source:b});if(I.action==="copy-reference")return R[0]?L.copyWidgetReference(R[0],{source:b}):F("copy-reference",b,"selection-count");if(I.action==="paste-widget"||I.action==="paste")return L.pasteWidget(null,$());if(I.action==="place-clipboard")return L.placeClipboard(null,$({strategy:"cursor",placementIntent:"here",placementMode:"interactive"}));if(I.action==="paste-reference")return L.pasteWidgetReference(null,$({strategy:(j=e.menu)==null?void 0:j.defaultReferencePasteStrategy}));if(I.action==="remove-widget")return L.removeWidget(R,{source:b});if(I.action==="undo")return L.undo({source:b});if(I.action==="redo")return L.redo({source:b});if(I.action==="open-palette")return L.openWidgetPalette(null,$({strategy:(E=e.menu)==null?void 0:E.defaultAddStrategy}));if(I.action==="prepare-dashboard-menu")return L.prepareDashboardContextMenu(null,{source:b}),null;if(I.action==="move-all"){const Y=o.moveAllStep||{dx:0,dy:1};return L.moveAllWidgets(Y.dx,Y.dy,{source:b})}return null})().then(j=>{var E,Y,Q;j&&!j.ok&&((Q=e.onMessage)==null||Q.call(e,{code:((E=j.diagnostics[0])==null?void 0:E.code)||j.status,level:j.status==="error"?"error":"warning",message:((Y=j.diagnostics[0])==null?void 0:Y.message)||`Action ${j.actionType} was not applied.`,itemIds:j.itemIds,recoverable:j.status!=="error"}))})};n.addEventListener("keydown",r,!0);const c=()=>n.removeEventListener("keydown",r,!0);return p.push(c),c},stop:()=>w()},gt=t=>{if(!t||typeof t.addEventListener!="function")return()=>{};const o=a=>{const n=fe(a,{source:"pointer"});n.ok&&(i.value={...i.value,lastPointerPosition:n.position})};return t.addEventListener("pointermove",o),t.addEventListener("mousemove",o),t.addEventListener("contextmenu",o),()=>{t.removeEventListener("pointermove",o),t.removeEventListener("mousemove",o),t.removeEventListener("contextmenu",o)}};l.push(et(()=>{var t,o,a,n;return[k(),(t=T())==null?void 0:t.selection.value,(o=T())==null?void 0:o.dirty.value,(a=T())==null?void 0:a.conflict.value,(n=T())==null?void 0:n.lastResult.value,xe(e.mode),se()]},q,{deep:!0,immediate:!0})),l.push(et(()=>{var t;return(t=T())==null?void 0:t.lastResult.value},t=>{t&&Oe(t)}));let d=null;l.push(et(()=>se(),t=>{d==null||d(),d=gt(t)},{immediate:!0})),e.keyboard&&e.keyboard.enabled!==!1&&p.push(L.bindKeyboard());const w=()=>{if(h)return;h=!0,l.forEach(a=>a()),p.splice(0).forEach(a=>a()),d==null||d(),d=null,y&&(clearTimeout(y),y=null);const t=N("cleanup");i.value={...i.value,menu:null,highlightedId:null,lastMenuPosition:null};const o=[Z("shell-cleanup","info","Dashboard editor shell cleanup completed.",{actionId:t,actionType:"cleanup",source:"lifecycle"})];D({type:"cleanup",actionId:t,diagnostics:o})};return Lt()&&jt(w),q(),{state:Vt(i),actions:L,stop:w}}const Ft=document.createElement("style");Ft.textContent=`
  .dashboard-shell-demo {
    --surface: #ffffff;
    --surface-subtle: #faf9f8;
    --canvas: #f3f2f1;
    --border: #edebe9;
    --border-strong: #c8c6c4;
    --text: #323130;
    --muted: #605e5c;
    --subtle: #8a8886;
    --accent: #0078d4;
    --accent-hover: #106ebe;
    --accent-soft: #eff6fc;
    --success: #107c10;
    --warning: #8a6a00;
    --danger: #a4262c;
    background: #f3f2f1;
    color: var(--text);
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    margin: -20px;
    min-height: 100vh;
    padding: 16px;
  }

  .dashboard-shell-demo * {
    box-sizing: border-box;
  }

  .dashboard-shell-demo h1,
  .dashboard-shell-demo h2,
  .dashboard-shell-demo h3,
  .dashboard-shell-demo p {
    margin: 0;
  }

  .shell-header {
    align-items: flex-start;
    display: flex;
    gap: 16px;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .shell-title {
    display: grid;
    gap: 3px;
    max-width: 880px;
  }

  .shell-title h1 {
    color: #201f1e;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0;
  }

  .shell-title p {
    color: var(--muted);
    font-size: 13px;
  }

  .shell-status {
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    gap: 8px;
    min-height: 32px;
    padding: 5px 10px;
    white-space: nowrap;
  }

  .shell-status-dot {
    background: var(--success);
    border-radius: 50%;
    height: 8px;
    width: 8px;
  }

  .shell-status.warning .shell-status-dot {
    background: var(--warning);
  }

  .shell-status.error .shell-status-dot {
    background: var(--danger);
  }

  .shell-status span:last-child {
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
  }

  .shell-command-bar {
    align-items: stretch;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 12px;
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
    margin-right: 2px;
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
    padding: 5px 9px;
    white-space: nowrap;
  }

  .command-button:hover {
    background: #f3f2f1;
    border-color: var(--border-strong);
  }

  .command-button:focus-visible,
  .widget-menu-button:focus-visible,
  .menu-action:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .command-button:disabled {
    color: var(--subtle);
    cursor: default;
    opacity: 0.58;
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
    background: var(--accent-hover);
    border-color: var(--accent-hover);
  }

  .command-button.selected {
    background: var(--accent-soft);
    border-color: #c7e0f4;
    color: #004578;
    font-weight: 600;
  }

  .command-button.danger {
    color: var(--danger);
  }

  .shell-layout {
    align-items: start;
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(0, 1fr) 340px;
  }

  .canvas-panel,
  .inspector {
    background: var(--surface);
    border: 1px solid var(--border);
    min-width: 0;
  }

  .panel-header {
    align-items: flex-start;
    border-bottom: 1px solid var(--border);
    display: flex;
    gap: 12px;
    justify-content: space-between;
    padding: 12px 14px;
  }

  .panel-heading {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .panel-heading h2,
  .inspector-section h3 {
    color: #201f1e;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0;
  }

  .panel-heading span {
    color: var(--muted);
    font-size: 12px;
  }

  .meta-list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }

  .meta-item,
  .pill {
    background: var(--surface-subtle);
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 12px;
    padding: 3px 7px;
    white-space: nowrap;
  }

  .pill.strong {
    background: var(--accent-soft);
    border-color: #c7e0f4;
    color: #004578;
    font-weight: 600;
  }

  .canvas-host {
    background:
      linear-gradient(90deg, rgba(96, 94, 92, 0.08) 1px, transparent 1px),
      linear-gradient(0deg, rgba(96, 94, 92, 0.08) 1px, transparent 1px),
      var(--canvas);
    background-size: 72px 72px;
    min-height: 474px;
    overflow: auto;
    padding: 12px;
  }

  .grid-viewport {
    margin: 0 auto;
    transition: width 160ms ease;
  }

  .grid-viewport.mobile {
    max-width: 428px;
  }

  .shell-grid {
    background: transparent;
    margin-top: 0;
    min-height: 430px;
  }

  .shell-grid.vue-grid-layout {
    margin-top: 0;
  }

  .shell-grid .vue-grid-item:not(.vue-grid-placeholder) {
    background: transparent;
    border: 0;
  }

  .shell-grid .vue-grid-placeholder {
    background: rgba(0, 120, 212, 0.12);
    border: 1px dashed var(--accent);
  }

  .widget-slot {
    height: 100%;
    min-width: 0;
  }

  .shell-widget {
    background: var(--surface);
    border: 1px solid var(--border-strong);
    cursor: pointer;
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100%;
    min-width: 0;
    overflow: hidden;
    padding: 11px;
  }

  .shell-widget:hover {
    border-color: #8a8886;
  }

  .shell-widget.selected {
    border-color: var(--accent);
    box-shadow: inset 0 0 0 2px var(--accent);
  }

  .shell-widget.highlighted {
    animation: shellHighlight 1100ms ease;
  }

  .shell-widget.locked {
    background: #faf9f8;
  }

  @keyframes shellHighlight {
    0% {
      box-shadow: inset 0 0 0 2px var(--accent), 0 0 0 0 rgba(0, 120, 212, 0.24);
    }
    100% {
      box-shadow: inset 0 0 0 2px var(--accent), 0 0 0 12px rgba(0, 120, 212, 0);
    }
  }

  .widget-top {
    align-items: flex-start;
    display: flex;
    gap: 8px;
    justify-content: space-between;
    min-width: 0;
  }

  .widget-title {
    color: var(--text);
    display: block;
    font-size: 13px;
    font-weight: 600;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-kind {
    color: var(--muted);
    display: block;
    font-size: 12px;
    margin-top: 2px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-menu-button {
    appearance: none;
    background: var(--surface-subtle);
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--muted);
    cursor: pointer;
    flex: 0 0 auto;
    font: inherit;
    font-size: 14px;
    height: 28px;
    line-height: 1;
    padding: 0;
    width: 30px;
  }

  .widget-menu-button:hover {
    background: var(--accent-soft);
    border-color: #c7e0f4;
    color: var(--accent);
  }

  .widget-body {
    align-content: center;
    color: var(--muted);
    display: grid;
    font-size: 12px;
    gap: 5px;
    min-height: 0;
    min-width: 0;
  }

  .widget-contract {
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-detail {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-footer {
    align-items: center;
    color: var(--subtle);
    display: flex;
    font-size: 11px;
    gap: 8px;
    justify-content: space-between;
    min-width: 0;
  }

  .widget-footer span:first-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .inspector {
    display: grid;
  }

  .inspector-section {
    border-bottom: 1px solid var(--border);
    display: grid;
    gap: 10px;
    padding: 14px;
  }

  .inspector-section:last-child {
    border-bottom: 0;
  }

  .state-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .state-cell {
    border-bottom: 1px solid var(--border);
    min-width: 0;
    padding-bottom: 7px;
  }

  .state-cell span {
    color: var(--muted);
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .state-cell strong {
    color: var(--text);
    display: block;
    font-size: 13px;
    font-weight: 600;
    margin-top: 2px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .focus-list {
    display: grid;
    gap: 7px;
  }

  .focus-row {
    align-items: flex-start;
    display: grid;
    gap: 3px;
  }

  .focus-row strong {
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
  }

  .focus-row span {
    color: var(--muted);
    font-size: 12px;
  }

  .result-box {
    background: var(--surface-subtle);
    border: 1px solid var(--border);
    display: grid;
    gap: 5px;
    padding: 10px;
  }

  .result-box strong {
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
  }

  .result-box span {
    color: var(--muted);
    font-size: 12px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .menu-title {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  .menu-title strong {
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
  }

  .menu-title span {
    color: var(--muted);
    font-size: 12px;
  }

  .menu-actions {
    display: grid;
    gap: 4px;
  }

  .menu-action {
    appearance: none;
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--text);
    cursor: pointer;
    display: flex;
    font: inherit;
    font-size: 13px;
    justify-content: space-between;
    min-height: 32px;
    padding: 6px 8px;
    text-align: left;
  }

  .menu-action:hover {
    background: #f3f2f1;
    border-color: var(--border-strong);
  }

  .menu-action:disabled {
    color: var(--subtle);
    cursor: default;
    opacity: 0.62;
  }

  .menu-action.danger {
    color: var(--danger);
  }

  .shortcut {
    color: var(--subtle);
    font-size: 11px;
    margin-left: 10px;
  }

  .empty-note,
  .shell-message {
    color: var(--muted);
    font-size: 12px;
  }

  @media (max-width: 1080px) {
    .shell-header,
    .panel-header {
      display: grid;
    }

    .shell-status,
    .meta-list {
      justify-content: flex-start;
    }

    .shell-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .shell-command-bar {
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

    .state-grid {
      grid-template-columns: 1fr;
    }
  }
`;document.head.appendChild(Ft);const Ro=new Date("2026-05-19T00:00:00.000Z"),St={mobile:0,default:960},Me={desktop:{key:"desktop",label:"Desktop",width:840,breakpoint:"default",targetView:"desktop"},mobile:{key:"mobile",label:"Mobile",width:420,breakpoint:"mobile",targetView:"mobile"}},Ct={revenue:{id:"revenue",title:"Revenue summary",kind:"Business widget",contract:"Copy, paste, remove",detail:"Layout item plus business payload",badge:"editable"},pipeline:{id:"pipeline",title:"Pipeline table",kind:"Business widget",contract:"Context menu target",detail:"Selection drives command availability",badge:"editable"},health:{id:"health",title:"Health monitor",kind:"Locked widget",contract:"Remove disabled",detail:"Editor metadata blocks destructive actions",badge:"locked",locked:!0},incidents:{id:"incidents",title:"Incident queue",kind:"Business widget",contract:"Adapter transaction",detail:"Prepare, commit, rollback hooks stay outside layout math",badge:"editable"},region:{id:"region",title:"Region map",kind:"Reference widget",contract:"Copy reference",detail:"Reference actions use a separate adapter",badge:"reference",reference:!0}},mt=e=>JSON.parse(JSON.stringify(e)),Et=()=>Object.keys(Ct).reduce((e,s)=>(e[s]=mt(Ct[s]),e),{});let Ht=0,lt=0;const Po=()=>`dashboard-shell-demo-${++Ht}`,Wt=e=>(lt+=1,`${e}-${lt.toString(36)}`),At=()=>qt({widgets:{revenue:{col:0,row:0,sizeX:4,sizeY:3,minSizeX:3,mobileOrder:0,mobileHeight:3},pipeline:{col:4,row:0,sizeX:4,sizeY:3,minSizeX:3,mobileOrder:1,mobileHeight:3},health:{col:8,row:0,sizeX:4,sizeY:3,static:!0,draggable:!1,resizable:!1,mobileOrder:2,mobileHeight:3},incidents:{col:0,row:3,sizeX:5,sizeY:3,minSizeX:3,mobileOrder:3,mobileHeight:3},region:{col:5,row:3,sizeX:7,sizeY:3,minSizeX:4,mobileOrder:4,mobileHeight:3}},gridSettings:{columns:12,rowHeight:58,margin:[10,10],containerPadding:[10,10],viewFormat:"grid",heightMode:"auto",renderPrecision:"subpixel"},profiles:{mobile:{widgets:{revenue:{col:0,row:0,sizeX:4,sizeY:3,mobileOrder:0,mobileHeight:3},pipeline:{col:0,row:3,sizeX:4,sizeY:3,mobileOrder:1,mobileHeight:3},health:{col:0,row:6,sizeX:4,sizeY:3,mobileOrder:2,mobileHeight:3},incidents:{col:0,row:9,sizeX:4,sizeY:3,mobileOrder:3,mobileHeight:3},region:{col:0,row:12,sizeX:4,sizeY:3,mobileOrder:4,mobileHeight:3}},gridSettings:{viewFormat:"list",columns:4,rowHeight:48,mobileRowHeight:46,margin:[10,10],containerPadding:[10,10],renderPrecision:"subpixel"}}},editor:{version:1,editorMetaById:{health:{label:"Health monitor",locked:!0},region:{label:"Region map"}}},meta:{example:"dashboard-editor-shell"}},{key:"dashboard-shell-demo",sourceId:"dashboard-shell-demo",revision:Po,now:()=>Ro}),Bt=e=>String(e||"idle").split("-").map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(" "),dt=e=>({id:e,title:Bt(e.replace(/-copy(?:-\d+)?$/,"")),kind:"Business widget",contract:"created by shell",detail:"Generated through adapter transaction",badge:"editable"}),Mo=new Set(["settings-default","target-view-default","profile-fallback","list-height-source","list-height-default"]),Dt=e=>(e||[]).filter(s=>s.level!=="info"&&!Mo.has(s.code)),So=(e,s,i={})=>{const l=e?mt(e):dt(s);return{...l,...i,id:s,title:i.title||(e?`${e.title} copy`:l.title)}},Co=(e,s)=>{const i=e.find(l=>l.i===s);return i?`${i.x},${i.y} / ${i.w}x${i.h}`:"not rendered"},Eo={components:{DashboardGrid:Kt},setup(){const e=O(At()),s=O(null),i=O("edit"),l=O("desktop"),p=O(Me.desktop.breakpoint),h=O(Me.desktop.targetView),y=O(Me.desktop.width),x=O(null),H=O(""),P=O(Et()),A=O([]),S=O("Idle"),K=O("first-fit"),G=O("block"),ce=()=>({collisionPolicy:G.value,compactType:"vertical",allowOverlap:!1,preventCollision:!1}),ue=()=>({...ce(),strategy:"cursor",placementIntent:"here",placementMode:"interactive"}),D=O({actionType:"Ready",status:"success",source:"lifecycle",affected:"none",placement:"none",shifted:"none",diagnostics:0}),k=d=>P.value[d]||dt(d),T=(d,w,C={})=>{P.value={...P.value,[d]:So(w,d,C)}},se=d=>{if(!d.length)return;const w={...P.value};d.forEach(C=>{delete w[C]}),P.value=w},v=d=>{var w;return(((w=d.commandResult)==null?void 0:w.layoutPatches)||[]).filter(C=>{var _;return C.type==="add"&&((_=C.item)==null?void 0:_.i)}).map(C=>C.item.i)},M=d=>{var w;return(((w=d.commandResult)==null?void 0:w.layoutPatches)||[]).filter(C=>C.type==="remove"&&C.id).map(C=>C.id)},V=Gt({document:e,width:y,breakpoints:St,breakpoint:p,targetView:h,mode:i,validation:"strict",createMissingProfileOnEdit:!0,editor:{commandPolicy:"skip-blocked",clipboard:wt,layoutEngineOptions:{cols:12,maxRows:1/0,compactType:"vertical",allowOverlap:!1,preventCollision:!1}},onEvent:d=>{d.type==="documentChange"&&(e.value=d.document)}}),z=xo({document:e,model:V,gridElement:s,mode:i,controlled:!1,createMissingProfileOnEdit:!0,keyboard:{enabled:!0,target:window,placementOptions:ce},menu:{get defaultAddStrategy(){return K.value},get defaultReferencePasteStrategy(){return K.value},shortcuts:{"copy-widget":"Ctrl+C","paste-widget":"Ctrl+V","place-clipboard":"Ctrl+Enter","paste-reference":"Ctrl+Shift+V","open-palette":"Ctrl+P","move-all":"Ctrl+Shift+M","remove-widget":"Del"}},palette:{open:()=>({id:"insight-panel",w:4,h:3,payload:{title:"Insight panel",kind:"Palette widget",contract:"add from palette",detail:"Shell resolves insertion position, adapter creates payload",badge:"new"}})},widgetAdapter:{copyWidget:d=>(A.value=d.itemIds.map(w=>mt(k(w))),S.value="Widget adapter copied payload",{ok:!0,metadata:{copied:d.itemIds.length}}),preparePasteWidget:()=>(S.value="Widget adapter prepared paste",{id:`prepare-paste-${Date.now().toString(36)}`,kind:"widget",sourceIds:A.value.map(d=>d.id)}),prepareDuplicateWidget:d=>(S.value="Widget adapter prepared duplicate",{id:`prepare-duplicate-${Date.now().toString(36)}`,kind:"widget",sourceIds:d.itemIds}),prepareRemoveWidget:d=>(S.value="Widget adapter prepared remove",{id:`prepare-remove-${Date.now().toString(36)}`,kind:"widget",sourceIds:d.itemIds}),prepareAddWidget:d=>{var _,pe;const w=((_=d.template)==null?void 0:_.payload)||{},C=Wt(((pe=d.template)==null?void 0:pe.id)||"widget");return S.value="Widget adapter prepared add",T(C,null,{title:w.title||"New widget",kind:w.kind||"Palette widget",contract:w.contract||"add from palette",detail:w.detail||"Business payload prepared by adapter",badge:w.badge||"new"}),{id:`prepare-add-${C}`,kind:"widget",newIds:[C]}},commit:(d,w)=>{const C=v(w),_=M(w);return C.forEach((pe,Pe)=>{var a,n;if(P.value[pe])return;const t=((a=d.sourceIds)==null?void 0:a[Pe])||((n=d.sourceIds)==null?void 0:n[0])||w.itemIds[Pe]||w.itemIds[0],o=A.value[Pe]||A.value[0]||(t?k(t):null);T(pe,o,{title:o?`${o.title} copy`:dt(pe).title,contract:"copied through adapter",detail:o?`Business payload copied from ${o.title}`:"Created through shell mutation"})}),S.value="Widget adapter committed",{ok:!0,metadata:{addedIds:C,removedIds:_}}},rollback:d=>{se(d.newIds||[]),S.value="Widget adapter rolled back"}},referenceAdapter:{canCopyReference:()=>({available:!0}),copyReference:d=>(S.value=`Reference adapter copied ${d.itemIds[0]||"item"}`,{ok:!0,sourceIds:d.itemIds,metadata:{copiedReference:!0}}),canPasteReference:()=>({available:!0}),preparePasteReference:()=>{const d=Wt("shared-reference");return S.value="Reference adapter prepared paste",T(d,null,{title:"Shared reference",kind:"Reference widget",contract:"paste reference",detail:"Separate adapter owns the reference payload",badge:"reference",reference:!0}),{id:`prepare-reference-${d}`,kind:"reference",newIds:[d],opaque:{hiddenBusinessReferencePayload:!0}}},canReplaceReference:()=>({available:!0}),prepareReplaceReferenceWithWidgetCopy:d=>(S.value="Reference adapter prepared detach",{id:`replace-reference-${d.itemIds[0]}`,kind:"reference",sourceIds:d.itemIds,newIds:[`${d.itemIds[0]}-detached`],metadata:{detached:!0}}),commit:()=>(S.value="Reference adapter committed",{ok:!0}),rollback:d=>{se(d.newIds||[]),S.value="Reference adapter rolled back"}},confirm:()=>!0,onEvent:d=>{var w,C,_;d.type==="action-result"&&(D.value={actionType:Bt(d.actionType),status:d.status,source:d.source,affected:d.affectedIds.length?d.affectedIds.join(", "):"none",placement:((w=d.placement)==null?void 0:w.strategy)||"none",shifted:(_=(C=d.placement)==null?void 0:C.shiftedIds)!=null&&_.length?d.placement.shiftedIds.join(", "):"none",diagnostics:Dt(d.diagnostics).length}),d.type==="menu-change"&&(x.value=d.menu)},onDocumentChange:d=>{e.value=d.document},onMessage:d=>{H.value=d.message}}),q=ie(()=>z.state.value),B=ie(()=>Me[l.value]),X=ie(()=>{var d,w;return((d=V.editorController)==null?void 0:d.selection.value.selectedIds)||((w=q.value.selection)==null?void 0:w.selectedIds)||[]}),ae=ie(()=>V.state.value.layout||[]),J=ie(()=>{var w,C;const d=(C=(w=e.value)==null?void 0:w.layouts)==null?void 0:C.default;return Object.keys((d==null?void 0:d.widgets)||{})}),Re=ie(()=>J.value.map(d=>k(d))),F=ie(()=>(V.state.value.renderItemIds||[]).map(d=>k(d))),be=ie(()=>{var d;return[`${((d=V.state.value.gridSettings)==null?void 0:d.columns)||12} columns`,`${V.state.value.viewFormat||"grid"} view`,`${y.value}px`]}),Ee=ie(()=>{const d=Dt(q.value.diagnostics),w=d.filter(_=>_.level==="error").length,C=d.filter(_=>_.level==="warning").length;return w?{className:"error",label:`${w} issue${w===1?"":"s"}`}:C?{className:"warning",label:`${C} warning${C===1?"":"s"}`}:{className:"",label:q.value.ready?"Ready":"Starting"}}),Ye=ie(()=>[{label:"Profile",value:V.state.value.resolvedProfileId||"default"},{label:"Mode",value:i.value},{label:"Selection",value:X.value.length?X.value.join(", "):"none"},{label:"Position",value:q.value.lastMenuPosition?`${q.value.lastMenuPosition.x},${q.value.lastMenuPosition.y}`:"none"}]),ze=ie(()=>{var d;return(((d=x.value)==null?void 0:d.items)||[]).filter(w=>w.type!=="separator"&&!w.hidden)}),ge=ie(()=>A.value.length>0),Ne=ie(()=>{var d,w,C;return!!((C=(w=(d=q.value.toolbar)==null?void 0:d.commands)==null?void 0:w.undo)!=null&&C.enabled)}),$e=ie(()=>{var d,w,C;return!!((C=(w=(d=q.value.toolbar)==null?void 0:d.commands)==null?void 0:w.redo)!=null&&C.enabled)});return{activePreset:B,adapterStage:S,addStrategy:K,placementCollisionPolicy:G,addWidget:()=>{z.actions.openWidgetPalette(null,{source:"toolbar",strategy:K.value})},allWidgets:Re,breakpoint:p,breakpoints:St,canPaste:ge,canRedo:$e,canUndo:Ne,canvasMeta:be,copySelected:()=>{z.actions.copyWidget(X.value,{source:"toolbar"})},documentRef:e,formatGeometry:d=>Co(ae.value,d),gridRef:s,gridWidth:y,handleGridDocumentChange:d=>{e.value=d},health:Ee,lastAction:D,locateWidget:d=>{z.actions.highlightItem(d,{source:"toolbar",durationMs:1100}),z.actions.scrollToItem(d,{source:"toolbar",behavior:"smooth"})},menu:x,menuItems:ze,message:H,mode:i,model:V,moveAll:d=>{z.actions.moveAllWidgets(0,d,{source:"toolbar"})},openDashboardMenu:d=>{d.preventDefault(),x.value=z.actions.prepareDashboardContextMenu(d,{source:"context-menu"})},openWidgetMenu:(d,w)=>{d.preventDefault(),d.stopPropagation(),z.actions.selectItem(w,{source:"pointer"}),x.value=z.actions.prepareWidgetContextMenu(d,w,{source:"context-menu"})},pasteReference:()=>{z.actions.pasteWidgetReference(null,{source:"toolbar",strategy:K.value,itemSize:{w:4,h:3}})},placeClipboard:()=>{z.actions.placeClipboard(null,{...ue(),source:"toolbar"})},pasteWidget:()=>{z.actions.pasteWidget(null,{source:"toolbar",strategy:K.value})},redoHistory:()=>{z.actions.redo({source:"toolbar"})},removeSelected:()=>{z.actions.removeWidget(X.value,{source:"toolbar"})},resetDemo:()=>{var d,w;(w=(d=wt).clear)==null||w.call(d),Ht=0,lt=0,e.value=At(),P.value=Et(),A.value=[],S.value="Idle",H.value="",D.value={actionType:"Ready",status:"success",source:"lifecycle",affected:"none",placement:"none",shifted:"none",diagnostics:0},z.actions.closeMenu("reset")},runMenuAction:d=>{!d.enabled||!d.action||Promise.resolve(d.action()).then(w=>{var C;w&&!w.ok&&(H.value=((C=w.diagnostics[0])==null?void 0:C.message)||w.status)})},selectWidget:d=>{z.actions.selectItem(d,{source:"pointer"})},selectedIds:X,selectedViewport:l,setMode:d=>{i.value=d,z.actions.closeMenu("mode-change")},setViewport:d=>{const w=Me[d];l.value=d,p.value=w.breakpoint,h.value=w.targetView,y.value=w.width,z.actions.closeMenu("viewport-change")},shell:z,shellState:q,stateRows:Ye,targetView:h,undoHistory:()=>{z.actions.undo({source:"toolbar"})},viewportPresets:Me,visibleWidgets:F}},template:`
    <section class="dashboard-shell-demo">
      <header class="shell-header">
        <div class="shell-title">
          <h1>Dashboard Editor Shell</h1>
          <p>Enterprise integration example for command routing, context menus, adapter transactions, and responsive profile write-back.</p>
        </div>
        <div class="shell-status" :class="health.className">
          <span class="shell-status-dot"></span>
          <span>{{ health.label }}</span>
        </div>
      </header>

      <div class="shell-command-bar" aria-label="Dashboard editor shell commands">
        <div class="command-group">
          <span class="command-label">Mode</span>
          <button class="command-button" :class="{ selected: mode === 'edit' }" @click="setMode('edit')">Edit</button>
          <button class="command-button" :class="{ selected: mode === 'view' }" @click="setMode('view')">View</button>
        </div>
        <div class="command-group">
          <span class="command-label">Projection</span>
          <button
            v-for="preset in viewportPresets"
            :key="preset.key"
            class="command-button"
            :class="{ selected: selectedViewport === preset.key }"
            @click="setViewport(preset.key)"
          >
            {{ preset.label }}
          </button>
        </div>
        <div class="command-group">
          <span class="command-label">Placement</span>
          <button
            class="command-button"
            :class="{ selected: addStrategy === 'first-fit' }"
            @click="addStrategy = 'first-fit'"
          >
            First fit
          </button>
          <button
            class="command-button"
            :class="{ selected: addStrategy === 'insert-top-shift' }"
            @click="addStrategy = 'insert-top-shift'"
          >
            Top shift
          </button>
          <button
            class="command-button"
            :class="{ selected: placementCollisionPolicy === 'block' }"
            @click="placementCollisionPolicy = 'block'"
          >
            Block
          </button>
          <button
            class="command-button"
            :class="{ selected: placementCollisionPolicy === 'layout' }"
            @click="placementCollisionPolicy = 'layout'"
          >
            Layout push
          </button>
        </div>
        <div class="command-group">
          <button class="command-button" :disabled="!canUndo" @click="undoHistory">Undo</button>
          <button class="command-button" :disabled="!canRedo" @click="redoHistory">Redo</button>
          <button class="command-button" :disabled="!selectedIds.length" @click="copySelected">Copy</button>
          <button class="command-button" :disabled="!canPaste" @click="pasteWidget">Paste</button>
          <button class="command-button" :disabled="!canPaste" @click="placeClipboard">Place from clipboard</button>
          <button class="command-button primary" @click="addWidget">Add widget</button>
          <button class="command-button" @click="pasteReference">Paste reference</button>
        </div>
        <div class="command-group">
          <button class="command-button" @click="moveAll(-1)">Move all up</button>
          <button class="command-button" @click="moveAll(1)">Move all down</button>
          <button class="command-button danger" :disabled="!selectedIds.length" @click="removeSelected">Remove</button>
          <button class="command-button" @click="resetDemo">Reset</button>
        </div>
      </div>

      <div class="shell-layout">
        <main class="canvas-panel">
          <div class="panel-header">
            <div class="panel-heading">
              <h2>{{ activePreset.label }} projection</h2>
              <span>{{ visibleWidgets.length }} rendered widgets, {{ targetView }} target, {{ mode }} mode</span>
            </div>
            <div class="meta-list">
              <span v-for="item in canvasMeta" :key="item" class="meta-item">{{ item }}</span>
            </div>
          </div>

          <div ref="gridRef" class="canvas-host" @click="shell.actions.closeMenu('canvas-click')" @contextmenu="openDashboardMenu">
            <div class="grid-viewport" :class="{ mobile: selectedViewport === 'mobile' }" :style="{ width: gridWidth + 'px' }">
              <DashboardGrid
                class="shell-grid"
                :document="documentRef"
                :width="gridWidth"
                :breakpoints="breakpoints"
                :breakpoint="breakpoint"
                :targetView="targetView"
                :mode="mode"
                validation="strict"
                :editor="{ controller: model.editorController }"
                :createMissingProfileOnEdit="true"
                :autoSize="true"
                :isDraggable="mode === 'edit'"
                :isResizable="mode === 'edit'"
                :preventCollision="false"
                :verticalCompact="false"
                :compactType="'vertical'"
                :useCSSTransforms="true"
                :layoutEngine="{ scheduler: { mode: 'auto' }, diagnostics: { debug: true, budgetMs: 10 } }"
                @documentChange="handleGridDocumentChange"
              >
                <div
                  v-for="widget in allWidgets"
                  :key="widget.id"
                  class="widget-slot"
                  :data-grid-id="widget.id"
                >
                  <article
                    class="shell-widget"
                    :class="{ selected: selectedIds.includes(widget.id), highlighted: shellState.highlightedId === widget.id, locked: widget.locked }"
                    @click.stop="selectWidget(widget.id)"
                    @dblclick.stop="locateWidget(widget.id)"
                    @contextmenu.stop="openWidgetMenu($event, widget.id)"
                  >
                    <div class="widget-top">
                      <div>
                        <span class="widget-title">{{ widget.title }}</span>
                        <span class="widget-kind">{{ widget.kind }}</span>
                      </div>
                      <button class="widget-menu-button" aria-label="Open widget menu" @click.stop="openWidgetMenu($event, widget.id)">...</button>
                    </div>
                    <div class="widget-body">
                      <span class="widget-contract">{{ widget.contract }}</span>
                      <span class="widget-detail">{{ widget.detail }}</span>
                    </div>
                    <div class="widget-footer">
                      <span>{{ formatGeometry(widget.id) }}</span>
                      <span class="pill" :class="{ strong: widget.reference || widget.locked }">{{ widget.badge }}</span>
                    </div>
                  </article>
                </div>
              </DashboardGrid>
            </div>
          </div>
        </main>

        <aside class="inspector">
          <section class="inspector-section">
            <h3>Example focus</h3>
            <div class="focus-list">
              <div class="focus-row">
                <strong>{{ addStrategy }} / {{ placementCollisionPolicy }}</strong>
                <span>Toolbar and keyboard paste use the selected policy; context-menu actions place at the clicked grid point.</span>
              </div>
              <div class="focus-row">
                <strong>Adapters</strong>
                <span>Prepare, write-back, commit, and rollback stay visible in the result stream.</span>
              </div>
              <div class="focus-row">
                <strong>Write-back</strong>
                <span>Only the active responsive profile receives geometry changes.</span>
              </div>
            </div>
          </section>

          <section class="inspector-section">
            <h3>Shell state</h3>
            <div class="state-grid">
              <div v-for="row in stateRows" :key="row.label" class="state-cell">
                <span>{{ row.label }}</span>
                <strong>{{ row.value }}</strong>
              </div>
            </div>
          </section>

          <section class="inspector-section" v-if="menu">
            <div class="menu-title">
              <strong>{{ menu.target.type === 'widget' ? 'Widget menu' : 'Canvas menu' }}</strong>
              <span>{{ menu.position ? menu.position.x + ',' + menu.position.y : 'no position' }}</span>
            </div>
            <div class="menu-actions">
              <button
                v-for="item in menuItems"
                :key="item.id"
                class="menu-action"
                :class="{ danger: item.danger }"
                :disabled="item.enabled === false"
                @click="runMenuAction(item)"
              >
                <span>{{ item.label || item.labelKey || item.id }}</span>
                <span class="shortcut">{{ item.enabled === false ? item.reason : item.shortcut }}</span>
              </button>
              <button class="menu-action" @click="shell.actions.closeMenu('dock-close')">
                <span>Close menu</span>
                <span class="shortcut">Esc</span>
              </button>
            </div>
          </section>

          <section class="inspector-section" v-else>
            <h3>Context menu</h3>
            <p class="empty-note">Open a widget menu to inspect action availability.</p>
          </section>

          <section class="inspector-section">
            <h3>Last result</h3>
            <div class="result-box">
              <strong>{{ lastAction.actionType }}</strong>
              <span>Status: {{ lastAction.status }}; source: {{ lastAction.source }}</span>
              <span>Affected: {{ lastAction.affected }}</span>
              <span>Placement: {{ lastAction.placement }}</span>
              <span>Shifted: {{ lastAction.shifted }}</span>
              <span>Diagnostics: {{ lastAction.diagnostics }}</span>
              <span>Adapter: {{ adapterStage }}</span>
            </div>
            <p class="shell-message">{{ message }}</p>
          </section>
        </aside>
      </div>
    </section>
  `};Xt(Eo).mount("#container");
