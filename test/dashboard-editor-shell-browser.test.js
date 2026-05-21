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
    <style>
      body { margin: 0; padding: 16px; font-family: sans-serif; }
      #shell-grid { position: relative; width: 720px; height: 360px; overflow: auto; border: 1px solid #7894b6; }
      .shell-item { position: absolute; width: 120px; height: 60px; border: 1px solid #355070; box-sizing: border-box; display: grid; place-items: center; background: #f5f7fb; }
      [data-grid-id="a"] { left: 0; top: 0; }
      [data-grid-id="b"] { left: 180px; top: 0; }
    </style>
  </head>
  <body>
    <div id="shell-grid">
      <div class="shell-item" data-grid-id="a">A</div>
      <div class="shell-item" data-grid-id="b">B</div>
    </div>
    <script src="/example/vue-3.2.36.js"></script>
    <script src="/build/web/vue-grid-layout.min.js"></script>
    <script>
      window.__shellLoadErrors = [];
      window.addEventListener('error', function (event) {
        window.__shellLoadErrors.push(event.message || String(event.error || event));
      });
      window.addEventListener('unhandledrejection', function (event) {
        var reason = event.reason;
        window.__shellLoadErrors.push(reason && (reason.stack || reason.message || String(reason)));
      });
      (function () {
        var Vue = window.Vue;
        var VGL = window.VueGridLayout;
        var ref = Vue.ref;
        var nextTick = Vue.nextTick;
        var fixedDate = new Date('2026-05-19T00:00:00.000Z');

        function createDocument(widgets) {
          return VGL.serializeDashboardLayoutDocument({
            widgets: widgets || {
              a: { col: 0, row: 0, sizeX: 2, sizeY: 2 },
              b: { col: 3, row: 0, sizeX: 2, sizeY: 2 }
            },
            gridSettings: { columns: 12, rowHeight: 30, margin: [10, 10], containerPadding: [0, 0], viewFormat: 'grid' }
          }, {
            key: 'shell-browser',
            revision: function () { return 'shell-browser-rev'; },
            now: function () { return fixedDate; }
          });
        }

        function createRuntime(document, mode) {
          var result = VGL.resolveDashboardResponsiveProfile(document, {
            width: 1200,
            breakpoints: { default: 0 },
            breakpoint: 'default',
            targetView: 'desktop',
            mode: mode || 'edit',
            validation: 'sanitize'
          });
          if (!result.ok) throw new Error(result.error.message);
          return result.runtime;
        }

        var documentRef = ref(createDocument());
        var runtimeRef = ref(createRuntime(documentRef.value, 'edit'));
        var layoutRef = ref(runtimeRef.value.layout.map(function (item) { return Object.assign({}, item); }));
        var modeRef = ref('edit');
        var editor = VGL.createGridEditorController({
          layout: layoutRef,
          mode: modeRef,
          layoutEngineOptions: {
            cols: 12,
            maxRows: Infinity,
            compactType: 'vertical',
            allowOverlap: false,
            preventCollision: false
          }
        });
        var events = [];
        var copiedReferences = [];
        var referencePasteSeq = 0;
        var shell = VGL.useDashboardEditorShell({
          document: documentRef,
          runtime: runtimeRef,
          editor: editor,
          gridElement: ref(document.getElementById('shell-grid')),
          mode: modeRef,
          controlled: false,
          createMissingProfileOnEdit: true,
          keyboard: { enabled: false },
          palette: {
            open: function () { return { id: 'palette-widget', w: 2, h: 2 }; }
          },
          referenceAdapter: {
            canCopyReference: function () { return { available: true }; },
            copyReference: function (ctx) {
              copiedReferences.push(ctx.itemIds[0]);
              return { ok: true, metadata: { referenceId: 'ref-' + ctx.itemIds[0] } };
            },
            canPasteReference: function () { return { available: true }; },
            preparePasteReference: function () {
              referencePasteSeq += 1;
              return { id: 'ref-paste', kind: 'reference', newIds: ['reference-widget-' + referencePasteSeq] };
            },
            commit: function () { return { ok: true }; }
          },
          confirm: function () { return true; },
          onEvent: function (event) { events.push(event.type); },
          onDocumentChange: function (event) {
            documentRef.value = event.document;
          }
        });

        var emptyDocumentRef = ref(createDocument({}));
        var emptyRuntimeRef = ref(createRuntime(emptyDocumentRef.value, 'edit'));
        var emptyEditor = VGL.createGridEditorController({
          layout: ref([]),
          mode: ref('edit')
        });
        var emptyShell = VGL.useDashboardEditorShell({
          document: emptyDocumentRef,
          runtime: emptyRuntimeRef,
          editor: emptyEditor,
          gridElement: ref(document.getElementById('shell-grid')),
          mode: ref('edit'),
          palette: {
            open: function () { return { id: 'empty-palette-widget', w: 2, h: 2 }; }
          },
          createMissingProfileOnEdit: true
        });

        var policyDocumentRef = ref(createDocument());
        var policyRuntimeRef = ref(createRuntime(policyDocumentRef.value, 'edit'));
        var policyLayoutRef = ref(policyRuntimeRef.value.layout.map(function (item) { return Object.assign({}, item); }));
        var policyEditor = VGL.createGridEditorController({
          layout: policyLayoutRef,
          mode: ref('edit'),
          layoutEngineOptions: {
            cols: 12,
            maxRows: 12,
            compactType: 'vertical',
            allowOverlap: false,
            preventCollision: false
          }
        });
        var policyShell = VGL.useDashboardEditorShell({
          document: policyDocumentRef,
          runtime: policyRuntimeRef,
          editor: policyEditor,
          gridElement: ref(document.getElementById('shell-grid')),
          mode: ref('edit'),
          controlled: false,
          createMissingProfileOnEdit: true,
          keyboard: {
            enabled: false,
            placementOptions: function () {
              return {
                collisionPolicy: 'layout',
                compactType: 'vertical',
                allowOverlap: false,
                preventCollision: false
              };
            }
          },
          menu: {
            defaultAddStrategy: 'first-fit',
            defaultReferencePasteStrategy: 'first-fit'
          }
        });

        var viewRuntimeRef = ref(createRuntime(documentRef.value, 'view'));
        var viewShell = VGL.useDashboardEditorShell({
          document: documentRef,
          runtime: viewRuntimeRef,
          editor: editor,
          gridElement: ref(document.getElementById('shell-grid')),
          mode: ref('view')
        });

        window.__shellBrowserTest = {
          run: async function () {
            try {
            await nextTick();
            var grid = document.getElementById('shell-grid');
            var rect = grid.getBoundingClientRect();
            var menu = shell.actions.prepareDashboardContextMenu(new MouseEvent('contextmenu', {
              clientX: rect.left + 160,
              clientY: rect.top + 100,
              bubbles: true
            }));
            var menuHadPaste = menu.items.some(function (item) { return item.id === 'paste'; });
            var menuPasteItem = menu.items.find(function (item) { return item.id === 'paste'; });
            var menuPasteLabel = menuPasteItem && menuPasteItem.label;
            var menuPasteIntent = menuPasteItem && menuPasteItem.metadata && menuPasteItem.metadata.placementIntent;
            var menuPasteStrategy = menuPasteItem && menuPasteItem.metadata && menuPasteItem.metadata.strategy;
            var menuPositionSource = shell.state.value.lastMenuPosition && shell.state.value.lastMenuPosition.source;
            shell.actions.closeMenu('browser-test');
            var menuCleaned = shell.state.value.menu === null && shell.state.value.lastMenuPosition === null;

            await shell.actions.copyWidget('a');
            var pasted = await shell.actions.pasteAtEvent(new MouseEvent('contextmenu', {
              clientX: rect.left + 260,
              clientY: rect.top + 100,
              bubbles: true
            }));
            var pastedId = pasted.affectedIds[0];
            var pasteWritten = Boolean(pasted.proposedDocument && pasted.proposedDocument.layouts.default.widgets[pastedId]);

            var highlighted = shell.actions.highlightItem('a');
            var scroll = await shell.actions.scrollToItem('a', { behavior: 'auto' });
            var primaryKey = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
              ? { metaKey: true }
              : { ctrlKey: true };

            await shell.actions.copyWidget('a');
            var cleanupKeyboard = shell.actions.bindKeyboard(window);
            window.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ key: 'v', bubbles: true }, primaryKey)));
            await new Promise(function (resolve) { setTimeout(resolve, 30); });
            var keyboardLayoutCountAfterPaste = layoutRef.value.length;
            var keyboardPasteResult = shell.state.value.lastResult;
            window.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ key: 'z', bubbles: true }, primaryKey)));
            await new Promise(function (resolve) { setTimeout(resolve, 30); });
            var keyboardLayoutCountAfterUndo = layoutRef.value.length;
            await shell.actions.selectItem('a');
            window.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ key: 'r', bubbles: true }, primaryKey)));
            await new Promise(function (resolve) { setTimeout(resolve, 30); });
            var keyboardCopiedReference = copiedReferences[0];
            window.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ key: 'i', bubbles: true }, primaryKey)));
            await new Promise(function (resolve) { setTimeout(resolve, 30); });
            var keyboardReferencePasteResult = shell.state.value.lastResult;
            await shell.actions.selectItem('b');
            var keyboardCutBefore = layoutRef.value.length;
            window.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ key: 'x', bubbles: true }, primaryKey)));
            await new Promise(function (resolve) { setTimeout(resolve, 30); });
            var keyboardCutAfter = layoutRef.value.length;
            var keyboardCutRemoved = !layoutRef.value.some(function (item) { return item.i === 'b'; });
            window.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ key: 'v', bubbles: true }, primaryKey)));
            await new Promise(function (resolve) { setTimeout(resolve, 30); });
            var keyboardCutPlacementActive = Boolean(editor.placementSession.value);
            var keyboardCutPlacementSource = editor.placementSession.value && editor.placementSession.value.source;
            var keyboardCutPlacementLayoutCount = layoutRef.value.length;
            var keyboardCutPasteItem = layoutRef.value.find(function (item) { return item.i.indexOf('b-copy') === 0; });
            editor.cancelPlacement('keyboard-cut-placement-test');
            cleanupKeyboard();

            var emptyAddEnabled = emptyShell.state.value.emptyAdd.enabled;
            var paletteAdd = await emptyShell.actions.openWidgetPalette(null);
            var refPaste = await shell.actions.pasteWidgetReference({ x: 1, y: 6 });
            await policyShell.actions.selectItem('a');
            await policyShell.actions.copyWidget('a');
            var policyCleanupKeyboard = policyShell.actions.bindKeyboard(window);
            var policyLeakedKeyboardEvents = 0;
            var policyLeakListener = function () { policyLeakedKeyboardEvents += 1; };
            window.addEventListener('keydown', policyLeakListener);
            window.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Enter',
              bubbles: true,
              ctrlKey: true
            }));
            await new Promise(function (resolve) { setTimeout(resolve, 30); });
            var policyKeyboardPlacementActive = Boolean(policyEditor.placementSession.value);
            var policyKeyboardPlacementPolicy = policyEditor.placementSession.value &&
              policyEditor.placementSession.value.collisionPolicy;
            var policyKeyboardPlacementSource = policyEditor.placementSession.value &&
              policyEditor.placementSession.value.source;
            var policyKeyboardPlacementLayoutCount = policyLayoutRef.value.length;
            policyEditor.cancelPlacement('keyboard-place-clipboard-test');
            var policyPasteEvent = function () { return new KeyboardEvent('keydown', Object.assign({
              key: 'v',
              bubbles: true
            }, primaryKey)); };
            window.dispatchEvent(policyPasteEvent());
            await new Promise(function (resolve) { setTimeout(resolve, 30); });
            window.dispatchEvent(policyPasteEvent());
            await new Promise(function (resolve) { setTimeout(resolve, 30); });
            window.removeEventListener('keydown', policyLeakListener);
            policyCleanupKeyboard();
            var policyKeyboardPasteItems = policyLayoutRef.value
              .filter(function (item) { return item.i.indexOf('a-copy') === 0; })
              .sort(function (a, b) { return a.x - b.x || a.y - b.y || a.i.localeCompare(b.i); });
            var policyKeyboardPasteItem = policyKeyboardPasteItems[0];
            var policyKeyboardSecondPasteItem = policyKeyboardPasteItems[1];
            var policyKeyboardPasteStrategy = policyShell.state.value.lastResult &&
              policyShell.state.value.lastResult.diagnostics &&
              policyShell.state.value.lastResult.diagnostics.computed &&
              policyShell.state.value.lastResult.diagnostics.computed.placement &&
              policyShell.state.value.lastResult.diagnostics.computed.placement.strategy;
            var policyFirst = await policyShell.actions.addWidgetFromTemplate({ id: 'policy-first', w: 1, h: 1 }, null, { strategy: 'first-fit' });
            var policyFirstItem = policyLayoutRef.value.find(function (item) { return item.i === 'policy-first'; });
            var policyShift = await policyShell.actions.addWidgetFromTemplate({ id: 'policy-top', w: 2, h: 2 }, null, { strategy: 'insert-top-shift' });
            var policyTopItem = policyLayoutRef.value.find(function (item) { return item.i === 'policy-top'; });
            var shiftedA = policyLayoutRef.value.find(function (item) { return item.i === 'a'; });
            var policyMenu = policyShell.actions.prepareDashboardContextMenu(null);
            var policyMenuAdd = policyMenu.items.find(function (item) { return item.id === 'add-widget'; });
            var policyMenuStrategy = policyMenuAdd.metadata.strategy;
            var policyMenuIntent = policyMenuAdd.metadata.placementIntent;
            var moveDownBefore = shiftedA && shiftedA.y;
            var moveDown = await policyShell.actions.moveAllWidgets(0, 1, { source: 'toolbar' });
            var moveDownAfter = policyLayoutRef.value.find(function (item) { return item.i === 'a'; }).y;
            var moveUp = await policyShell.actions.moveAllWidgets(0, -1, { source: 'toolbar' });
            var moveUpAfter = policyLayoutRef.value.find(function (item) { return item.i === 'a'; }).y;
            var viewMenu = viewShell.actions.prepareDashboardContextMenu(null);
            var viewPasteEnabled = viewMenu.items.find(function (item) { return item.id === 'paste'; }).enabled;

            return {
              menuHadPaste: menuHadPaste,
              menuPasteLabel: menuPasteLabel,
              menuPasteIntent: menuPasteIntent,
              menuPasteStrategy: menuPasteStrategy,
              menuPositionSource: menuPositionSource,
              menuCleaned: menuCleaned,
              pastedOk: pasted.ok,
              pasteWritten: pasteWritten,
              highlightedOk: highlighted.ok,
              scrollOk: scroll.ok,
              keyboardLayoutCount: keyboardLayoutCountAfterPaste,
              keyboardPasteStatus: keyboardPasteResult && keyboardPasteResult.status,
              keyboardPasteCommandType: keyboardPasteResult && keyboardPasteResult.type,
              keyboardPastePatchCount: keyboardPasteResult && keyboardPasteResult.layoutPatches && keyboardPasteResult.layoutPatches.length,
              keyboardPasteAffectedIds: keyboardPasteResult && keyboardPasteResult.affectedIds,
              keyboardPasteReason: keyboardPasteResult && keyboardPasteResult.blockedReason,
              keyboardPasteDiagnostics: keyboardPasteResult && keyboardPasteResult.diagnostics,
              keyboardUndoLayoutCount: keyboardLayoutCountAfterUndo,
              keyboardCopiedReference: keyboardCopiedReference,
              keyboardReferencePasteType: keyboardReferencePasteResult && keyboardReferencePasteResult.type,
              keyboardReferencePasteOk: keyboardReferencePasteResult && keyboardReferencePasteResult.status === 'changed',
              keyboardReferencePasteId: keyboardReferencePasteResult && keyboardReferencePasteResult.affectedIds && keyboardReferencePasteResult.affectedIds[0],
              keyboardCutDelta: keyboardCutAfter - keyboardCutBefore,
              keyboardCutRemoved: keyboardCutRemoved,
              keyboardCutPlacementActive: keyboardCutPlacementActive,
              keyboardCutPlacementSource: keyboardCutPlacementSource,
              keyboardCutPlacementLayoutCount: keyboardCutPlacementLayoutCount,
              keyboardCutPasteId: keyboardCutPasteItem && keyboardCutPasteItem.i,
              emptyAddEnabled: emptyAddEnabled,
              paletteAddOk: paletteAdd.ok,
              refPasteOk: refPaste.ok,
              refPasteId: refPaste.affectedIds[0],
              policyKeyboardPasteX: policyKeyboardPasteItem && policyKeyboardPasteItem.x,
              policyKeyboardPasteY: policyKeyboardPasteItem && policyKeyboardPasteItem.y,
              policyKeyboardSecondPasteX: policyKeyboardSecondPasteItem && policyKeyboardSecondPasteItem.x,
              policyKeyboardSecondPasteY: policyKeyboardSecondPasteItem && policyKeyboardSecondPasteItem.y,
              policyKeyboardPasteStrategy: policyKeyboardPasteStrategy,
              policyKeyboardPlacementActive: policyKeyboardPlacementActive,
              policyKeyboardPlacementPolicy: policyKeyboardPlacementPolicy,
              policyKeyboardPlacementSource: policyKeyboardPlacementSource,
              policyKeyboardPlacementLayoutCount: policyKeyboardPlacementLayoutCount,
              policyLeakedKeyboardEvents: policyLeakedKeyboardEvents,
              policyFirstOk: policyFirst.ok,
              policyFirstX: policyFirstItem && policyFirstItem.x,
              policyFirstY: policyFirstItem && policyFirstItem.y,
              policyFirstStrategy: policyFirst.placement && policyFirst.placement.strategy,
              policyShiftOk: policyShift.ok,
              policyTopX: policyTopItem && policyTopItem.x,
              policyTopY: policyTopItem && policyTopItem.y,
              policyShiftedA: shiftedA && shiftedA.y,
              policyShiftStrategy: policyShift.placement && policyShift.placement.strategy,
              policyMenuStrategy: policyMenuStrategy,
              policyMenuIntent: policyMenuIntent,
              moveDownOk: moveDown.ok,
              moveUpOk: moveUp.ok,
              moveDownDelta: moveDownAfter - moveDownBefore,
              moveUpAfter: moveUpAfter,
              viewPasteEnabled: viewPasteEnabled,
              events: events
            };
            } catch (error) {
              return {
                error: error && (error.stack || error.message || String(error)),
                loadErrors: window.__shellLoadErrors
              };
            }
          }
        };
      })();
    </script>
  </body>
</html>`;

const htmlPath = path.join(root, '.tmp', 'dashboard-editor-shell-browser.html');
fs.writeFileSync(htmlPath, html);

function serve() {
  const server = http.createServer((req, res) => {
    const url = req.url === '/' ? '/.tmp/dashboard-editor-shell-browser.html' : req.url;
    const file = path.join(root, decodeURIComponent(url.split('?')[0]));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.statusCode = 404;
      res.end('not found');
      return;
    }
    res.end(fs.readFileSync(file));
  });
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

(async () => {
  const server = await serve();
  const port = server.address().port;
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await puppeteer.launch({
    headless: 'new',
    ...(fs.existsSync(chromePath) ? { executablePath: chromePath } : {}),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    const browserErrors = [];
    page.on('pageerror', error => {
      browserErrors.push(error.stack || error.message || String(error));
    });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
    if (browserErrors.length) {
      throw new Error(browserErrors.join('\n'));
    }
    const result = await page.evaluate(() => window.__shellBrowserTest.run()).catch(error => {
      throw new Error(`${error && (error.stack || error.message || String(error))}\n${browserErrors.join('\n')}`);
    });
    if (result.error) {
      throw new Error(`${result.error}\n${(result.loadErrors || []).join('\n')}`);
    }
    if (!result.paletteAddOk || !result.refPasteOk || !result.pastedOk) {
      throw new Error(JSON.stringify(result, null, 2));
    }
    assert.equal(result.menuHadPaste, true);
    assert.equal(result.menuPasteLabel, 'Paste here');
    assert.equal(result.menuPasteIntent, 'here');
    assert.equal(result.menuPasteStrategy, 'cursor');
    assert.equal(result.menuPositionSource, 'event');
    assert.equal(result.menuCleaned, true);
    assert.equal(result.pastedOk, true);
    assert.equal(result.pasteWritten, true);
    assert.equal(result.highlightedOk, true);
    assert.equal(result.scrollOk, true);
    assert.ok(result.keyboardLayoutCount >= 4, JSON.stringify(result, null, 2));
    assert.equal(result.keyboardUndoLayoutCount, result.keyboardLayoutCount - 1);
    assert.equal(result.keyboardCopiedReference, 'a');
    assert.equal(result.keyboardReferencePasteType, 'add');
    assert.equal(result.keyboardReferencePasteOk, true);
    assert.equal(result.keyboardReferencePasteId, 'reference-widget-1');
    assert.equal(result.keyboardCutDelta, -1);
    assert.equal(result.keyboardCutRemoved, true);
    assert.equal(result.keyboardCutPlacementActive, true);
    assert.equal(result.keyboardCutPlacementSource, 'paste');
    assert.equal(result.keyboardCutPlacementLayoutCount, result.keyboardUndoLayoutCount);
    assert.equal(result.keyboardCutPasteId, undefined);
    assert.equal(result.emptyAddEnabled, true);
    assert.equal(result.paletteAddOk, true);
    assert.equal(result.refPasteOk, true);
    assert.equal(result.refPasteId, 'reference-widget-2');
    assert.equal(result.policyKeyboardPasteX, 5);
    assert.equal(result.policyKeyboardPasteY, 0);
    assert.equal(result.policyKeyboardSecondPasteX, 7);
    assert.equal(result.policyKeyboardSecondPasteY, 0);
    assert.equal(result.policyKeyboardPasteStrategy, 'first-fit');
    assert.equal(result.policyKeyboardPlacementActive, true);
    assert.equal(result.policyKeyboardPlacementPolicy, 'layout');
    assert.equal(result.policyKeyboardPlacementSource, 'paste');
    assert.equal(result.policyKeyboardPlacementLayoutCount, 2);
    assert.equal(result.policyLeakedKeyboardEvents, 0);
    assert.equal(result.policyFirstOk, true);
    assert.equal(result.policyFirstX, 2);
    assert.equal(result.policyFirstY, 0);
    assert.equal(result.policyFirstStrategy, 'first-fit');
    assert.equal(result.policyShiftOk, true);
    assert.equal(result.policyTopX, 0);
    assert.equal(result.policyTopY, 0);
    assert.equal(result.policyShiftedA, 2);
    assert.equal(result.policyShiftStrategy, 'insert-top-shift');
    assert.equal(result.policyMenuStrategy, 'first-fit');
    assert.equal(result.policyMenuIntent, 'auto');
    assert.equal(result.moveDownOk, true);
    assert.equal(result.moveUpOk, true);
    assert.ok(result.moveDownDelta === 0 || result.moveDownDelta === 1);
    assert.ok(typeof result.moveUpAfter === 'number');
    assert.equal(result.viewPasteEnabled, false);
    assert.ok(result.events.includes('documentChange'));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  throw error;
});
