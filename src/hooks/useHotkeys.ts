'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'

export function useEditorHotkeys() {
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const copySelected = useEditorStore((s) => s.copySelected)
  const pasteSymbols = useEditorStore((s) => s.pasteSymbols)
  const removeSymbols = useEditorStore((s) => s.removeSymbols)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const symbols = useEditorStore((s) => s.symbols)
  const selectSymbols = useEditorStore((s) => s.selectSymbols)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey

      // Ctrl+Z: Undo
      if (isCmd && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        undo()
      }
      // Ctrl+Shift+Z: Redo
      if (isCmd && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        redo()
      }
      // Ctrl+C: Copy
      if (isCmd && e.key === 'c') {
        if (selectedIds.length > 0) {
          e.preventDefault()
          copySelected()
        }
      }
      // Ctrl+V: Paste
      if (isCmd && e.key === 'v') {
        e.preventDefault()
        pasteSymbols()
      }
      // Ctrl+A: Select All
      if (isCmd && e.key === 'a') {
        e.preventDefault()
        selectSymbols(symbols.map((s) => s.id))
      }
      // Delete / Backspace: Remove selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (
          selectedIds.length > 0 &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          e.preventDefault()
          removeSymbols(selectedIds)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, copySelected, pasteSymbols, removeSymbols, selectedIds, symbols, selectSymbols])
}
