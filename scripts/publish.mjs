import { execFileSync } from "node:child_process";

execFileSync("npm", ["run", "release:quality"], { stdio: "inherit" });
execFileSync("npm", ["publish"], { stdio: "inherit" });
