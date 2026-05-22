'use strict';

const runtime = require('./index.runtime.cjs');
const root = runtime && (runtime.default || runtime.VueGridLayout || runtime);
const coreSafeKeys = [
  'GRID_HEIGHT_DIAGNOSTIC_CODES',
  'WidthProvider',
  'applyRenderPrecision',
  'bottom',
  'calcGridColWidth',
  'calcGridItemPosition',
  'calcGridItemWHPx',
  'calcWH',
  'calcXY',
  'calculateUtils',
  'childrenEqual',
  'clamp',
  'cloneLayout',
  'cloneLayoutItem',
  'collides',
  'compact',
  'compactInPlace',
  'compactItem',
  'compactType',
  'correctBounds',
  'findFirstFit',
  'findNearestFit',
  'getAllCollisions',
  'getFirstCollision',
  'getLayoutItem',
  'getNonFragmentChildren',
  'getStatics',
  'gridHeight',
  'modifyLayout',
  'moveElement',
  'moveElementAwayFromCollision',
  'noop',
  'perc',
  'resizeItemInDirection',
  'resolveGridHeightRuntime',
  'setTopLeft',
  'setTransform',
  'sortLayoutItems',
  'sortLayoutItemsByColRow',
  'sortLayoutItemsByRowCol',
  'synchronizeLayoutWithChildren',
  'useContainerHeightMeasurement',
  'utils',
  'validateLayout',
  'withLayoutItem'
];

if (root && (typeof root === 'object' || typeof root === 'function')) {
  coreSafeKeys.forEach(key => {
    if (typeof runtime[key] !== 'undefined' && typeof root[key] === 'undefined') {
      root[key] = runtime[key];
    }
  });
  root.default = root;
  root.VueGridLayout = root;
  module.exports = root;
} else {
  module.exports = runtime;
}
