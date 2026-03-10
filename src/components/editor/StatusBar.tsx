'use client'

import { useEditorStore } from '@/stores/useEditorStore'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export default function StatusBar() {
  const gridConfig = useEditorStore((s) => s.gridConfig)
  const symbols = useEditorStore((s) => s.symbols)
  const zoom = useEditorStore((s) => s.zoom)
  const isOnline = useOnlineStatus()

  return (
    <div className="h-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between px-4 text-xs text-gray-500">
      <div className="flex items-center gap-4">
        <span>
          그리드 {gridConfig.rows}x{gridConfig.cols}
        </span>
        <span>기호 {symbols.length}개</span>
        <span>줌 {Math.round(zoom * 100)}%</span>
      </div>
      <div className="flex items-center gap-2">
        {!isOnline && (
          <span className="text-amber-600 font-medium">오프라인</span>
        )}
      </div>
    </div>
  )
}
