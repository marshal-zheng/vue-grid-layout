# @marsio/vue-grid-layout-mcp

`@marsio/vue-grid-layout` 的 MCP 服务器，给 AI IDE 提供组件文档、属性结构化数据、类型定义和场景示例。

> 数据来源：直接基于仓库 `lib/VueGridLayout*.tsx` 的 props 定义和 `typings/index.d.ts` 类型声明。

## 工具

| 工具 | 描述 | 参数 |
|------|------|------|
| `get_vue_grid_layout_docs` | 返回完整文档（Markdown），包含 API、Props、Events、类型和示例 | 无 |
| `list_vue_grid_layout_doc_headings` | 列出文档标题层级（JSON） | 无 |
| `get_vue_grid_layout_doc_section` | 按标题/路径获取文档章节（Markdown） | `heading`: 章节标题或路径 |
| `search_vue_grid_layout_docs` | 文档全文搜索（JSON，含标题路径与片段） | `query`: 关键字；`maxResults?`；`contextLines?` |
| `list_vue_grid_layout_props` | 列出组件 props 的结构化信息（JSON，含描述与 kebab-case 名；ResponsiveVueGridLayout 会标记 `forwardedViaAttrs`） | `component?`: VueGridLayout / ResponsiveVueGridLayout / WidthProvider |
| `get_vue_grid_layout_prop` | 查询某个 prop 的详细信息（JSON，支持 camelCase/kebab-case；可能返回 `forwardedViaAttrs` 结果） | `name`: prop 名；`component?` |
| `get_vue_grid_layout_type` | 获取 TypeScript 类型定义 | `name`: Layout / LayoutItem / CompactType 等 |
| `get_vue_grid_layout_example` | 获取典型场景的代码示例（优先读取仓库 `example/` 目录，返回 `example/index.html` + 对应 demo；不在仓库内时回退到内置示例） | `scenario`: basic / responsive / drag-from-outside |

## 使用

### Cursor / Claude Desktop 配置

```json
{
  "mcpServers": {
    "vue-grid-layout": {
      "command": "npx",
      "args": ["@marsio/vue-grid-layout-mcp"]
    }
  }
}
```

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VGL_MCP_PREFER_REPO_EXAMPLE` | 是否优先读取仓库 `example/` 目录（`true`/`1` 启用，`false`/`0` 禁用，始终使用内置示例） | `true` |

```json
{
  "mcpServers": {
    "vue-grid-layout": {
      "command": "npx",
      "args": ["@marsio/vue-grid-layout-mcp"],
      "env": {
        "VGL_MCP_PREFER_REPO_EXAMPLE": "false"
      }
    }
  }
}
```

### 本地开发

```bash
cd mcp
yarn install
yarn build
node dist/index.js
```

## 调试

```bash
# 列出工具
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js

# 获取完整文档
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_vue_grid_layout_docs","arguments":{}}}' | node dist/index.js

# 列出 props（结构化）
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_vue_grid_layout_props","arguments":{"component":"VueGridLayout"}}}' | node dist/index.js

# 列出文档标题
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"list_vue_grid_layout_doc_headings","arguments":{}}}' | node dist/index.js

# 搜索文档
echo '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"search_vue_grid_layout_docs","arguments":{"query":"dropStrategy","maxResults":5,"contextLines":2}}}' | node dist/index.js

# 获取文档章节
echo '{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"get_vue_grid_layout_doc_section","arguments":{"heading":"VueGridLayout > 事件"}}}' | node dist/index.js

# 查询 prop
echo '{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"get_vue_grid_layout_prop","arguments":{"name":"row-height"}}}' | node dist/index.js

# 获取类型定义
echo '{"jsonrpc":"2.0","id":8,"method":"tools/call","params":{"name":"get_vue_grid_layout_type","arguments":{"name":"LayoutItem"}}}' | node dist/index.js

# 获取场景示例
echo '{"jsonrpc":"2.0","id":9,"method":"tools/call","params":{"name":"get_vue_grid_layout_example","arguments":{"scenario":"drag-from-outside"}}}' | node dist/index.js
```

## 发布

```bash
yarn build && npm publish
```
