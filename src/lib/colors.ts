export const PRESET_COLORS = [
  // Neutrals
  '#ffffff', '#faf7f0', '#e5e7eb', '#9ca3af',
  '#6b7280', '#374151', '#1f2937', '#000000',
  // Colors
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

/** Returns '#ffffff' or '#1f2937' for readable contrast on the given hex background. */
export function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#1f2937' : '#f9fafb'
}
