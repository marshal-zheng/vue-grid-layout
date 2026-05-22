import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bin = path.join(root, "node_modules", ".bin");
const dist = path.join(root, "dist");
const typeRoot = path.join(dist, "types");

const run = (command, args) => {
  execFileSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || "production"
    }
  });
};

const writeFile = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
};

const publicEntries = [
  "index",
  "core",
  "responsive",
  "layout-engine",
  "editor",
  "dashboard",
  "dashboard-editor-shell",
  "persistence",
  "history",
  "worker"
];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

run(path.join(bin, "vite"), ["build", "--mode", "library"]);
run(path.join(bin, "tsc"), ["-p", "tsconfig.types.json"]);

fs.copyFileSync(path.join(root, "css", "styles.css"), path.join(dist, "style.css"));

for (const entry of publicEntries) {
  writeFile(
    path.join(typeRoot, `${entry}.d.ts`),
    `export { default } from "./lib/entries/${entry}";\nexport * from "./lib/entries/${entry}";\n`
  );
}

writeFile(
  path.join(typeRoot, "style.css.d.ts"),
  "declare const stylesheet: string;\nexport default stylesheet;\n"
);

writeFile(
  path.join(dist, "index.cjs"),
  `'use strict';

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
`
);

run(process.execPath, [path.join(root, "scripts", "check-package-exports.mjs")]);
run(process.execPath, [path.join(root, "scripts", "check-public-types.mjs")]);
