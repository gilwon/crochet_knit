import type { SymbolDefinition } from '@/types/symbol'
import { crochetSymbols } from './crochet'
import { knittingSymbols } from './knitting'

export const allSymbols: SymbolDefinition[] = [
  ...crochetSymbols,
  ...knittingSymbols,
]

export function getSymbolDefinition(symbolId: string): SymbolDefinition | undefined {
  return allSymbols.find((s) => s.id === symbolId)
}

export { crochetSymbols, knittingSymbols }
