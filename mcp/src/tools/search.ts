import { z } from 'zod'
import { server } from '../server.js'
import { log } from '../utils/index.js'
import { docsIndex } from './headings.js'

export function registerSearchTool() {
  server.tool(
    'search_vue_grid_layout_docs',
    'Full-text search in documentation (returns matching snippets + heading path), for quickly locating API/Props/Events/example sections',
    {
      query: z.string().min(1).describe('Search keyword'),
      maxResults: z.number().int().min(1).max(50).optional().describe('Maximum number of results, default 5'),
      contextLines: z.number().int().min(0).max(20).optional().describe('Context lines per result, default 2'),
    },
    async ({ query, maxResults, contextLines }) => {
      const q = query.trim()
      log(`🔧 Tool called: search_vue_grid_layout_docs (${q})`)
      const result = docsIndex.search(q, { maxResults, contextLines })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    }
  )
}
