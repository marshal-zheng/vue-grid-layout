import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const errors = [];

const entryNameForSubpath = subpath => subpath === "." ? "index" : subpath.replace(/^\.\//, "");

for (const [subpath, target] of Object.entries(pkg.exports || {})) {
  if (subpath === "./package.json" || subpath === "./style.css") continue;
  if (!target || typeof target !== "object") {
    errors.push(`${subpath} must use a conditional export object with types.`);
    continue;
  }

  const entryName = entryNameForSubpath(subpath);
  const publicType = target.types;
  const facadeType = `./dist/types/lib/entries/${entryName}.d.ts`;

  if (publicType !== `./dist/types/${entryName}.d.ts`) {
    errors.push(`${subpath} types should point to ./dist/types/${entryName}.d.ts.`);
  }
  for (const file of [publicType, facadeType]) {
    const filePath = path.join(root, file.replace(/^\.\//, ""));
    if (!fs.existsSync(filePath)) errors.push(`${subpath} missing generated type file: ${file}`);
  }
}

const legacyTypings = pkg.typings === "./typings/index.d.ts";
if (legacyTypings) errors.push("package typings still points at the legacy handwritten declaration file.");

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("public types verified");
