import { z } from 'zod'
import { server } from '../server.js'
import { log } from '../utils/index.js'
import { docsIndex } from './headings.js'

export function registerSectionTool() {
  server.tool(
    'get_vue_grid_layout_doc_section',
    'Get document section by heading/path (supports fuzzy matching; prefer this when get_vue_grid_layout_docs is too long)',
    {
      heading: z.string().min(1).describe('Section heading or path, e.g.: VueGridLayout > Props / Type Definitions'),
    },
    async ({ heading }) => {
      const query = heading.trim()
      log(`🔧 Tool called: get_vue_grid_layout_doc_section (${query})`)
      const result = docsIndex.getSectionText(query)

      if (result.text) {
        return {
          content: [
            {
              type: 'text',
              text: result.text,
            },
          ],
        }
      }

      const matches = result.matches ?? []
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ query, matches }, null, 2),
          },
        ],
        isError: true,
      }
    }
  )
}
