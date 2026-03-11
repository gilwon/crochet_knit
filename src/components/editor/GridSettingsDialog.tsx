'use client'

import { useState } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface GridSettingsDialogProps {
  open: boolean
  onClose: () => void
}

export default function GridSettingsDialog({ open, onClose }: GridSettingsDialogProps) {
  const gridConfig    = useEditorStore((s) => s.gridConfig)
  const setGridConfig = useEditorStore((s) => s.setGridConfig)

  const [rows, setRows]           = useState(String(gridConfig.rows))
  const [cols, setCols]           = useState(String(gridConfig.cols))
  const [cellSize, setCellSize]   = useState(String(gridConfig.cellSize))
  const [patternType, setPatternType] = useState<'flat' | 'round'>(gridConfig.patternType ?? 'flat')

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      // 열릴 때 현재 값으로 초기화
      setRows(String(gridConfig.rows))
      setCols(String(gridConfig.cols))
      setCellSize(String(gridConfig.cellSize))
      setPatternType(gridConfig.patternType ?? 'flat')
    } else {
      onClose()
    }
  }

  const handleApply = () => {
    const r = Math.max(1, Math.min(100, parseInt(rows) || gridConfig.rows))
    const c = Math.max(1, Math.min(100, parseInt(cols) || gridConfig.cols))
    const s = Math.max(16, Math.min(60, parseInt(cellSize) || gridConfig.cellSize))

    setGridConfig({ rows: r, cols: c, cellSize: s, patternType })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>그리드 설정</DialogTitle>
          <DialogDescription>
            도안의 크기와 셀 크기를 설정합니다.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4 py-1">
          {/* 도안 유형 */}
          <div className="space-y-1.5">
            <Label className="text-xs">도안 유형</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={patternType === 'flat' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-8"
                onClick={() => setPatternType('flat')}
              >
                사각 도안
              </Button>
              <Button
                type="button"
                variant={patternType === 'round' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-8"
                onClick={() => setPatternType('round')}
              >
                원형 도안
              </Button>
            </div>
          </div>

          <Separator />

          {/* 단수 × 코수 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rows" className="text-xs">단수 (행)</Label>
              <div className="flex items-center gap-1">
                <Input
                  id="rows"
                  type="number"
                  min={1}
                  max={100}
                  value={rows}
                  onChange={(e) => setRows(e.target.value)}
                  className="h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground shrink-0">단</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cols" className="text-xs">코수 (열)</Label>
              <div className="flex items-center gap-1">
                <Input
                  id="cols"
                  type="number"
                  min={1}
                  max={100}
                  value={cols}
                  onChange={(e) => setCols(e.target.value)}
                  className="h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground shrink-0">코</span>
              </div>
            </div>
          </div>

          {/* 셀 크기 */}
          <div className="space-y-1.5">
            <Label htmlFor="cellSize" className="text-xs">셀 크기</Label>
            <div className="flex items-center gap-2">
              <Input
                id="cellSize"
                type="number"
                min={16}
                max={60}
                value={cellSize}
                onChange={(e) => setCellSize(e.target.value)}
                className="h-8 text-sm w-24"
              />
              <span className="text-xs text-muted-foreground">px (16~60)</span>
            </div>
          </div>

          {/* 미리보기 */}
          <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground space-y-0.5">
            <div>
              크기:{' '}
              <span className="font-medium text-foreground">
                {parseInt(rows) || 0}단 × {parseInt(cols) || 0}코
              </span>
            </div>
            <div className="text-[11px]">
              캔버스: {(parseInt(cols) || 0) * (parseInt(cellSize) || 0)}×
              {(parseInt(rows) || 0) * (parseInt(cellSize) || 0)} px
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleApply}>적용</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
