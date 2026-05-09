#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const root = path.resolve(__dirname, '..')
const projectRoot = path.resolve(root, '..')

const read = (p) => fs.readFileSync(p, 'utf8')

const COMPONENT_CONSTS = {
  VueGridLayout: 'VUE_GRID_LAYOUT_PROPS',
  ResponsiveVueGridLayout: 'RESPONSIVE_VUE_GRID_LAYOUT_PROPS',
  WidthProvider: 'WIDTH_PROVIDER_PROPS',
}

const COMPONENT_SOURCES = {
  VueGridLayout: {
    file: path.join(projectRoot, 'lib/VueGridLayoutPropTypes.ts'),
    marker: 'export const basicProps',
  },
  ResponsiveVueGridLayout: {
    file: path.join(projectRoot, 'lib/ResponsiveVueGridLayout.tsx'),
    marker: 'props:',
  },
  WidthProvider: {
    file: path.join(projectRoot, 'lib/WidthProvider.tsx'),
    marker: 'props:',
  },
}

function extractKeysFromObjectLiteral(content, marker) {
  const start = content.indexOf(marker)
  if (start === -1) throw new Error(`marker not found: ${marker}`)

  const braceStart = content.indexOf('{', start)
  if (braceStart === -1) throw new Error(`no object after: ${marker}`)

  let depth = 0
  let end = braceStart
  for (let i = braceStart; i < content.length; i++) {
    const ch = content[i]
    if (ch === '{') depth++
    else if (ch === '}') depth--
    if (depth === 0) { end = i; break }
  }
  const body = content.slice(braceStart + 1, end)

  const keys = []
  let level = 0
  for (const line of body.split(/\r?\n/)) {
    const opens = (line.match(/\{/g) || []).length
    const closes = (line.match(/\}/g) || []).length
    if (level === 0) {
      const m = line.match(/^\s*([A-Za-z0-9_]+):/)
      if (m && !line.includes('...')) keys.push(m[1])
    }
    level += opens - closes
  }
  return keys
}

function extractGeneratedArray(generated, exportName) {
  const marker = `export const ${exportName}`
  const start = generated.indexOf(marker)
  if (start === -1) throw new Error(`marker not found in props.generated.ts: ${marker}`)

  const assign = generated.indexOf('=', start)
  if (assign === -1) throw new Error(`assignment not found for: ${exportName}`)

  const arrayStart = generated.indexOf('[', assign)
  if (arrayStart === -1) throw new Error(`array start not found for: ${exportName}`)

  let depth = 0
  let inString = false
  let escaped = false
  let end = -1
  for (let i = arrayStart; i < generated.length; i++) {
    const ch = generated[i]
    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === '"') inString = false
      continue
    }

    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '[') depth++
    else if (ch === ']') depth--
    if (depth === 0) {
      end = i
      break
    }
  }
  if (end === -1) throw new Error(`array end not found for: ${exportName}`)

  const jsonText = generated.slice(arrayStart, end + 1)
  return JSON.parse(jsonText)
}

function printSetDiff(label, expected, actual) {
  const missing = [...expected].filter((k) => !actual.has(k)).sort()
  const extra = [...actual].filter((k) => !expected.has(k)).sort()
  if (missing.length || extra.length) {
    console.error(`❌ ${label} 不一致`)
    if (missing.length) console.error(`   缺少: ${missing.join(', ')}`)
    if (extra.length) console.error(`   多余: ${extra.join(', ')}`)
    return false
  }
  return true
}

let ok = true

try {
  const generatedPath = path.join(root, 'src/props.generated.ts')
  if (!fs.existsSync(generatedPath)) {
    console.error('❌ 未找到 src/props.generated.ts，请先运行 `yarn generate:props`')
    process.exit(1)
  }
  const generated = read(generatedPath)

  for (const [component, constName] of Object.entries(COMPONENT_CONSTS)) {
    const source = COMPONENT_SOURCES[component]
    if (!source) {
      console.error(`❌ 缺少源码映射: ${component}`)
      ok = false
      continue
    }
    const sourceKeys = new Set(extractKeysFromObjectLiteral(read(source.file), source.marker))
    const arr = extractGeneratedArray(generated, constName)
    const generatedKeys = new Set(arr.map((p) => p.name))
    if (!printSetDiff(`${component} props 生成数据`, sourceKeys, generatedKeys)) ok = false

    const duplicateNames = arr
      .map((p) => p.name)
      .filter((name, index, names) => names.indexOf(name) !== index)
      .sort()
    if (duplicateNames.length) {
      console.error(`❌ ${component} props 有重复项: ${[...new Set(duplicateNames)].join(', ')}`)
      ok = false
    }

    const missingDescriptions = arr
      .filter((p) => !p.description)
      .map((p) => p.name)
      .sort()
    if (missingDescriptions.length) {
      console.error(`❌ ${component} props 缺少 JSDoc 描述: ${missingDescriptions.join(', ')}`)
      ok = false
    }
  }
} catch (error) {
  ok = false
  console.error('❌ 校验失败:', error)
}

if (!ok) process.exit(1)

console.log('✅ 数据一致')
