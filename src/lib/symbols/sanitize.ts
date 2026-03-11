import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g', 'defs', 'use']
const ALLOWED_ATTRS = [
  'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'width', 'height', 'points', 'href', 'xlink:href',
  'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'transform', 'viewBox', 'xmlns', 'id',
  'fill-rule', 'clip-rule', 'opacity',
]

/** Returns sanitized SVG string, or null if invalid */
export function sanitizeSvg(raw: string): string | null {
  if (typeof window === 'undefined') return null

  const clean = DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: false },
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    FORBID_TAGS: ['script', 'foreignObject'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover'],
  })

  if (!clean || !clean.includes('<svg')) return null
  return clean
}

/** Extract SVG path data (first <path d="..."> from sanitized SVG) */
export function extractSvgPath(cleanSvg: string): string | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(cleanSvg, 'image/svg+xml')
  const paths = doc.querySelectorAll('path')
  if (paths.length === 0) return null

  // Combine all paths into a single d attribute string
  const parts: string[] = []
  paths.forEach((p) => {
    const d = p.getAttribute('d')
    if (d) parts.push(d)
  })
  return parts.join(' ') || null
}
