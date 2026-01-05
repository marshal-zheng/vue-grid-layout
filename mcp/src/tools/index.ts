import { registerDocsTool } from './docs.js'
import { registerHeadingsTool } from './headings.js'
import { registerSectionTool } from './section.js'
import { registerSearchTool } from './search.js'
import { registerPropsTool, registerPropTool } from './props.js'
import { registerTypeTool } from './types.js'
import { registerExampleTool } from './examples.js'

export function registerAllTools() {
  registerDocsTool()
  registerHeadingsTool()
  registerSectionTool()
  registerSearchTool()
  registerPropsTool()
  registerPropTool()
  registerTypeTool()
  registerExampleTool()
}
