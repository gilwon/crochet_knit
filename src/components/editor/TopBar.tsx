'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useEditorStore } from '@/stores/useEditorStore'
import ExportModal from './ExportModal'
import GridSettingsDialog from './GridSettingsDialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Undo2, Redo2, Minus, Plus, FileDown, Grid2x2, Circle, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'
import GaugeCalculatorDialog from './GaugeCalculatorDialog'

const saveStatusMap = {
  saved:   { label: '저장됨',   variant: 'secondary' },
  saving:  { label: '저장 중…', variant: 'outline'   },
  unsaved: { label: '미저장',   variant: 'outline'   },
  error:   { label: '저장 실패', variant: 'destructive' },
} as const

export default function TopBar() {
  const [exportOpen, setExportOpen]   = useState(false)
  const [gridOpen, setGridOpen]       = useState(false)
  const [gaugeOpen, setGaugeOpen]     = useState(false)
  const gridConfig = useEditorStore((s) => s.gridConfig)
  const title      = useEditorStore((s) => s.title)
  const setTitle   = useEditorStore((s) => s.setTitle)
  const undo       = useEditorStore((s) => s.undo)
  const redo       = useEditorStore((s) => s.redo)
  const past       = useEditorStore((s) => s.past)
  const future     = useEditorStore((s) => s.future)
  const saveStatus = useEditorStore((s) => s.saveStatus)
  const zoom       = useEditorStore((s) => s.zoom)
  const setZoom    = useEditorStore((s) => s.setZoom)

  const status = saveStatusMap[saveStatus]

  return (
    <div className="h-12 border-b bg-card flex items-center gap-2 px-3 shrink-0">
      {/* Back */}
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 shrink-0')}
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>

      <Separator orientation="vertical" className="h-5" />

      {/* Title + save status */}
      <div className="flex items-center gap-2 min-w-0">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm font-medium bg-transparent border-none outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-1.5 py-0.5 min-w-0 max-w-48 truncate"
        />
        <Badge variant={status.variant} className="shrink-0 text-xs py-0">
          {status.label}
        </Badge>
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost" size="icon" className="h-8 w-8"
          onClick={undo} disabled={past.length === 0}
          title="실행 취소 (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost" size="icon" className="h-8 w-8"
          onClick={redo} disabled={future.length === 0}
          title="재실행 (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Zoom */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost" size="icon" className="h-7 w-7"
          onClick={() => setZoom(zoom - 0.1)}
        >
          <Minus className="w-3.5 h-3.5" />
        </Button>
        <span className="text-xs text-muted-foreground w-12 text-center tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost" size="icon" className="h-7 w-7"
          onClick={() => setZoom(zoom + 0.1)}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Gauge Calculator */}
      <Button
        variant="outline" size="sm" className="h-8 gap-1.5"
        onClick={() => setGaugeOpen(true)}
        title="게이지 계산기"
      >
        <Calculator className="w-3.5 h-3.5" />
        계산기
      </Button>

      <Separator orientation="vertical" className="h-5" />

      {/* Grid settings */}
      <Button
        variant="outline" size="sm" className="h-8 gap-1.5"
        onClick={() => setGridOpen(true)}
        title="그리드 설정"
      >
        {gridConfig.patternType === 'round'
          ? <Circle className="w-3.5 h-3.5" />
          : <Grid2x2 className="w-3.5 h-3.5" />
        }
        {gridConfig.rows}×{gridConfig.cols}
      </Button>

      <Separator orientation="vertical" className="h-5" />

      {/* Export */}
      <Button size="sm" className="h-8 gap-1.5" onClick={() => setExportOpen(true)}>
        <FileDown className="w-3.5 h-3.5" />
        PDF 내보내기
      </Button>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <GridSettingsDialog open={gridOpen} onClose={() => setGridOpen(false)} />
      <GaugeCalculatorDialog open={gaugeOpen} onClose={() => setGaugeOpen(false)} />
    </div>
  )
}
