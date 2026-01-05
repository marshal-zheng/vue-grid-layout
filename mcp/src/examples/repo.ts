import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ExampleScenario } from './types.js'
import { EXAMPLE_META } from './meta.js'

/**
 * Environment variable switch: whether to prefer reading from repository example/ directory
 * - 'true' / '1': prefer reading from repository (default)
 * - 'false' / '0': always use built-in examples (FALLBACK_SCENARIO_EXAMPLES)
 */
export const PREFER_REPO_EXAMPLE = !['false', '0'].includes(
  (process.env.VGL_MCP_PREFER_REPO_EXAMPLE ?? 'false').toLowerCase()
)

export function findRepoRoot(startDir: string): string | null {
  // 本仓库结构：<repo>/mcp/dist/index.js => repoRoot = ../../
  const candidate = join(startDir, '../..')

  const exampleIndex = join(candidate, 'example/index.html')
  const cssStyles = join(candidate, 'css/styles.css')
  if (existsSync(exampleIndex) && existsSync(cssStyles)) return candidate
  return null
}

export function buildRepoExampleMarkdown(scenario: ExampleScenario, dirname: string): string | null {
  const repoRoot = findRepoRoot(dirname)
  if (!repoRoot) return null

  const meta = EXAMPLE_META[scenario]
  const indexHtmlPath = join(repoRoot, 'example/index.html')
  const demoPath = join(repoRoot, 'example', meta.sourceFile)

  if (!existsSync(indexHtmlPath) || !existsSync(demoPath)) return null

  try {
    const indexHtml = readFileSync(indexHtmlPath, 'utf8')
    const demoJs = readFileSync(demoPath, 'utf8')

    return `## ${meta.title}

运行方式（无需改代码）：打开 example/index.html?demo=${meta.demo}

> 入口已引入 ../css/styles.css，并在 example/index.html 内联了 demo 可视化样式。

### example/index.html

~~~html
${indexHtml}
~~~

### example/${meta.sourceFile}

~~~js
${demoJs}
~~~
`
  } catch {
    return null
  }
}
