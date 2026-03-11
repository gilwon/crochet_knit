import type { PlacedSymbol } from '@/types/symbol'
import type { GridConfig } from '@/types/grid'
import { getSymbolDefinition } from '@/lib/symbols'

export interface WrittenRow {
  rowNumber: number
  instructions: string
}

export function toWritten(
  symbols: PlacedSymbol[],
  _gridConfig: GridConfig,
  lang: 'ko' | 'en' = 'ko'
): WrittenRow[] {
  if (symbols.length === 0) return []

  // 1. row별 그룹화
  const rowGroups = new Map<number, PlacedSymbol[]>()
  for (const s of symbols) {
    const group = rowGroups.get(s.row) || []
    group.push(s)
    rowGroups.set(s.row, group)
  }

  // 2. 각 row 처리
  const rows: WrittenRow[] = []
  const sortedKeys = Array.from(rowGroups.keys()).sort((a, b) => a - b)

  for (const rowKey of sortedKeys) {
    const rowSymbols = rowGroups.get(rowKey)!
    // col 오름차순 정렬
    rowSymbols.sort((a, b) => a.col - b.col)

    // 3. Run-Length Encoding
    const parts: string[] = []
    let i = 0
    while (i < rowSymbols.length) {
      const currentId = rowSymbols[i].symbolId
      let count = 1
      while (
        i + count < rowSymbols.length &&
        rowSymbols[i + count].symbolId === currentId
      ) {
        count++
      }
      const def = getSymbolDefinition(currentId)
      const name = lang === 'en'
        ? (def?.abbreviation || def?.nameEn || currentId)
        : (def?.name || currentId)
      parts.push(count > 1 ? `${name} ${count}` : name)
      i += count
    }

    rows.push({
      rowNumber: rowKey + 1,
      instructions: parts.join(', '),
    })
  }

  return rows
}
