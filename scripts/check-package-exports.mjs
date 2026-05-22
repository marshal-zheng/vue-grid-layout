import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const errors = [];

const assertFile = (relativePath, label) => {
  const normalized = relativePath.replace(/^\.\//, "");
  const filePath = path.join(root, normalized);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    errors.push(`${label} points to missing file: ${relativePath}`);
  }
};

if (!pkg.exports || typeof pkg.exports !== "object") {
  errors.push("package.json must declare an exports map.");
} else {
  for (const [subpath, target] of Object.entries(pkg.exports)) {
    if (typeof target === "string") {
      assertFile(target, `exports["${subpath}"]`);
      continue;
    }

    if (!target || typeof target !== "object") {
      errors.push(`exports["${subpath}"] must be a string or condition object.`);
      continue;
    }

    for (const condition of ["types", "import", "require", "default"]) {
      if (typeof target[condition] === "string") {
        assertFile(target[condition], `exports["${subpath}"].${condition}`);
      }
    }

    if (subpath !== "./style.css" && !target.types) {
      errors.push(`exports["${subpath}"] is missing a types condition.`);
    }
  }
}

for (const field of ["main", "module", "types", "style"]) {
  if (pkg[field]) assertFile(pkg[field], `package.json#${field}`);
}

if (pkg.unpkg) {
  errors.push("package.json#unpkg must not point to a legacy UMD artifact.");
}

if (pkg.typings && pkg.typings === "./typings/index.d.ts") {
  errors.push("package.json#typings must not use the legacy handwritten typings entry.");
}

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("package exports verified");
