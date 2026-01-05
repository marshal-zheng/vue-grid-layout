import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)

const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8')) as { version?: string }
export const serverVersion = pkg.version ?? '0.0.0'

// 创建 MCP Server
export const server = new McpServer({
  name: 'vue-grid-layout',
  version: serverVersion,
})
