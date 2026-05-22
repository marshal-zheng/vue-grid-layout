import { execFileSync } from "node:child_process";

execFileSync("npm", ["run", "release:quality"], { stdio: "inherit" });
console.log("Release quality passed. Run your version/tag workflow from a clean release branch.");
