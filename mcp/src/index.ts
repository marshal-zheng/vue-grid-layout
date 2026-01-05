#!/usr/bin/env node
/**
 * @marsio/vue-grid-layout MCP Server
 * Provides grid layout component documentation for AI IDE queries
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { server, serverVersion } from './server.js'
import { registerAllTools } from './tools/index.js'

// 注册所有工具
registerAllTools()

// 启动 STDIO 传输
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error(`vue-grid-layout MCP server started (v${serverVersion})`)
}

main().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
