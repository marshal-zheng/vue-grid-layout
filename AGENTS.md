# AGENTS.md

## Scope

These instructions apply to the whole repository.
If a nested `AGENTS.md` appears in a subtree, read it before editing files there.

## Local Workflow Constraints

- 不要使用会抢焦点的 Computer Use、in-app browser、GUI browser automation、`open`、AppleScript 或等价操作，除非用户在当前消息中明确要求。
- 不要打开、切换、刷新或聚焦浏览器窗口；这会打断用户本地工作。
- 需要验证前端行为时，优先使用现有 CLI/headless 测试命令。
- 如果确实必须做会抢焦点的浏览器验证，先说明原因并等待用户确认。
- 不要运行破坏性命令，例如 `git reset --hard`、`git checkout --` 或 `rm -rf`，除非用户明确要求。
- 不要读取、打印或修改 secrets、private keys、tokens 或 `.env*` 文件，除非任务明确需要。

## Common Verification Commands

These package scripts are repo-wide by design. No narrower command exists for the standard verification set; do not invent narrower commands unless a task already has a known script.

- `npm run build`
- `npm test`
- `npm run test:browser`
- `npm run test:examples`
- `npm run check:package`
- `npm run check:bundle`
