import { useState, useEffect, useCallback } from 'react'
import type { SymbolDefinition } from '@/types/symbol'
import { loadCustomSymbols, addCustomSymbol, deleteCustomSymbol } from '@/lib/symbols/customRegistry'
import { registerCustomSymbol, unregisterCustomSymbol } from '@/lib/symbols'

export function useCustomSymbols() {
  const [customSymbols, setCustomSymbols] = useState<SymbolDefinition[]>([])

  // Load from localStorage on mount and register them in the symbol registry
  useEffect(() => {
    const loaded = loadCustomSymbols()
    setCustomSymbols(loaded)
    loaded.forEach(registerCustomSymbol)
  }, [])

  const add = useCallback((def: SymbolDefinition) => {
    const updated = addCustomSymbol(def)
    setCustomSymbols(updated)
    registerCustomSymbol(def)
  }, [])

  const remove = useCallback((id: string) => {
    const updated = deleteCustomSymbol(id)
    setCustomSymbols(updated)
    unregisterCustomSymbol(id)
  }, [])

  return { customSymbols, addCustomSymbol: add, deleteCustomSymbol: remove }
}
