import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const analyze = process.argv.includes("--analyze");
const errors = [];

const entryFiles = [
  "index.mjs",
  "core.mjs",
  "responsive.mjs",
  "persistence.mjs",
  "layout-engine.mjs",
  "history.mjs"
];

const gzipBudgets = {
  "index.mjs": 65 * 1024,
  "core.mjs": 65 * 1024,
  "responsive.mjs": 80 * 1024,
  "persistence.mjs": 65 * 1024,
  "layout-engine.mjs": 30 * 1024,
  "history.mjs": 8 * 1024
};

const forbiddenPolicies = {
  "index.mjs": [
    ["content:from \"pinia\"", "Pinia must not be imported by the root closure."],
    ["content:from 'pinia'", "Pinia must not be imported by the root closure."],
    ["file:editor", "Editor runtime must not be imported by the root closure."],
    ["file:EditorGridLayout", "Editor component runtime must not be imported by the root closure."],
    ["file:controller-", "Editor controller runtime must not be imported by the root closure."],
    ["file:commands-", "Editor commands runtime must not be imported by the root closure."],
    ["file:keyboard-", "Editor keyboard runtime must not be imported by the root closure."],
    ["file:persistence", "Persistence runtime must not be imported by the root closure."],
    ["file:dashboard", "Dashboard runtime must not be imported by the root closure."],
    ["file:dashboard-editor-shell", "Dashboard editor shell must not be imported by the root closure."],
    ["file:history", "History runtime must not be imported by the root closure."],
    ["content:createGridEditorController", "Editor controller API must not be imported by the root closure."],
    ["content:useGridHistoryStore", "History API must not be imported by the root closure."],
    ["content:mcp/server", "MCP server code must not be imported by the root closure."],
    ["content:node:fs", "Node-only fs code must not be imported by the root closure."],
    ["content:node:path", "Node-only path code must not be imported by the root closure."],
    ["content:webpack", "Webpack-only code must not be imported by the root closure."]
  ],
  "core.mjs": [
    ["content:from \"pinia\"", "Pinia must not be imported by the core closure."],
    ["content:from 'pinia'", "Pinia must not be imported by the core closure."],
    ["file:editor", "Editor runtime must not be imported by the core closure."],
    ["file:EditorGridLayout", "Editor component runtime must not be imported by the core closure."],
    ["file:controller-", "Editor controller runtime must not be imported by the core closure."],
    ["file:commands-", "Editor commands runtime must not be imported by the core closure."],
    ["file:keyboard-", "Editor keyboard runtime must not be imported by the core closure."],
    ["file:persistence", "Persistence runtime must not be imported by the core closure."],
    ["file:dashboard", "Dashboard runtime must not be imported by the core closure."],
    ["file:dashboard-editor-shell", "Dashboard editor shell must not be imported by the core closure."],
    ["file:history", "History runtime must not be imported by the core closure."],
    ["content:createGridEditorController", "Editor controller API must not be imported by the core closure."],
    ["content:useGridHistoryStore", "History API must not be imported by the core closure."],
    ["content:mcp/server", "MCP server code must not be imported by the core closure."],
    ["content:node:fs", "Node-only fs code must not be imported by the core closure."],
    ["content:node:path", "Node-only path code must not be imported by the core closure."],
    ["content:webpack", "Webpack-only code must not be imported by the core closure."]
  ],
  "responsive.mjs": [
    ["content:from \"pinia\"", "Pinia must not be imported by the responsive closure."],
    ["content:from 'pinia'", "Pinia must not be imported by the responsive closure."],
    ["file:editor", "Editor runtime must not be imported by the responsive closure."],
    ["file:EditorGridLayout", "Editor component runtime must not be imported by the responsive closure."],
    ["file:controller-", "Editor controller runtime must not be imported by the responsive closure."],
    ["file:commands-", "Editor commands runtime must not be imported by the responsive closure."],
    ["file:keyboard-", "Editor keyboard runtime must not be imported by the responsive closure."],
    ["file:persistence", "Persistence runtime must not be imported by the responsive closure."],
    ["file:dashboard", "Dashboard runtime must not be imported by the responsive closure."],
    ["file:dashboard-editor-shell", "Dashboard editor shell must not be imported by the responsive closure."],
    ["file:history", "History runtime must not be imported by the responsive closure."],
    ["content:createGridEditorController", "Editor controller API must not be imported by the responsive closure."],
    ["content:useGridHistoryStore", "History API must not be imported by the responsive closure."],
    ["content:mcp/server", "MCP server code must not be imported by the responsive closure."],
    ["content:node:fs", "Node-only fs code must not be imported by the responsive closure."],
    ["content:node:path", "Node-only path code must not be imported by the responsive closure."],
    ["content:webpack", "Webpack-only code must not be imported by the responsive closure."]
  ],
  "persistence.mjs": [
    ["content:from \"pinia\"", "Pinia must not be imported by the persistence closure."],
    ["content:from 'pinia'", "Pinia must not be imported by the persistence closure."],
    ["file:controller-", "Editor runtime must not be imported by the persistence closure."],
    ["file:commands-", "Editor commands runtime must not be imported by the persistence closure."],
    ["file:keyboard-", "Editor keyboard runtime must not be imported by the persistence closure."],
    ["file:dashboard", "Dashboard runtime must not be imported by the persistence closure."],
    ["file:dashboard-editor-shell", "Dashboard editor shell must not be imported by the persistence closure."],
    ["file:history", "History runtime must not be imported by the persistence closure."],
    ["content:mcp/server", "MCP server code must not be imported by the persistence closure."],
    ["content:node:fs", "Node-only fs code must not be imported by the persistence closure."],
    ["content:node:path", "Node-only path code must not be imported by the persistence closure."],
    ["content:webpack", "Webpack-only code must not be imported by the persistence closure."]
  ],
  "layout-engine.mjs": [
    ["content:from \"pinia\"", "Pinia must not be imported by the layout-engine closure."],
    ["content:from 'pinia'", "Pinia must not be imported by the layout-engine closure."],
    ["file:controller-", "Editor runtime must not be imported by the layout-engine closure."],
    ["file:commands-", "Editor commands runtime must not be imported by the layout-engine closure."],
    ["file:keyboard-", "Editor keyboard runtime must not be imported by the layout-engine closure."],
    ["file:persistence", "Persistence runtime must not be imported by the layout-engine closure."],
    ["file:dashboard", "Dashboard runtime must not be imported by the layout-engine closure."],
    ["file:history", "History runtime must not be imported by the layout-engine closure."],
    ["content:mcp/server", "MCP server code must not be imported by the layout-engine closure."],
    ["content:node:fs", "Node-only fs code must not be imported by the layout-engine closure."],
    ["content:node:path", "Node-only path code must not be imported by the layout-engine closure."],
    ["content:webpack", "Webpack-only code must not be imported by the layout-engine closure."]
  ],
  "history.mjs": [
    ["file:dashboard", "Dashboard runtime must not be imported by the history closure."],
    ["file:dashboard-editor-shell", "Dashboard editor shell must not be imported by the history closure."],
    ["content:mcp/server", "MCP server code must not be imported by the history closure."],
    ["content:node:fs", "Node-only fs code must not be imported by the history closure."],
    ["content:node:path", "Node-only path code must not be imported by the history closure."],
    ["content:webpack", "Webpack-only code must not be imported by the history closure."]
  ]
};

const staticSpecifierPattern =
  /\b(?:import|export)\s+(?:[^'"]*?\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;

const toDistRelativePath = filePath => path.relative(dist, filePath).split(path.sep).join("/");

const resolveDistImport = (fromFile, specifier) => {
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) return null;
  const resolved = path.resolve(path.dirname(fromFile), specifier);
  const candidates = path.extname(resolved)
    ? [resolved]
    : [`${resolved}.mjs`, path.join(resolved, "index.mjs")];
  return candidates.find(candidate => candidate.startsWith(dist) && fs.existsSync(candidate)) || null;
};

const readDistFile = filePath => {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    errors.push(`Unable to read ${toDistRelativePath(filePath)}: ${error.message}`);
    return "";
  }
};

const collectStaticSpecifiers = text => {
  const specifiers = [];
  for (const match of text.matchAll(staticSpecifierPattern)) {
    specifiers.push(match[1] || match[2]);
  }
  return specifiers;
};

const collectClosure = entryFile => {
  const entryPath = path.join(dist, entryFile);
  const seen = new Set();
  const stack = [entryPath];

  if (!fs.existsSync(entryPath)) {
    errors.push(`Missing dist entry for bundle boundary check: ${entryFile}`);
    return [];
  }

  while (stack.length) {
    const filePath = stack.pop();
    if (!filePath || seen.has(filePath)) continue;
    seen.add(filePath);

    const text = readDistFile(filePath);
    const specifiers = collectStaticSpecifiers(text);
    for (const specifier of specifiers) {
      const resolved = resolveDistImport(filePath, specifier);
      if (resolved && !seen.has(resolved)) stack.push(resolved);
    }
  }

  return Array.from(seen).sort((a, b) => toDistRelativePath(a).localeCompare(toDistRelativePath(b)));
};

const measureClosure = files => {
  const contents = files.map(filePath => readDistFile(filePath));
  const text = contents.join("\n");
  return {
    rawBytes: Buffer.byteLength(text),
    gzipBytes: zlib.gzipSync(text).length,
    brotliBytes: zlib.brotliCompressSync(text).length
  };
};

const findForbiddenHits = (entryFile, files) => {
  const policy = forbiddenPolicies[entryFile] || [];
  const hits = [];

  for (const filePath of files) {
    const rel = toDistRelativePath(filePath);
    const text = readDistFile(filePath);
    for (const [rawToken, reason] of policy) {
      const [scope, token] = rawToken.includes(":")
        ? rawToken.split(/:(.*)/s).filter(Boolean)
        : ["any", rawToken];
      const matches = scope === "file"
        ? rel.includes(token)
        : scope === "content"
          ? text.includes(token)
          : rel.includes(token) || text.includes(token);
      if (matches) {
        hits.push({ file: rel, token, reason });
      }
    }
    if (rel.endsWith(".map") || text.includes("sourceMappingURL=")) {
      hits.push({
        file: rel,
        token: "sourcemap",
        reason: "Published runtime closure must not include sourcemap references."
      });
    }
  }

  return hits;
};

const buildReport = entryFile => {
  const files = collectClosure(entryFile);
  const sizes = measureClosure(files);
  return {
    entry: entryFile,
    files: files.map(toDistRelativePath),
    ...sizes,
    forbiddenHits: findForbiddenHits(entryFile, files)
  };
};

const reports = entryFiles.map(buildReport);

for (const report of reports) {
  if (analyze) {
    console.log(`${report.entry}: raw ${report.rawBytes} bytes, gzip ${report.gzipBytes} bytes, brotli ${report.brotliBytes} bytes`);
    console.log(`  files (${report.files.length}):`);
    for (const file of report.files) console.log(`    - ${file}`);
    if (report.forbiddenHits.length) {
      console.log("  forbidden hits:");
      for (const hit of report.forbiddenHits) {
        console.log(`    - ${hit.file}: ${hit.token} (${hit.reason})`);
      }
    }
  }

  for (const hit of report.forbiddenHits) {
    errors.push(`${report.entry} closure contains forbidden token "${hit.token}" in ${hit.file}: ${hit.reason}`);
  }

  const budget = gzipBudgets[report.entry];
  if (budget && report.gzipBytes > budget) {
    errors.push(`${report.entry} closure gzip ${report.gzipBytes} bytes exceeds budget ${budget} bytes.`);
  }
}

if (errors.length && !analyze) {
  console.error(errors.map(error => `- ${error}`).join("\n"));
  process.exit(1);
}

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join("\n"));
  console.log("bundle boundary analyzed with forbidden hits");
} else {
  console.log("bundle boundary verified");
}
