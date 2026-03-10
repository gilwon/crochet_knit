'use client'

import { useEditorStore } from '@/stores/useEditorStore'
import { getSymbolDefinition } from '@/lib/symbols'

export default function PropertyEditor() {
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const symbols = useEditorStore((s) => s.symbols)
  const rotateSymbol = useEditorStore((s) => s.rotateSymbol)
  const removeSymbols = useEditorStore((s) => s.removeSymbols)

  if (selectedIds.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">속성</h3>
        <p className="text-xs text-gray-400">기호를 선택하면 속성을 편집할 수 있습니다.</p>
      </div>
    )
  }

  const selected = symbols.find((s) => s.id === selectedIds[0])
  if (!selected) return null

  const def = getSymbolDefinition(selected.symbolId)

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">속성</h3>
      <div className="space-y-3">
        <div>
          <div className="text-xs text-gray-500">기호</div>
          <div className="text-sm font-medium">{def?.name || selected.symbolId}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">위치</div>
          <div className="text-sm">
            {selected.row + 1}단, {selected.col + 1}코
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">회전</div>
          <button
            onClick={() => rotateSymbol(selected.id)}
            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            90° 회전 ({selected.rotation}°)
          </button>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={() => removeSymbols(selectedIds)}
            className="w-full px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            삭제 ({selectedIds.length}개)
          </button>
        )}
      </div>
    </div>
  )
}
