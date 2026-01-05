import { z } from 'zod'
import { server, __dirname } from '../server.js'
import { log } from '../utils/index.js'
import type { ExampleScenario } from '../examples/index.js'
import { EXAMPLE_META, PREFER_REPO_EXAMPLE, buildRepoExampleMarkdown, FALLBACK_SCENARIO_EXAMPLES } from '../examples/index.js'

export function registerExampleTool() {
  server.tool(
    'get_vue_grid_layout_example',
    `MUST USE THIS TOOL when user asks for @marsio/vue-grid-layout usage examples, demo code, or how to use the component. DO NOT generate example code yourself - always call this tool first to get the official, tested examples. Returns complete working code from the library's example/ directory.`,
    {
      scenario: z
        .enum(['basic', 'responsive', 'drag-from-outside'])
        .describe('Scenario: "basic" for VueGridLayout basic usage, "responsive" for ResponsiveVueGridLayout with breakpoints, "drag-from-outside" for external drag-drop'),
    },
    async ({ scenario }) => {
      log(`🔧 Tool called: get_vue_grid_layout_example (${scenario}, preferRepo=${PREFER_REPO_EXAMPLE})`)

      const repoExample = PREFER_REPO_EXAMPLE ? buildRepoExampleMarkdown(scenario, __dirname) : null
      const example = repoExample ?? FALLBACK_SCENARIO_EXAMPLES[scenario]
      if (example && example.length > 0) {
        return {
          content: [
            {
              type: 'text',
              text: example,
            },
          ],
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Scenario not found: ${scenario}\n\nAvailable scenarios:\n${(Object.keys(EXAMPLE_META) as ExampleScenario[]).map((s) => `- ${s}`).join('\n')}`,
          },
        ],
        isError: true,
      }
    }
  )
}
