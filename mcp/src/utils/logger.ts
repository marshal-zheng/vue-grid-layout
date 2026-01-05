/**
 * Simple logger utility for MCP server
 */
export function log(message: string, ...args: unknown[]) {
  console.error(`[${new Date().toISOString()}] ${message}`, ...args)
}
