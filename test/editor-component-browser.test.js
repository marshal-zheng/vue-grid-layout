'use strict';

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, '.tmp'), { recursive: true });

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/css/styles.css">
    <style>
      body { margin: 0; padding: 16px; font-family: sans-serif; }
      .test-host { width: 900px; margin-bottom: 24px; }
      .vue-grid-item { background: #f5f7fb; border: 1px solid #8aa0bd; box-sizing: border-box; }
      .vue-grid-item > div { height: 100%; display: grid; place-items: center; }
    </style>
  </head>
  <body>
    <div id="plain" class="test-host"></div>
    <div id="editor" class="test-host"></div>
    <div id="responsive" class="test-host"></div>
    <script src="/example/vue-3.2.36.js"></script>
    <script src="/build/web/vue-grid-layout.min.js"></script>
    <script>
      (function () {
        var Vue = window.Vue;
        var VGL = window.VueGridLayout;
        var SingleGrid = VGL.VueGridLayout || VGL.default || VGL;
        var ResponsiveGrid = VGL.ResponsiveVueGridLayout || VGL.Responsive;
        var createApp = Vue.createApp;
        var ref = Vue.ref;
        var computed = Vue.computed;

        var plainLayout = ref([
          { i: 'plain-a', x: 0, y: 0, w: 2, h: 2 }
        ]);
        createApp({
          components: { SingleGrid: SingleGrid },
          setup: function () { return { layout: plainLayout }; },
          template: '<SingleGrid v-model="layout" :width="900" :cols="12" :rowHeight="30"><div v-for="item in layout" :key="item.i">{{ item.i }}</div></SingleGrid>'
        }).mount('#plain');

        var layout = ref([
          { i: 'a', x: 0, y: 0, w: 2, h: 2 },
          { i: 'b', x: 2, y: 0, w: 2, h: 2 },
          { i: 'c', x: 4, y: 0, w: 2, h: 2 }
        ]);
	        var mode = ref('edit');
	        var editorMetaById = ref({});
	        var sectionRows = ref({
	          version: 1,
	          items: {
	            row1: { id: 'row1', kind: 'row', order: 1, bounds: { x: 0, y: 0, w: 12, h: 4 }, itemIds: ['a', 'b', 'c'] }
	          },
	          itemMembership: {
	            a: { rowId: 'row1' },
	            b: { rowId: 'row1' },
	            c: { rowId: 'row1' }
	          }
	        });
        var messages = [];
        var failNextSave = false;
        var memory = VGL.memoryPersistenceAdapter();
        var persistence = VGL.useGridLayoutPersistence({
          key: 'editor-browser',
          kind: 'layout',
          target: layout,
          adapter: {
            load: function (key) { return memory.load(key); },
            save: function (key, document) {
              if (failNextSave) {
                failNextSave = false;
                throw new Error('browser save failed');
              }
              return memory.save(key, document);
            },
            remove: function (key) { return memory.remove(key); },
            subscribe: function (key, callback) {
              return memory.subscribe ? memory.subscribe(key, callback) : function () {};
            }
          },
          autoSave: false,
          meta: function () {
	            return { editor: VGL.createGridEditorPersistenceEnvelope(editorMetaById.value, sectionRows.value) };
          }
        });
        var editor = VGL.createGridEditorController({
	          layout: layout,
	          mode: mode,
	          editorMetaById: editorMetaById,
	          sectionRows: sectionRows,
	          persistence: persistence,
          keyboard: {
            ariaMessage: function (message) { messages.push(message.message); }
          },
          onEvent: function (event) {
            if (event.type === 'command-blocked' && event.result.blocked) {
              messages.push(event.result.blocked.reason);
            }
          }
        });
        var editorProp = computed(function () {
          return {
            controller: editor,
            keyboard: { ariaMessage: function (message) { messages.push(message.message); } },
            guides: {
              enabled: true,
              snap: true,
              thresholdPx: 1,
              maxVisibleGuides: { drag: 3, drop: 3, resize: 2 },
              showGrid: 'interaction',
              showSpacingLabels: true
            }
          };
        });
        createApp({
          components: { SingleGrid: SingleGrid },
          setup: function () {
            return { layout: layout, mode: mode, editor: editor, editorProp: editorProp };
          },
          template: '<div><input id="ignored-input" value="text"><SingleGrid class="editor-grid" v-model="layout" :width="900" :cols="12" :rowHeight="30" :editor="editorProp" :isDroppable="true" :droppingItem="{ i: \\'drop-a\\', w: 1, h: 1 }"><div v-for="item in layout" :key="item.i">{{ item.i }}</div></SingleGrid></div>'
        }).mount('#editor');

        var responsiveLayouts = ref({
          lg: [{ i: 'r-a', x: 0, y: 0, w: 2, h: 2 }],
          sm: [{ i: 'r-a', x: 0, y: 0, w: 1, h: 2 }]
        });
        var responsiveMode = ref('edit');
        var responsiveEditor = VGL.createGridEditorController({
          kind: 'responsive',
          layouts: responsiveLayouts,
          breakpoint: ref('lg'),
          mode: responsiveMode,
          editorMetaById: ref({})
        });
        createApp({
          components: { ResponsiveGrid: ResponsiveGrid },
          setup: function () {
            return {
              layouts: responsiveLayouts,
              editorProp: { controller: responsiveEditor },
              width: ref(900)
            };
          },
          template: '<ResponsiveGrid class="responsive-editor-grid" v-model:layouts="layouts" :width="width" :editor="editorProp"><div v-for="item in layouts.lg" :key="item.i">{{ item.i }}</div></ResponsiveGrid>'
        }).mount('#responsive');

        window.__editorBrowserTest = {
          layout: function () { return layout.value.map(function (item) { return Object.assign({}, item); }); },
          mode: mode,
          editor: editor,
          messages: function () { return messages.slice(); },
          lockA: function () { return editor.execute({ type: 'lock', targetIds: ['a'] }); },
          clear: function () { return editor.execute({ type: 'clearSelection' }); },
          selectA: function () { return editor.execute({ type: 'select', payload: { ids: ['a'] } }); },
          selectB: function () { return editor.execute({ type: 'select', payload: { ids: ['b'] } }); },
          selectABC: function () { return editor.execute({ type: 'select', payload: { ids: ['a', 'b', 'c'] } }); },
          alignTop: function () { return editor.execute({ type: 'align', source: 'toolbar', payload: { mode: 'top', cols: 12 } }); },
	          distributeHorizontal: function () { return editor.execute({ type: 'distribute', source: 'toolbar', payload: { mode: 'horizontal', cols: 12 } }); },
	          tidy: function () { return editor.execute({ type: 'tidy', source: 'toolbar', payload: { axis: 'both', cols: 12 } }); },
	          collapseRow: function () { return editor.execute({ type: 'section-row-collapse', source: 'toolbar', payload: { id: 'row1' } }); },
	          expandRow: function () { return editor.execute({ type: 'section-row-expand', source: 'toolbar', payload: { id: 'row1' } }); },
	          toolbarState: function () { return editor.getToolbarState(); },
          duplicate: function () { return editor.execute({ type: 'duplicate', source: 'toolbar' }); },
          copy: function () { return editor.execute({ type: 'copy', source: 'toolbar' }); },
          paste: function () { return editor.execute({ type: 'paste', source: 'toolbar', payload: { strategy: 'first-fit', cols: 12 } }); },
          deleteSelected: function () { return editor.execute({ type: 'delete', source: 'toolbar' }); },
          deleteGenerated: function () {
            var generated = layout.value
              .filter(function (item) { return ['a', 'b', 'c'].indexOf(item.i) === -1; })
              .map(function (item) { return item.i; });
            return editor.execute({ type: 'delete', targetIds: generated, source: 'toolbar' });
          },
          save: function () { return editor.save(); },
          failSave: function () { failNextSave = true; return editor.save(); },
          discard: function () { return editor.discard(); },
          undo: function () { return editor.undo(); },
          redo: function () { return editor.redo(); },
          computeGuides: function (options) {
            var current = layout.value;
            editor.guides.value = VGL.computeGridEditorGuides(
              current,
              current[0],
              Object.assign({}, current[0], { x: 2, y: 0 }),
              editorMetaById.value,
              Object.assign({
                thresholdPx: 10,
                snap: true,
                interaction: 'drag',
                maxVisibleGuides: { drag: 3, drop: 3, resize: 2 },
                showGrid: 'interaction',
                showSpacingLabels: true
              }, options || {})
            );
            return this.guideState();
          },
          computeResizeGuides: function () {
            return this.computeGuides({ interaction: 'resize' });
          },
	          computeDebugGuides: function () {
	            return this.computeGuides({ interaction: 'drag', debug: 'layer' });
	          },
	          snapProbe: function () {
	            var candidate = { i: 'drop-probe', x: 0.2, y: 1.2, w: 1, h: 1 };
	            var intelligence = VGL.computeGridEditorIntelligence({
	              layout: layout.value,
	              activeItem: candidate,
	              candidateItem: candidate,
	              sectionRows: sectionRows.value,
	              cols: 12,
	              interaction: 'drop',
	              options: { snapThresholdCells: 0.5, snap: true }
	            });
	            var resolution = VGL.resolveGridEditorSnap(intelligence, candidate, {
	              layout: layout.value,
	              cols: 12,
	              allowOverlap: true,
	              snap: true
	            });
	            return {
	              status: resolution.status,
	              snapKind: resolution.snapKind,
	              x: resolution.geometry.x,
	              y: resolution.geometry.y
	            };
	          },
          guideState: function () {
            return {
              guideCount: editor.guides.value.guides.length,
              displayCount: editor.guides.value.displayGuides ? editor.guides.value.displayGuides.length : 0,
              debug: editor.guides.value.debug === true,
              debugCount: editor.guides.value.debugGuides ? editor.guides.value.debugGuides.length : 0,
              spacingLabelCount: editor.guides.value.spacingLabelGuideIds ? editor.guides.value.spacingLabelGuideIds.length : 0
            };
          },
          clearGuides: function () {
            editor.guides.value = { activeId: null, guides: [], displayGuides: [], snappedGuideIds: [] };
          },
          guideDomCounts: function () {
            return {
              smart: document.querySelectorAll('#editor .vue-grid-editor-guide').length,
              debug: document.querySelectorAll('#editor .vue-grid-editor-debug-guide').length,
              labels: document.querySelectorAll('#editor .vue-grid-editor-guide-label').length,
              snapped: document.querySelectorAll('#editor .vue-grid-editor-guide-snapped').length,
              chips: document.querySelectorAll('#editor .vue-grid-editor-spacing-chip').length,
              hud: document.querySelectorAll('#editor .vue-grid-editor-measurement-hud').length,
              grid: document.querySelector('#editor .vue-grid-layout').classList.contains('editor-guide-grid'),
              debugLayer: !!document.querySelector('#editor .vue-grid-editor-debug-layer')
            };
          },
          layerProbe: function () {
            var placeholder = document.querySelector('#editor .vue-grid-placeholder');
            var guide = document.querySelector('#editor .vue-grid-editor-guide');
            var hud = document.querySelector('#editor .vue-grid-editor-measurement-hud');
            return {
              placeholderZ: placeholder ? Number(getComputedStyle(placeholder).zIndex) : null,
              guideZ: guide ? Number(getComputedStyle(guide).zIndex) : null,
              hudZ: hud ? Number(getComputedStyle(hud).zIndex) : null
            };
          },
          dragExternalOver: function () {
            var grid = document.querySelector('#editor .vue-grid-layout');
            var rect = grid.getBoundingClientRect();
            grid.dispatchEvent(new DragEvent('dragenter', {
              bubbles: true,
              cancelable: true,
              clientX: rect.left + 40,
              clientY: rect.top + 40
            }));
            grid.dispatchEvent(new DragEvent('dragover', {
              bubbles: true,
              cancelable: true,
              clientX: rect.left + 40,
              clientY: rect.top + 40
            }));
          },
          setView: function () { mode.value = 'view'; },
          setEdit: function () { mode.value = 'edit'; },
          responsiveState: function () { return responsiveEditor.state.value; }
        };
      })();
    </script>
  </body>
</html>`;

const contentType = filePath => {
  if (filePath.endsWith('.js')) return 'application/javascript';
  if (filePath.endsWith('.css')) return 'text/css';
  if (filePath.endsWith('.html')) return 'text/html';
  return 'application/octet-stream';
};

const createServer = () => new Promise(resolve => {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, 'http://127.0.0.1');
    if (requestUrl.pathname === '/editor-test') {
      response.writeHead(200, { 'content-type': 'text/html' });
      response.end(html);
      return;
    }
    if (requestUrl.pathname === '/favicon.ico') {
      response.writeHead(204);
      response.end();
      return;
    }
    const filePath = path.resolve(root, requestUrl.pathname.slice(1));
    if (!filePath.startsWith(root) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      response.writeHead(404);
      response.end('not found');
      return;
    }
    response.writeHead(200, { 'content-type': contentType(filePath) });
    fs.createReadStream(filePath).pipe(response);
  });
  server.listen(0, '127.0.0.1', () => resolve(server));
});

const closeServer = server => new Promise(resolve => server.close(resolve));

async function main() {
  const server = await createServer();
  const port = server.address().port;
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await puppeteer.launch({
    headless: 'new',
    ...(fs.existsSync(chromePath) ? { executablePath: chromePath } : {}),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(5000);
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message || String(error)));
    page.on('console', message => {
      if (message.type() === 'error') pageErrors.push(message.text());
    });
    await page.goto(`http://127.0.0.1:${port}/editor-test`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__editorBrowserTest);
    assert.deepEqual(pageErrors, []);

    assert.equal(await page.$eval('#plain .vue-grid-layout', el => el.classList.contains('editor-enabled')), false);
    assert.equal(await page.$eval('#editor .vue-grid-layout', el => el.classList.contains('editor-mode-edit')), true);
    assert.deepEqual(await page.evaluate(() => window.__editorBrowserTest.guideDomCounts()), {
      smart: 0,
      debug: 0,
      labels: 0,
      snapped: 0,
      chips: 0,
      hud: 0,
      grid: false,
      debugLayer: false
    });

    await page.click('#editor .vue-grid-item');
    await page.waitForSelector('#editor .vue-grid-item.editor-selected');
    assert.deepEqual(await page.evaluate(() => Array.from(window.__editorBrowserTest.editor.selection.value.selectedIds)), ['a']);

    await page.evaluate(() => window.__editorBrowserTest.editor.execute({ type: 'select', payload: { ids: ['a', 'b'] } }));
    await page.waitForFunction(() => Array.from(window.__editorBrowserTest.editor.selection.value.selectedIds).length === 2);

    await page.evaluate(() => window.__editorBrowserTest.clear());
    await page.evaluate(() => window.__editorBrowserTest.selectA());
    await page.evaluate(() => window.__editorBrowserTest.duplicate());
    await page.waitForFunction(() => window.__editorBrowserTest.layout().length === 4);
    await page.evaluate(() => window.__editorBrowserTest.undo());
    await page.waitForFunction(() => window.__editorBrowserTest.layout().length === 3);
    await page.evaluate(() => window.__editorBrowserTest.redo());
    await page.waitForFunction(() => window.__editorBrowserTest.layout().length === 4);
    await page.evaluate(() => window.__editorBrowserTest.deleteGenerated());
    await page.waitForFunction(() => window.__editorBrowserTest.layout().length === 3);

    await page.evaluate(() => window.__editorBrowserTest.selectA());
    await page.evaluate(() => window.__editorBrowserTest.copy());
    await page.evaluate(() => window.__editorBrowserTest.paste());
    await page.waitForFunction(() => window.__editorBrowserTest.layout().length === 4);
    await page.evaluate(() => window.__editorBrowserTest.deleteGenerated());
    await page.waitForFunction(() => window.__editorBrowserTest.layout().length === 3);

    await page.evaluate(() => window.__editorBrowserTest.selectA());
    await page.keyboard.down('Alt');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.up('Alt');
    await page.waitForFunction(() => window.__editorBrowserTest.layout()[0].w === 3);
    await page.evaluate(() => window.__editorBrowserTest.undo());
    await page.waitForFunction(() => window.__editorBrowserTest.layout()[0].w === 2);
    await page.evaluate(() => window.__editorBrowserTest.redo());
    await page.waitForFunction(() => window.__editorBrowserTest.layout()[0].w === 3);
    await page.evaluate(() => window.__editorBrowserTest.undo());
    await page.waitForFunction(() => window.__editorBrowserTest.layout()[0].w === 2);

    await page.evaluate(() => window.__editorBrowserTest.save());
    await page.waitForFunction(() => window.__editorBrowserTest.editor.dirty.value === false);
    await page.evaluate(() => window.__editorBrowserTest.editor.execute({ type: 'move', targetIds: ['a'], payload: { dx: 1, dy: 0 } }));
    await page.waitForFunction(() => window.__editorBrowserTest.editor.dirty.value === true);
    assert.equal((await page.evaluate(() => window.__editorBrowserTest.failSave())).status, 'error');
    assert.equal(await page.evaluate(() => window.__editorBrowserTest.editor.dirty.value), true);
    await page.evaluate(() => window.__editorBrowserTest.discard());
    await page.waitForFunction(() => window.__editorBrowserTest.editor.dirty.value === false);

    const guideState = await page.evaluate(() => window.__editorBrowserTest.computeGuides());
    const guideCount = guideState.guideCount;
    assert.ok(guideCount > 0);
    await page.waitForSelector('#editor .vue-grid-editor-guide');
    assert.ok(guideState.displayCount <= 3);
    let guideDomCounts = await page.evaluate(() => window.__editorBrowserTest.guideDomCounts());
    assert.ok(guideDomCounts.smart <= 3);
    assert.ok(guideDomCounts.labels <= 1);
    assert.ok(guideDomCounts.snapped >= 1);
    assert.ok(guideDomCounts.hud >= 1);
    assert.equal(guideDomCounts.grid, true);

    const resizeGuideState = await page.evaluate(() => window.__editorBrowserTest.computeResizeGuides());
    assert.ok(resizeGuideState.displayCount <= 2);
    await page.waitForFunction(() => window.__editorBrowserTest.guideDomCounts().smart <= 2);

    const debugGuideState = await page.evaluate(() => window.__editorBrowserTest.computeDebugGuides());
    assert.equal(debugGuideState.debug, true);
    assert.equal(debugGuideState.debugCount, debugGuideState.guideCount);
    await page.waitForSelector('#editor .vue-grid-editor-debug-layer');
    guideDomCounts = await page.evaluate(() => window.__editorBrowserTest.guideDomCounts());
    assert.ok(guideDomCounts.smart <= 3);
    assert.ok(guideDomCounts.debug >= guideDomCounts.smart);
    assert.equal(guideDomCounts.debugLayer, true);
    await page.evaluate(() => window.__editorBrowserTest.clearGuides());
    await page.waitForFunction(() => window.__editorBrowserTest.guideDomCounts().smart === 0);

    await page.evaluate(() => window.__editorBrowserTest.dragExternalOver());
    await page.waitForSelector('#editor .vue-grid-item.editor-drop-target');
    const layerProbe = await page.evaluate(() => window.__editorBrowserTest.layerProbe());
    assert.ok(layerProbe.placeholderZ === null || layerProbe.placeholderZ < 4);
    assert.ok(layerProbe.hudZ === null || layerProbe.hudZ >= 8);

	    await page.evaluate(() => window.__editorBrowserTest.selectABC());
	    const toolbarState = await page.evaluate(() => window.__editorBrowserTest.toolbarState());
	    assert.equal(toolbarState.commands.align.enabled, true);
	    assert.equal(toolbarState.commands.distribute.enabled, true);
	    assert.equal(toolbarState.commands['section-row-collapse'].enabled, true);
	    assert.ok(['changed', 'noop'].includes((await page.evaluate(() => window.__editorBrowserTest.alignTop())).status));
	    assert.ok(['changed', 'noop'].includes((await page.evaluate(() => window.__editorBrowserTest.distributeHorizontal())).status));
	    assert.ok(['changed', 'noop'].includes((await page.evaluate(() => window.__editorBrowserTest.tidy())).status));
	    const snapProbe = await page.evaluate(() => window.__editorBrowserTest.snapProbe());
	    assert.equal(snapProbe.status, 'snapped');
	    assert.equal(snapProbe.snapKind, 'section-row');
	    assert.equal(snapProbe.x, 0);
	    const collapseRow = await page.evaluate(() => window.__editorBrowserTest.collapseRow());
	    assert.equal(collapseRow.status, 'changed');
	    const collapsedToolbar = await page.evaluate(() => window.__editorBrowserTest.toolbarState());
	    assert.equal(collapsedToolbar.commands['section-row-expand'].enabled, true);
	    const expandRow = await page.evaluate(() => window.__editorBrowserTest.expandRow());
	    assert.equal(expandRow.status, 'changed');

    await page.evaluate(() => window.__editorBrowserTest.selectB());
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => Array.from(window.__editorBrowserTest.editor.selection.value.selectedIds).length === 0);

    await page.evaluate(() => window.__editorBrowserTest.selectB());
    await page.keyboard.press('Delete');
    await page.waitForFunction(() => window.__editorBrowserTest.layout().length === 3);
    const primaryModifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.down(primaryModifier);
    await page.keyboard.press('z');
    await page.keyboard.up(primaryModifier);
    await page.waitForFunction(() =>
      window.__editorBrowserTest.layout().length === 4 &&
      window.__editorBrowserTest.layout().some(item => item.i === 'b')
    );
    await page.keyboard.down(primaryModifier);
    if (process.platform === 'darwin') await page.keyboard.down('Shift');
    await page.keyboard.press(process.platform === 'darwin' ? 'z' : 'y');
    if (process.platform === 'darwin') await page.keyboard.up('Shift');
    await page.keyboard.up(primaryModifier);
    await page.waitForFunction(() =>
      window.__editorBrowserTest.layout().length === 3 &&
      !window.__editorBrowserTest.layout().some(item => item.i === 'b')
    );

    await page.evaluate(() => window.__editorBrowserTest.selectA());
    await page.focus('#ignored-input');
    await page.keyboard.press('Backspace');
    assert.equal((await page.evaluate(() => window.__editorBrowserTest.layout())).length, 3);

    await page.evaluate(() => document.getElementById('ignored-input').blur());
    await page.mouse.click(5, 5);
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => window.__editorBrowserTest.layout()[0].x === 1);

    await page.evaluate(() => window.__editorBrowserTest.lockA());
    await page.waitForSelector('#editor .vue-grid-item.editor-locked');

    await page.evaluate(() => window.__editorBrowserTest.setView());
    await page.waitForSelector('#editor .vue-grid-layout.editor-mode-view');
    assert.equal(await page.$eval('#editor .vue-grid-item', el => el.classList.contains('vue-draggable')), false);

    assert.ok((await page.evaluate(() => window.__editorBrowserTest.responsiveState())).startsWith('editing'));
    await page.screenshot({ path: path.join(root, '.tmp', 'editor-browser-smoke.png'), fullPage: true });
  } finally {
    if (browser.isConnected()) await browser.close();
    await closeServer(server);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
