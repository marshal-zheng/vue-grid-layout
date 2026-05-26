import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const publicSubpaths = new Set(Object.keys(pkg.exports || {}));
const errors = [];
const exampleFiles = fs.existsSync(path.join(root, "example"))
  ? fs.readdirSync(path.join(root, "example"))
      .filter(file => file.endsWith(".js"))
      .map(file => `example/${file}`)
  : [];

const files = [
  "README.md",
  "mcp/README.md",
  "mcp/src/data.ts",
  "mcp/src/examples/fallback.ts",
  "example/main.ts",
  ...exampleFiles
];

const importPattern = /(?:from\s+|import\s*\(\s*)["'](@marsio\/vue-grid-layout(?:\/[^"']*)?)["']/g;

const toSubpath = specifier => {
  const withoutQuery = specifier.split("?")[0];
  if (withoutQuery === "@marsio/vue-grid-layout") return ".";
  return `.${withoutQuery.slice("@marsio/vue-grid-layout".length)}`;
};

for (const file of files) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) continue;
  const text = fs.readFileSync(absolute, "utf8");
  for (const match of text.matchAll(importPattern)) {
    const specifier = match[1];
    const subpath = toSubpath(specifier);
    if (!publicSubpaths.has(subpath)) {
      errors.push(`${file} imports ${specifier}, but ${subpath} is not declared in package exports.`);
    }
  }
}

const activeLegacyFiles = [
  "index.html",
  "example/index.html",
  "example/main.ts",
  ...exampleFiles,
  "mcp/README.md",
  "mcp/src/data.ts",
  "mcp/src/examples/fallback.ts"
];
const forbiddenLegacy = [
  "window.VueGridLayout",
  "VueGridLayout: VGL",
  "VGL.",
  "VueInstance",
  "window.Pinia",
  "demoCompat",
  "createLegacyWindow",
  "new Function(\"window\"",
  "?raw",
  "vue-grid-layout.min.js",
  "babel.min.js",
  "vue-3.2.36.js",
  "https://unpkg.com/pinia",
  "../build/web"
];

for (const file of activeLegacyFiles) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) continue;
  const text = fs.readFileSync(absolute, "utf8");
  for (const token of forbiddenLegacy) {
    if (text.includes(token)) {
      errors.push(`${file} still references legacy browser artifact token: ${token}`);
    }
  }
}

const assertFileContains = (file, token, message) => {
  const absolute = path.join(root, file);
  const text = fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : "";
  if (!text.includes(token)) {
    errors.push(`${file}: ${message}`);
  }
};

const assertFileExcludes = (file, token, message) => {
  const absolute = path.join(root, file);
  const text = fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : "";
  if (text.includes(token)) {
    errors.push(`${file}: ${message}`);
  }
};

const shellDemo = "example/25-dashboard-editor-shell.js";
assertFileContains(shellDemo, 'documentWriteBack: "shell"', "shell demo must opt the profile model and editor shell into shell-managed document write-back.");
assertFileContains(shellDemo, ':documentWriteBack="\'shell\'"', "shell demo grid component must disable component-managed write-back.");
assertFileExcludes(shellDemo, "@documentChange=", "shell demo must not listen for component documentChange; shell onDocumentChange is the single write-back path.");
assertFileExcludes(shellDemo, "handleGridDocumentChange", "shell demo must not keep a component documentChange fallback handler.");
assertFileExcludes(shellDemo, "historyStore", "shell demo must use editor command history instead of the legacy layout historyStore.");
assertFileContains(shellDemo, "resultStream", "shell demo must display shell action results and diagnostics.");
assertFileContains(shellDemo, "simulatePointerMove", "shell demo must dogfood synthetic pointer drag results.");
assertFileContains(shellDemo, "simulatePointerResize", "shell demo must dogfood synthetic pointer resize results.");
assertFileContains(shellDemo, "simulateExternalDrop", "shell demo must dogfood synthetic external drop results.");
assertFileContains(shellDemo, "runSettingsMigration", "shell demo must cover layout settings migration in the result panel.");
assertFileContains(shellDemo, "undoHistory", "shell demo must expose editor command undo.");
assertFileContains(shellDemo, "redoHistory", "shell demo must expose editor command redo.");

const runtimeLab = "example/24-dashboard-runtime-lab.js";
assertFileContains(runtimeLab, "compatibility / layout-only", "runtime lab must label legacy history as compatibility / layout-only.");
assertFileContains(runtimeLab, "recommended editor path is the Dashboard Editor Shell demo", "runtime lab must not present legacy history as the recommended dashboard editor path.");

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("documentation and example imports verified");
