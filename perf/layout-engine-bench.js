/* eslint-disable no-process-exit */
"use strict";

const { performance } = require("node:perf_hooks");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const enginePath = path.join(root, "build", "cjs", "layout-engine", "index.js");

if (!fs.existsSync(enginePath)) {
  process.stdout.write("layout-engine bench: missing build artifacts. Run `npm run build` first.\n");
  process.exit(1);
}

const {
  executeLayoutOperation,
  mainThreadLayoutExecutor,
  workerLayoutExecutor
} = require(enginePath);
const { runLayoutWorkerRequest } = require(path.join(root, "build", "cjs", "layout-engine", "workerRuntime.js"));

const scenarioList = [
  "dense",
  "sparse",
  "static-mixed",
  "preventCollision",
  "allowOverlap",
  "drag-across-rows",
  "north-west-resize",
  "external-drop-fit",
  "compact-commit"
];

function readJson(filePath, fallback) {
  if (!filePath || !fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseList(value, fallback, mapper = String) {
  if (!value) return fallback;
  return String(value)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean)
    .map(mapper);
}

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function generateLayout(count, cols, scenario, seed) {
  const rng = createRng(seed);
  const layout = new Array(count);
  const dense = scenario === "dense" || scenario === "preventCollision";
  const sparse = scenario === "sparse" || scenario === "external-drop-fit";
  const rowSpan = dense ? Math.max(4, Math.floor(count / cols)) : sparse ? count * 2 : Math.floor(count / 2);

  for (let i = 0; i < count; i++) {
    const w = dense ? randInt(rng, 1, 2) : randInt(rng, 1, Math.min(4, cols));
    const h = dense ? randInt(rng, 1, 2) : randInt(rng, 1, 4);
    const x = dense
      ? (i * 2) % Math.max(1, cols - w + 1)
      : randInt(rng, 0, Math.max(0, cols - w));
    const y = dense
      ? Math.floor((i * 2) / cols)
      : randInt(rng, 0, Math.max(0, rowSpan));
    layout[i] = {
      i: String(i),
      x,
      y,
      w,
      h,
      static: scenario === "static-mixed" ? i % 7 === 0 : false,
      moved: false
    };
  }
  return layout;
}

function percentile(values, pct) {
  if (values.length === 0) return 0;
  const sorted = values.slice(0).sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((pct / 100) * sorted.length) - 1);
  return sorted[index];
}

function stats(samples) {
  const sum = samples.reduce((total, value) => total + value, 0);
  return {
    meanMs: samples.length ? sum / samples.length : 0,
    p95Ms: percentile(samples, 95),
    maxMs: samples.length ? Math.max(...samples) : 0
  };
}

function scenarioOperation(scenario, layout, cols, step) {
  const moving = layout[step % layout.length] || layout[0];
  switch (scenario) {
    case "north-west-resize":
      return {
        type: "resize",
        id: moving.i,
        w: Math.max(1, moving.w + (step % 2 === 0 ? 1 : -1)),
        h: Math.max(1, moving.h + (step % 3 === 0 ? 1 : -1)),
        handle: "nw"
      };
    case "external-drop-fit":
      return {
        type: "dropFit",
        item: { i: `drop-${step}`, w: 2, h: 2 },
        strategy: "cursor",
        target: { x: step % cols, y: Math.floor(step / cols) }
      };
    case "compact-commit":
      return { type: "compact" };
    case "drag-across-rows":
    default:
      return {
        type: "move",
        id: moving.i,
        x: (moving.x + step + 1) % Math.max(1, cols - moving.w + 1),
        y: Math.max(0, moving.y + (step % 5) - 2),
        userAction: true
      };
  }
}

class FakeWorker {
  constructor() {
    this.onmessage = null;
    this.onerror = null;
  }

  postMessage(message) {
    setImmediate(() => {
      try {
        this.onmessage && this.onmessage({ data: runLayoutWorkerRequest(message) });
      } catch (error) {
        this.onerror && this.onerror(error);
      }
    });
  }

  terminate() {}
}

function createBenchExecutor(kind) {
  if (kind === "worker") {
    return workerLayoutExecutor({ workerFactory: () => new FakeWorker(), timeoutMs: 10000 });
  }
  return mainThreadLayoutExecutor();
}

async function benchScenario({ scenario, itemCount, cols, operations, seed, executorKind }) {
  const baseLayout = generateLayout(itemCount, cols, scenario, seed);
  const samples = [];
  const executor = createBenchExecutor(executorKind);
  let workerComputeMs = 0;
  let queueMs = 0;
  const options = {
    cols,
    maxRows: Infinity,
    compactType: scenario === "allowOverlap" ? null : "vertical",
    allowOverlap: scenario === "allowOverlap",
    preventCollision: scenario === "preventCollision",
    scheduler: { mode: "auto" },
    executor,
    diagnostics: true
  };

  let layout = baseLayout;
  for (let i = 0; i < operations; i++) {
    const request = {
      id: `${scenario}:${itemCount}:${i}`,
      phase: scenario === "compact-commit" ? "commit" : "preview",
      layout,
      operation: scenarioOperation(scenario, layout, cols, i),
      options,
      heavy: itemCount >= 1000
    };
    const start = performance.now();
    const result = executorKind === "worker"
      ? await executor.execute(request)
      : executeLayoutOperation(request);
    const elapsed = performance.now() - start;
    samples.push(elapsed);
    if (executorKind === "worker") {
      workerComputeMs += result.diagnostics?.computeMs || 0;
      queueMs += Math.max(0, elapsed - (result.diagnostics?.computeMs || 0));
    }
    if (result.status === "changed" || result.status === "fallback") {
      layout = result.layout;
    }
  }
  executor.dispose && executor.dispose();

  return {
    scenario,
    itemCount,
    operationCount: operations,
    schedulerMode: "auto",
    executorKind,
    workerComputeMs,
    queueMs,
    endToEndMs: samples.reduce((total, value) => total + value, 0),
    ...stats(samples)
  };
}

function evaluateBudget(result, budgets, baselines) {
  const scenarioBudget = budgets.scenarios?.[result.scenario] || {};
  const key = `${result.scenario}:${result.itemCount}`;
  const baseline = baselines.results?.[key];
  const failures = [];

  if (
    typeof scenarioBudget.absoluteMaxMs === "number" &&
    result.p95Ms > scenarioBudget.absoluteMaxMs
  ) {
    failures.push(`p95 ${result.p95Ms.toFixed(2)}ms > absolute ${scenarioBudget.absoluteMaxMs}ms`);
  }

  if (
    baseline &&
    typeof baseline.p95Ms === "number" &&
    typeof budgets.relativeRegression === "number" &&
    result.p95Ms > baseline.p95Ms * budgets.relativeRegression
  ) {
    failures.push(`p95 ${result.p95Ms.toFixed(2)}ms > baseline ${baseline.p95Ms}ms x ${budgets.relativeRegression}`);
  }

  return {
    ...result,
    budgetStatus: failures.length > 0 ? "fail" : baseline ? "pass" : "record-only",
    failures
  };
}

function format(result) {
  return [
    `scenario=${result.scenario}`,
    `n=${result.itemCount}`,
    `ops=${result.operationCount}`,
    `mean=${result.meanMs.toFixed(2)}ms`,
    `p95=${result.p95Ms.toFixed(2)}ms`,
    `max=${result.maxMs.toFixed(2)}ms`,
    `scheduler=${result.schedulerMode}`,
    `executor=${result.executorKind}`,
    `workerCompute=${(result.workerComputeMs || 0).toFixed(2)}ms`,
    `queue=${(result.queueMs || 0).toFixed(2)}ms`,
    `status=${result.budgetStatus}`
  ].join(" ");
}

async function main() {
  const sizes = parseList(process.env.SIZES, [100, 500, 1000, 2000], Number)
    .filter(value => Number.isFinite(value) && value > 0);
  const scenarios = parseList(process.env.SCENARIOS, scenarioList, String)
    .filter(value => scenarioList.includes(value));
  const operations = Number(process.env.OPERATIONS || process.env.STEPS || 50);
  const cols = Number(process.env.COLS || 12);
  const seed = Number(process.env.SEED || 42);
  const executorKind = process.env.EXECUTOR === "worker" ? "worker" : "main-thread";
  const budgetFile = process.env.BUDGET_FILE || path.join(__dirname, "budgets", "layout-engine.json");
  const baselineFile = process.env.BASELINE_FILE || path.join(__dirname, "baselines", "layout-engine.json");
  const budgets = readJson(budgetFile, { relativeRegression: 2, scenarios: {} });
  const baselines = readJson(baselineFile, { results: {} });

  const results = [];
  let failed = false;
  for (const size of sizes) {
    for (const scenario of scenarios) {
      const evaluated = evaluateBudget(
        await benchScenario({ scenario, itemCount: size, cols, operations, seed, executorKind }),
        budgets,
        baselines
      );
      results.push(evaluated);
      process.stdout.write(`${format(evaluated)}\n`);
      if (evaluated.failures?.length) {
        failed = true;
        evaluated.failures.forEach(failure => process.stdout.write(`  budget-failure=${failure}\n`));
      }
    }
  }

  if (process.env.OUTPUT === "json") {
    process.stdout.write(`${JSON.stringify({ results }, null, 2)}\n`);
  }

  if (failed) process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
