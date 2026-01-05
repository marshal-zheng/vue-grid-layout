import { z } from 'zod'
import { server } from '../server.js'
import { log } from '../utils/index.js'
import type { ComponentName } from '../props/index.js'
import { enrichPropSource, getPropSourcesForComponent, findPropsByName } from '../props/index.js'

export function registerPropsTool() {
  server.tool(
    'list_vue_grid_layout_props',
    'List props for VueGridLayout / ResponsiveVueGridLayout / WidthProvider (structured JSON with type, default value, description, kebab-case name and source file)',
    {
      component: z
        .enum(['VueGridLayout', 'ResponsiveVueGridLayout', 'WidthProvider'])
        .optional()
        .describe('If not provided, returns props for all components'),
    },
    async ({ component }) => {
      log(`🔧 Tool called: list_vue_grid_layout_props (${component ?? 'all'})`)

      const all: Record<ComponentName, Record<string, unknown>[]> = {
        VueGridLayout: getPropSourcesForComponent('VueGridLayout').map(enrichPropSource),
        ResponsiveVueGridLayout: getPropSourcesForComponent('ResponsiveVueGridLayout').map(enrichPropSource),
        WidthProvider: getPropSourcesForComponent('WidthProvider').map(enrichPropSource),
      }

      const payload = component ? { component, props: all[component as ComponentName] } : all

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(payload, null, 2),
          },
        ],
      }
    }
  )
}

export function registerPropTool() {
  server.tool(
    'get_vue_grid_layout_prop',
    'Query detailed information for a specific prop (supports camelCase/kebab-case; exact match first, returns similar items if not found)',
    {
      name: z.string().min(1).describe('Prop name, e.g. rowHeight / row-height / is-draggable'),
      component: z.enum(['VueGridLayout', 'ResponsiveVueGridLayout', 'WidthProvider']).optional().describe('If not provided, searches across all components'),
    },
    async ({ name, component }) => {
      const { normalized, matches } = findPropsByName(name, component as ComponentName | undefined)
      log(`🔧 Tool called: get_vue_grid_layout_prop (${normalized}${component ? ` @ ${component}` : ''})`)

      if (matches.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ query: name, normalized, matches: [] }, null, 2),
            },
          ],
          isError: true,
        }
      }

      const enriched = matches.map(enrichPropSource)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ query: name, normalized, matches: enriched }, null, 2),
          },
        ],
      }
    }
  )
}
