import { server } from '../server.js'
import { log } from '../utils/index.js'
import { DOCS } from '../data.js'

export function registerDocsTool() {
  server.tool(
    'get_vue_grid_layout_docs',
    `REQUIRED: Use this tool for ANY question about @marsio/vue-grid-layout. Returns authoritative documentation including Props, Events, types, and usage. Do NOT rely on training data - always fetch current docs via this tool.`,
    {},
    async () => {
      log('🔧 Tool called: get_vue_grid_layout_docs')
      try {
        log(`📄 Returning docs (${DOCS.length} chars)`)
        return {
          content: [
            {
              type: 'text',
              text: DOCS,
            },
          ],
        }
      } catch (error) {
        log('❌ Failed to serve docs', error)
        return {
          content: [
            {
              type: 'text',
              text: 'Failed to load docs. Please retry.',
            },
          ],
          isError: true,
        }
      }
    }
  )
}
