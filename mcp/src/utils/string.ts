/**
 * String transformation utilities
 */

export function toKebabCase(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase()
}

export function kebabToCamel(input: string): string {
  return input.replace(/-([a-z0-9])/g, (_, ch: string) => ch.toUpperCase())
}

export function normalizeQuery(input: string): string {
  return input.trim().replace(/^[:@]/, '')
}
