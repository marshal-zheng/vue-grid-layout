import { server } from '../server.js'
import { log } from '../utils/index.js'
import { createDocsIndex } from '../docsIndex.js'
import { DOCS } from '../data.js'

const docsIndex = createDocsIndex(DOCS)

export { docsIndex }

export function registerHeadingsTool() {
  server.tool(
    'list_vue_grid_layout_doc_headings',
    'List document heading hierarchy (for quick section navigation, then use get_vue_grid_layout_doc_section to get corresponding content)',
    {},
    async () => {
      log('🔧 Tool called: list_vue_grid_layout_doc_headings')
      const headings = docsIndex.listHeadings()
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(headings, null, 2),
          },
        ],
      }
    }
  )
}
