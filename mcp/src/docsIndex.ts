export type HeadingSummary = {
  level: number
  title: string
  path: string
}

export type SearchMatch = {
  line: number
  headingPath: string
  snippet: string
}

export type SearchResult = {
  totalMatches: number
  matches: SearchMatch[]
  truncated: boolean
}

function normalizeHeading(input: string): string {
  return input
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[：:]/g, '')
    .replace(/[，。！？、]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

type HeadingInternal = HeadingSummary & {
  line: number
  normalizedTitle: string
  normalizedPath: string
}

type SectionInternal = {
  heading: HeadingInternal
  startLine: number
  endLine: number // exclusive
}

export function createDocsIndex(docs: string): {
  listHeadings: () => HeadingSummary[]
  getSectionText: (headingQuery: string) => { text?: string; matches?: HeadingSummary[] }
  search: (
    query: string,
    options?: { maxResults?: number; contextLines?: number }
  ) => SearchResult
} {
  const lines = docs.split(/\r?\n/)
  const headings: HeadingInternal[] = []
  const stack: Array<{ level: number; title: string; normalizedTitle: string }> = []
  const pathAtLine: string[] = new Array(lines.length).fill('')
  let inCodeFence = false
  let codeFenceToken: '```' | '~~~' | null = null

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]

    const fenceMatch = line.match(/^\s*(```|~~~)/)
    if (fenceMatch) {
      const token = fenceMatch[1] as '```' | '~~~'
      if (!inCodeFence) {
        inCodeFence = true
        codeFenceToken = token
      } else if (codeFenceToken === token) {
        inCodeFence = false
        codeFenceToken = null
      }
    }

    const match = line.match(/^(#{1,6})\s+(.*)$/)
    if (match && !inCodeFence) {
      const level = match[1].length
      const title = match[2].trim()
      const normalizedTitle = normalizeHeading(title)

      while (stack.length && stack[stack.length - 1].level >= level) stack.pop()
      stack.push({ level, title, normalizedTitle })

      const path = stack.map((h) => h.title).join(' > ')
      const normalizedPath = stack.map((h) => h.normalizedTitle).join(' > ')
      headings.push({ level, title, path, line: lineIndex, normalizedTitle, normalizedPath })
    }
    pathAtLine[lineIndex] = stack.map((h) => h.title).join(' > ')
  }

  const sections: SectionInternal[] = headings.map((heading, index) => {
    let endLine = lines.length
    for (let nextIndex = index + 1; nextIndex < headings.length; nextIndex++) {
      if (headings[nextIndex].level <= heading.level) {
        endLine = headings[nextIndex].line
        break
      }
    }
    return { heading, startLine: heading.line, endLine }
  })

  function listHeadings(): HeadingSummary[] {
    return headings.map(({ level, title, path }) => ({ level, title, path }))
  }

  function getSectionText(
    headingQuery: string
  ): {
    text?: string
    matches?: HeadingSummary[]
  } {
    const queryNormalized = normalizeHeading(headingQuery)
    if (!queryNormalized) return { matches: [] }

    const exactMatches = sections.filter(
      (s) => s.heading.normalizedTitle === queryNormalized || s.heading.normalizedPath === queryNormalized
    )
    if (exactMatches.length === 1) {
      const section = exactMatches[0]
      return { text: lines.slice(section.startLine, section.endLine).join('\n').trimEnd() }
    }
    if (exactMatches.length > 1) {
      return {
        matches: exactMatches.map((s) => ({
          level: s.heading.level,
          title: s.heading.title,
          path: s.heading.path,
        })),
      }
    }

    const partialMatches = sections.filter(
      (s) => s.heading.normalizedTitle.includes(queryNormalized) || s.heading.normalizedPath.includes(queryNormalized)
    )
    if (partialMatches.length === 1) {
      const section = partialMatches[0]
      return { text: lines.slice(section.startLine, section.endLine).join('\n').trimEnd() }
    }
    if (partialMatches.length > 1) {
      const sorted = [...partialMatches].sort((a, b) => {
        if (a.heading.level !== b.heading.level) return a.heading.level - b.heading.level
        return a.heading.normalizedTitle.length - b.heading.normalizedTitle.length
      })
      return {
        matches: sorted.slice(0, 10).map((s) => ({
          level: s.heading.level,
          title: s.heading.title,
          path: s.heading.path,
        })),
      }
    }

    return { matches: [] }
  }

  function search(
    query: string,
    options?: { maxResults?: number; contextLines?: number }
  ): SearchResult {
    const maxResults = Math.max(1, Math.min(50, options?.maxResults ?? 5))
    const contextLines = Math.max(0, Math.min(20, options?.contextLines ?? 2))
    const q = query.trim()
    if (!q) return { totalMatches: 0, matches: [], truncated: false }

    const qLower = q.toLowerCase()
    const matches: SearchMatch[] = []
    let totalMatches = 0

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      if (!line) continue
      if (!line.toLowerCase().includes(qLower)) continue

      totalMatches++
      if (matches.length >= maxResults) continue

      const start = Math.max(0, lineIndex - contextLines)
      const end = Math.min(lines.length, lineIndex + contextLines + 1)
      matches.push({
        line: lineIndex + 1,
        headingPath: pathAtLine[lineIndex] || '',
        snippet: lines.slice(start, end).join('\n').trimEnd(),
      })
    }

    return { totalMatches, matches, truncated: totalMatches > matches.length }
  }

  return { listHeadings, getSectionText, search }
}
