import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const run = (label, command, args, cwd = root) => {
  console.log(`\n== ${label} ==`);
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_fund: "false"
    }
  });
};

run("build", npm, ["run", "build"]);
run("unit tests", npm, ["test"]);
run("browser smoke", npm, ["run", "test:browser"]);
run("package matrix", npm, ["run", "test:package"]);
run("docs build", npm, ["run", "build-docs"]);
run("README/MCP/example imports", npm, ["run", "test:examples"]);
run("package artifact", npm, ["run", "check:package"]);
run("bundle boundary", npm, ["run", "check:bundle"]);
run("layout benchmark", npm, ["run", "bench:layout-engine"]);
run("MCP build", "yarn", ["build"], path.join(root, "mcp"));
run("MCP data", "yarn", ["check:data"], path.join(root, "mcp"));
run("MCP smoke", "yarn", ["test:mcp"], path.join(root, "mcp"));

console.log("\nrelease quality gate verified");
