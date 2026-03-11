'use client'

import { useEditorStore } from '@/stores/useEditorStore'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { Separator } from '@/components/ui/separator'
import { WifiOff } from 'lucide-react'

export default function StatusBar() {
  const gridConfig = useEditorStore((s) => s.gridConfig)
  const symbols    = useEditorStore((s) => s.symbols)
  const zoom       = useEditorStore((s) => s.zoom)
  const isOnline   = useOnlineStatus()

  return (
    <div className="h-6 border-t bg-muted/40 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{gridConfig.patternType === 'round' ? '원형' : '사각'} {gridConfig.rows}×{gridConfig.cols}</span>
        <Separator orientation="vertical" className="h-3" />
        <span>기호 {symbols.length}개</span>
        <Separator orientation="vertical" className="h-3" />
        <span>{Math.round(zoom * 100)}%</span>
      </div>
      {!isOnline && (
        <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
          <WifiOff className="w-3 h-3" />
          오프라인
        </div>
      )}
    </div>
  )
}
