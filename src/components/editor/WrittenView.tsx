'use client'

import { useMemo } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'
import { toWritten } from '@/lib/written/converter'

export default function WrittenView() {
  const symbols = useEditorStore((s) => s.symbols)
  const gridConfig = useEditorStore((s) => s.gridConfig)

  const writtenRows = useMemo(
    () => toWritten(symbols, gridConfig),
    [symbols, gridConfig]
  )

  return (
    <div className="flex-1 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">서술형 도안</h3>
      {writtenRows.length === 0 ? (
        <p className="text-xs text-gray-400">
          캔버스에 기호를 배치하면 서술형 텍스트가 자동으로 생성됩니다.
        </p>
      ) : (
        <div className="space-y-1">
          {writtenRows.map((row) => (
            <div key={row.rowNumber} className="text-sm text-gray-700">
              <span className="font-medium text-gray-900">
                {row.rowNumber}단:
              </span>{' '}
              {row.instructions}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
