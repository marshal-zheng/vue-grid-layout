/* eslint-disable no-process-exit */
"use strict";

const { performance } = require("node:perf_hooks");
const fs = require("node:fs");
const path = require("node:path");

const utilsPath = path.join(__dirname, "..", "build", "cjs", "utils.js");
if (!fs.existsSync(utilsPath)) {
  process.stdout.write("bench: missing build artifacts. Run `npm run build` first.\n");
  process.exit(1);
}
const {
  compact,
  moveElement,
  cloneLayout,
  cloneLayoutItem,
} = require(utilsPath);

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateLayout(count, cols) {
  const layout = new Array(count);
  for (let i = 0; i < count; i++) {
    const w = randInt(1, Math.min(4, cols));
    const h = randInt(1, 4);
    const x = randInt(0, Math.max(0, cols - w));
    const y = randInt(0, Math.max(0, Math.floor(count / 2)));
    layout[i] = {
      i: String(i),
      x,
      y,
      w,
      h,
      static: false,
      moved: false,
    };
  }
  return layout;
}

function ms(n) {
  return `${n.toFixed(2)}ms`;
}

function benchCompactOnce(layout, cols) {
  const start = performance.now();
  compact(layout, "vertical", cols, false);
  return performance.now() - start;
}

function benchMove(layout, cols, steps) {
  const local = cloneLayout(layout);
  const start = performance.now();
  for (let i = 0; i < steps; i++) {
    const idx = randInt(0, local.length - 1);
    const target = local[idx];
    if (!target) continue;
    const x = randInt(0, Math.max(0, cols - target.w));
    const y = randInt(0, Math.max(0, Math.floor(local.length / 2)));
    moveElement(local, target, "vertical", cols, false, x, y, true, false);
  }
  return performance.now() - start;
}

function benchWithSizes() {
  const cols = 12;
  const sizes = process.env.SIZES
    ? String(process.env.SIZES)
        .split(",")
        .map(s => Number(s.trim()))
        .filter(n => Number.isFinite(n) && n > 0)
    : [50, 200, 500];
  const steps = process.env.STEPS ? Number(process.env.STEPS) : 200;

  for (let i = 0; i < sizes.length; i++) {
    const n = sizes[i];
    const base = generateLayout(n, cols);

    // Warm up JIT
    benchCompactOnce(base, cols);
    benchMove(base, cols, 50);

    const c = benchCompactOnce(base, cols);
    const m = benchMove(base, cols, steps);

    process.stdout.write(
      `n=${n} cols=${cols} compact=${ms(c)} move(${steps})=${ms(m)}\n`
    );
  }
}

function ensureBuildArtifacts() {
  const sample = cloneLayoutItem({
    i: "0",
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    static: false,
    moved: false,
  });
  if (!sample || sample.i !== "0") {
    process.stdout.write("bench: unexpected build artifacts\n");
    process.exit(1);
  }
}

ensureBuildArtifacts();
benchWithSizes();

