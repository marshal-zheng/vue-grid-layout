#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const root = path.resolve(__dirname, '..')
const projectRoot = path.resolve(root, '..')

const INPUT_FILES = {
  gridProps: path.join(projectRoot, 'lib/VueGridLayoutPropTypes.ts'),
  responsive: path.join(projectRoot, 'lib/ResponsiveVueGridLayout.tsx'),
  widthProvider: path.join(projectRoot, 'lib/WidthProvider.tsx'),
  typings: path.join(projectRoot, 'typings/index.d.ts'),
}

const COMPONENTS = [
  { name: 'VueGridLayout', kind: 'namedObject', objectName: 'basicProps', file: INPUT_FILES.gridProps },
  { name: 'ResponsiveVueGridLayout', kind: 'defineComponent', file: INPUT_FILES.responsive },
  { name: 'WidthProvider', kind: 'defineComponent', file: INPUT_FILES.widthProvider },
]

const TYPE_TARGETS = [
  'CompactType',
  'ResizeHandleAxis',
  'VueRef',
  'ResizeHandle',
  'LayoutItem',
  'Layout',
  'AutoScrollOptions',
  'VueGridLayoutProps',
  'ResponsiveProps',
  'WidthProviderProps',
  'GridHistorySnapshot',
  'GridHistoryState',
  'GridHistoryGetters',
  'GridHistoryActions',
  'GridHistoryStore',
  'GridHistoryOptions',
  'KeyboardShortcutOptions',
  'ItemCallback',
]

const OUTPUT_FILE = path.join(root, 'src/props.generated.ts')
const OUTPUT_TYPES_FILE = path.join(root, 'src/types.generated.ts')

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function compact(text) {
  return text.replace(/\s+/g, ' ').trim()
}

function parseSourceFile(filePath) {
  const kind = filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  return ts.createSourceFile(filePath, read(filePath), ts.ScriptTarget.Latest, true, kind)
}

function getPropName(nameNode) {
  if (ts.isIdentifier(nameNode)) return nameNode.text
  if (ts.isStringLiteral(nameNode)) return nameNode.text
  return null
}

function buildVarDecls(sourceFiles) {
  const decls = new Map()
  for (const sourceFile of sourceFiles) {
    for (const statement of sourceFile.statements) {
      if (!ts.isVariableStatement(statement)) continue
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue
        if (!declaration.initializer) continue
        if (!ts.isObjectLiteralExpression(declaration.initializer)) continue
        decls.set(declaration.name.text, { sourceFile, objectLiteral: declaration.initializer })
      }
    }
  }
  return decls
}

function resolveObjectLiteral(expr, varDecls) {
  if (!expr) return null
  if (ts.isObjectLiteralExpression(expr)) return expr
  if (ts.isIdentifier(expr)) {
    const decl = varDecls.get(expr.text)
    if (decl) return decl.objectLiteral
  }
  return null
}

function extractRuntimeTypes(typeExpr, sourceFile) {
  if (!typeExpr) return []
  let expr = typeExpr
  if (ts.isAsExpression(expr) || ts.isTypeAssertionExpression(expr)) expr = expr.expression

  if (ts.isIdentifier(expr)) return [expr.text]
  if (ts.isArrayLiteralExpression(expr)) {
    const types = []
    for (const el of expr.elements) {
      if (ts.isIdentifier(el)) types.push(el.text)
      else types.push(compact(el.getText(sourceFile)))
    }
    return types
  }
  return [compact(expr.getText(sourceFile))]
}

function extractTsType(typeExpr, sourceFile) {
  if (!typeExpr) return null

  const asExpr = ts.isAsExpression(typeExpr) || ts.isTypeAssertionExpression(typeExpr) ? typeExpr : null
  if (asExpr) {
    const typeNode = asExpr.type
    if (ts.isTypeReferenceNode(typeNode)) {
      const typeName =
        ts.isIdentifier(typeNode.typeName) ? typeNode.typeName.text : compact(typeNode.typeName.getText(sourceFile))
      if (typeName === 'PropType' && typeNode.typeArguments?.length === 1) {
        return compact(typeNode.typeArguments[0].getText(sourceFile))
      }
    }
  }

  const runtimeTypes = extractRuntimeTypes(typeExpr, sourceFile)
  if (runtimeTypes.length === 1) {
    switch (runtimeTypes[0]) {
      case 'Boolean':
        return 'boolean'
      case 'String':
        return 'string'
      case 'Number':
        return 'number'
      case 'Array':
        return 'unknown[]'
      case 'Object':
        return 'unknown'
      case 'Function':
        return 'Function'
      default:
        return null
    }
  }
  return null
}

function extractBooleanLiteral(expr) {
  if (!expr) return null
  if (expr.kind === ts.SyntaxKind.TrueKeyword) return true
  if (expr.kind === ts.SyntaxKind.FalseKeyword) return false
  return null
}

function parsePropConfig(configObject) {
  const sourceFile = configObject.getSourceFile()
  let typeExpr = null
  let defaultExpr = null
  let requiredExpr = null
  let validatorExpr = null

  for (const prop of configObject.properties) {
    if (!ts.isPropertyAssignment(prop)) continue
    const key = getPropName(prop.name)
    if (!key) continue
    if (key === 'type') typeExpr = prop.initializer
    else if (key === 'default') defaultExpr = prop.initializer
    else if (key === 'required') requiredExpr = prop.initializer
    else if (key === 'validator') validatorExpr = prop.initializer
  }

  const runtimeTypes = extractRuntimeTypes(typeExpr, sourceFile)
  const tsType = extractTsType(typeExpr, sourceFile)
  const defaultText = defaultExpr ? compact(defaultExpr.getText(sourceFile)) : null
  const defaultIsFactory = !!defaultExpr && (ts.isArrowFunction(defaultExpr) || ts.isFunctionExpression(defaultExpr))
  const required = extractBooleanLiteral(requiredExpr)
  const validator = validatorExpr ? compact(validatorExpr.getText(sourceFile)) : null

  return {
    vueRuntimeTypes: runtimeTypes,
    tsType,
    default: defaultText,
    hasDefault: !!defaultExpr,
    defaultIsFactory,
    required,
    validator,
    sourceType: typeExpr ? compact(typeExpr.getText(sourceFile)) : null,
  }
}

function evaluatePropsFromObject(componentName, definedIn, objectLiteral, varDecls) {
  const props = []

  for (const prop of objectLiteral.properties) {
    if (ts.isSpreadAssignment(prop)) {
      const spreadObj = resolveObjectLiteral(prop.expression, varDecls)
      if (!spreadObj) {
        throw new Error(`Unsupported spread in ${componentName}: ${compact(prop.expression.getText(objectLiteral.getSourceFile()))}`)
      }
      props.push(...evaluatePropsFromObject(componentName, definedIn, spreadObj, varDecls))
      continue
    }

    if (!ts.isPropertyAssignment(prop)) continue
    const name = getPropName(prop.name)
    if (!name) continue

    const configObj = resolveObjectLiteral(prop.initializer, varDecls)
    if (!configObj || !ts.isObjectLiteralExpression(configObj)) continue

    props.push({
      name,
      component: componentName,
      definedIn,
      ...parsePropConfig(configObj),
      source: { file: path.relative(projectRoot, configObj.getSourceFile().fileName) },
    })
  }

  return props
}

function findObjectInitializer(sourceFile, varName) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) continue
      if (declaration.name.text !== varName) continue
      if (!declaration.initializer) continue
      if (!ts.isObjectLiteralExpression(declaration.initializer)) continue
      return declaration.initializer
    }
  }
  return null
}

function findDefineComponentPropsObject(sourceFile, varDecls) {
  let found = null

  const visit = (node) => {
    if (found) return
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'defineComponent') {
      const arg = node.arguments[0]
      if (arg && ts.isObjectLiteralExpression(arg)) {
        for (const prop of arg.properties) {
          if (!ts.isPropertyAssignment(prop)) continue
          if (getPropName(prop.name) !== 'props') continue
          const propsObj = resolveObjectLiteral(prop.initializer, varDecls)
          if (propsObj && ts.isObjectLiteralExpression(propsObj)) {
            found = propsObj
            return
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return found
}

function collectPropsForComponent(component, sourceFile, varDecls) {
  if (component.kind === 'namedObject') {
    const objectLiteral = findObjectInitializer(sourceFile, component.objectName)
    if (!objectLiteral) throw new Error(`Object ${component.objectName} not found in ${sourceFile.fileName}`)
    return evaluatePropsFromObject(component.name, component.objectName, objectLiteral, varDecls)
  }

  const propsObject = findDefineComponentPropsObject(sourceFile, varDecls)
  if (!propsObject) throw new Error(`defineComponent props not found in ${sourceFile.fileName}`)
  return evaluatePropsFromObject(component.name, 'defineComponent.props', propsObject, varDecls)
}

function findTypeLikeDeclaration(sourceFile, typeName) {
  const search = (statements) => {
    for (const statement of statements) {
      if (ts.isTypeAliasDeclaration(statement) && statement.name.text === typeName) return statement
      if (ts.isInterfaceDeclaration(statement) && statement.name.text === typeName) return statement
      if (ts.isModuleDeclaration(statement) && statement.body && ts.isModuleBlock(statement.body)) {
        const found = search(statement.body.statements)
        if (found) return found
      }
    }
    return null
  }

  return search(sourceFile.statements)
}

function main() {
  const gridPropsFile = parseSourceFile(INPUT_FILES.gridProps)
  const responsiveFile = parseSourceFile(INPUT_FILES.responsive)
  const widthProviderFile = parseSourceFile(INPUT_FILES.widthProvider)
  const typingsFile = parseSourceFile(INPUT_FILES.typings)

  const varDecls = buildVarDecls([gridPropsFile, responsiveFile, widthProviderFile])

  const props = []
  for (const component of COMPONENTS) {
    const sourceFile = component.file === INPUT_FILES.gridProps
      ? gridPropsFile
      : component.file === INPUT_FILES.responsive
        ? responsiveFile
        : widthProviderFile
    props.push(...collectPropsForComponent(component, sourceFile, varDecls))
  }

  const header = `/*\n * This file is generated by scripts/generate-props.js.\n * Do not edit manually.\n */\n\n`
  const types = `export type VueGridLayoutProp = {\n  name: string\n  component: 'VueGridLayout' | 'ResponsiveVueGridLayout' | 'WidthProvider'\n  definedIn: string\n  vueRuntimeTypes: string[]\n  tsType: string | null\n  sourceType: string | null\n  default: string | null\n  hasDefault: boolean\n  defaultIsFactory: boolean\n  required: boolean | null\n  validator: string | null\n  source: { file: string }\n}\n\n`

  const CONST_NAMES = {
    VueGridLayout: 'VUE_GRID_LAYOUT_PROPS',
    ResponsiveVueGridLayout: 'RESPONSIVE_VUE_GRID_LAYOUT_PROPS',
    WidthProvider: 'WIDTH_PROVIDER_PROPS',
  }

  const propsBodyLines = COMPONENTS.map((component) => {
    const data = props.filter((p) => p.component === component.name)
    const constName = CONST_NAMES[component.name]
    return `export const ${constName}: VueGridLayoutProp[] = ${JSON.stringify(data, null, 2)}`
  })

  const body = propsBodyLines.join('\n\n') + '\n'
  fs.writeFileSync(OUTPUT_FILE, header + types + body, 'utf8')
  console.log(`✅ Generated ${path.relative(root, OUTPUT_FILE)} (${props.length} props across ${COMPONENTS.length} components)`,)

  const typeDefs = {}
  for (const name of TYPE_TARGETS) {
    const node = findTypeLikeDeclaration(typingsFile, name)
    if (!node) throw new Error(`Type not found: ${name} (in ${typingsFile.fileName})`)
    typeDefs[name] = node.getText(typingsFile).trim()
  }

  const typesHeader = `/*\n * This file is generated by scripts/generate-props.js.\n * Do not edit manually.\n */\n\n`
  const typesBody = `export const VUE_GRID_LAYOUT_TYPE_DEFS = ${JSON.stringify(typeDefs, null, 2)} as const\n\nexport type VueGridLayoutTypeName = keyof typeof VUE_GRID_LAYOUT_TYPE_DEFS\n`

  fs.writeFileSync(OUTPUT_TYPES_FILE, typesHeader + typesBody, 'utf8')
  console.log(`✅ Generated ${path.relative(root, OUTPUT_TYPES_FILE)} (${Object.keys(typeDefs).length} types)`)
}

main()
