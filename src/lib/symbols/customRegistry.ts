import type { SymbolDefinition } from '@/types/symbol'

const STORAGE_KEY = 'knitcanvas:custom-symbols'

/** Load custom symbols from localStorage */
export function loadCustomSymbols(): SymbolDefinition[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SymbolDefinition[]
  } catch {
    return []
  }
}

/** Save custom symbols to localStorage */
function saveCustomSymbols(symbols: SymbolDefinition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols))
}

/** Add a custom symbol. Returns updated list. */
export function addCustomSymbol(def: SymbolDefinition): SymbolDefinition[] {
  const current = loadCustomSymbols().filter((s) => s.id !== def.id)
  const updated = [...current, def]
  saveCustomSymbols(updated)
  return updated
}

/** Delete a custom symbol by id. Returns updated list. */
export function deleteCustomSymbol(id: string): SymbolDefinition[] {
  const updated = loadCustomSymbols().filter((s) => s.id !== id)
  saveCustomSymbols(updated)
  return updated
}
