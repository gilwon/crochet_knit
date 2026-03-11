import type { SymbolDefinition } from '@/types/symbol'
import { crochetSymbols } from './crochet'
import { knittingSymbols } from './knitting'

export const allSymbols: SymbolDefinition[] = [
  ...crochetSymbols,
  ...knittingSymbols,
]

const builtinMap = new Map<string, SymbolDefinition>()
for (const s of allSymbols) builtinMap.set(s.id, s)

// Runtime custom symbol registry (populated by useCustomSymbols hook)
const customMap = new Map<string, SymbolDefinition>()

export function registerCustomSymbol(def: SymbolDefinition) {
  customMap.set(def.id, def)
}

export function unregisterCustomSymbol(id: string) {
  customMap.delete(id)
}

export function getSymbolDefinition(symbolId: string): SymbolDefinition | undefined {
  return builtinMap.get(symbolId) ?? customMap.get(symbolId)
}

export { crochetSymbols, knittingSymbols }
