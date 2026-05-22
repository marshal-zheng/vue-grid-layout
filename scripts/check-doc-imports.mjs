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

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("documentation and example imports verified");
