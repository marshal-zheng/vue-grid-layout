import { z } from 'zod'
import { server } from '../server.js'
import { log } from '../utils/index.js'
import { VUE_GRID_LAYOUT_TYPE_DEFS } from '../types.generated.js'

export function registerTypeTool() {
  server.tool(
    'get_vue_grid_layout_type',
    'Get TypeScript type definition (Layout / LayoutItem / CompactType / ItemCallback, etc.)',
    {
      name: z.string().min(1).describe('Type name, e.g.: Layout / LayoutItem / CompactType / VueGridLayoutProps'),
    },
    async ({ name }) => {
      const typeName = name.trim()
      log(`🔧 Tool called: get_vue_grid_layout_type (${typeName})`)

      if (Object.prototype.hasOwnProperty.call(VUE_GRID_LAYOUT_TYPE_DEFS, typeName)) {
        const def = VUE_GRID_LAYOUT_TYPE_DEFS[typeName as keyof typeof VUE_GRID_LAYOUT_TYPE_DEFS]
        return {
          content: [
            {
              type: 'text',
              text: def,
            },
          ],
        }
      }

      const allNames = Object.keys(VUE_GRID_LAYOUT_TYPE_DEFS)
      const q = typeName.toLowerCase()
      const suggestions = allNames.filter((n) => n.toLowerCase().includes(q)).slice(0, 10)

      return {
        content: [
          {
            type: 'text',
            text:
              suggestions.length > 0
                ? `Type not found: ${typeName}\n\nAvailable types:\n${allNames.map((s) => `- ${s}`).join('\n')}\n\nDid you mean:\n${suggestions.map((s) => `- ${s}`).join('\n')}`
                : `Type not found: ${typeName}\n\nAvailable types:\n${allNames.map((s) => `- ${s}`).join('\n')}`,
          },
        ],
        isError: true,
      }
    }
  )
}
