import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const errors = [];

const exists = file => fs.existsSync(path.join(root, file));
const keys = object => Object.keys(object || {});

for (const file of ["dist/index.mjs", "dist/index.cjs", "dist/style.css", "dist/types/index.d.ts", "README.md", "LICENSE", "package.json"]) {
  if (!exists(file)) errors.push(`Missing package artifact file: ${file}`);
}

if (pkg.unpkg) errors.push("package.json must not declare unpkg.");
if (pkg.typings === "./typings/index.d.ts") errors.push("package.json must not point typings at legacy typings/index.d.ts.");
if (pkg.main !== "./dist/index.cjs") errors.push("package.json#main must point at ./dist/index.cjs.");
if (pkg.module !== "./dist/index.mjs") errors.push("package.json#module must point at ./dist/index.mjs.");
if (pkg.types !== "./dist/types/index.d.ts") errors.push("package.json#types must point at ./dist/types/index.d.ts.");
if (pkg.style !== "./dist/style.css") errors.push("package.json#style must point at ./dist/style.css.");
if (!Array.isArray(pkg.sideEffects) || !pkg.sideEffects.some(item => String(item).includes(".css"))) {
  errors.push("package.json#sideEffects must preserve CSS side effects.");
}
if (keys(pkg.dependencies).includes("vue")) errors.push("vue must not be a runtime dependency.");
if (!pkg.peerDependencies?.vue) errors.push("vue must be a peer dependency.");
if (!pkg.devDependencies?.vue) errors.push("vue must be a dev dependency for repository development.");
if (!pkg.peerDependencies?.pinia) errors.push("pinia must be a peer dependency for history.");
if (!pkg.peerDependenciesMeta?.pinia?.optional) errors.push("pinia peer dependency must be optional.");
if (!pkg.devDependencies?.pinia) errors.push("pinia must remain a dev dependency for history tests.");

const activeText = JSON.stringify({
  scripts: pkg.scripts,
  dependencies: pkg.dependencies,
  devDependencies: pkg.devDependencies
}, null, 2);
const forbidden = [
  "webpack",
  "webpack-cli",
  "webpack-dev-server",
  "webpack-bundle-analyzer",
  "babel-loader",
  "ts-loader",
  "vue-loader",
  "eslint-webpack-plugin",
  "fork-ts-checker-webpack-plugin",
  "lodash-webpack-plugin",
  "progress-bar-webpack-plugin",
  "terser-webpack-plugin"
];
for (const token of forbidden) {
  if (activeText.includes(token)) errors.push(`Active package metadata still references ${token}.`);
}
for (const file of ["webpack.config.js", "script.js", "build", "typings"]) {
  if (exists(file)) errors.push(`Legacy build artifact or workflow still exists: ${file}`);
}

try {
  const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" }
  });
  const files = JSON.parse(output)[0].files.map(file => file.path);
  for (const required of ["package.json", "README.md", "LICENSE", "dist/index.mjs", "dist/index.cjs", "dist/style.css", "dist/types/index.d.ts"]) {
    if (!files.includes(required)) errors.push(`Packed artifact is missing ${required}.`);
  }
  for (const file of files) {
    if (file.startsWith("node_modules/") || file.startsWith(".tmp/") || file.startsWith("build/") || file.startsWith("typings/") || file.startsWith("docs/specs/")) {
      errors.push(`Packed artifact includes forbidden file: ${file}`);
    }
    if (file.endsWith(".map")) {
      errors.push(`Packed artifact must not include sourcemaps: ${file}`);
    }
  }
} catch (error) {
  errors.push(`npm pack dry-run failed: ${error instanceof Error ? error.message : String(error)}`);
}

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("package artifact metadata verified");
