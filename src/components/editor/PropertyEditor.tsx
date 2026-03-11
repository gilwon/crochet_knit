'use client'

import { useState, useEffect } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'
import { getSymbolDefinition } from '@/lib/symbols'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RotateCw, Trash2, Plus, Repeat2 } from 'lucide-react'
import { PRESET_COLORS } from '@/lib/colors'

export default function PropertyEditor() {
  const selectedIds        = useEditorStore((s) => s.selectedIds)
  const symbols            = useEditorStore((s) => s.symbols)
  const rotateSymbol       = useEditorStore((s) => s.rotateSymbol)
  const setSymbolRotation  = useEditorStore((s) => s.setSymbolRotation)
  const removeSymbols      = useEditorStore((s) => s.removeSymbols)
  const setSymbolColor     = useEditorStore((s) => s.setSymbolColor)
  const addRepeatRegion    = useEditorStore((s) => s.addRepeatRegion)
  const removeRepeatRegion = useEditorStore((s) => s.removeRepeatRegion)
  const repeatRegions      = useEditorStore((s) => s.repeatRegions)
  const [repeatCount, setRepeatCount] = useState('2')

  const selected = symbols.find((s) => s.id === selectedIds[0])

  // Local input value for direct rotation entry — kept as string to allow free typing
  const [rotationInput, setRotationInput] = useState(String(selected?.rotation ?? 0))
  useEffect(() => {
    setRotationInput(String(selected?.rotation ?? 0))
  }, [selected?.rotation, selected?.id])

  if (selectedIds.length === 0) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          속성
        </h3>
        <p className="text-xs text-muted-foreground">
          기호를 선택하면 속성을 편집할 수 있습니다.
        </p>
      </div>
    )
  }

  if (!selected) return null

  const def = getSymbolDefinition(selected.symbolId)

  const handleRotationBlur = () => {
    const val = parseInt(rotationInput, 10)
    const clamped = isNaN(val) ? selected.rotation : ((val % 360) + 360) % 360
    setRotationInput(String(clamped))
    setSymbolRotation(selected.id, clamped)
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        속성
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-x-2 text-sm">
          <span className="text-muted-foreground text-xs">기호</span>
          <span className="font-medium text-xs truncate">{def?.name || selected.symbolId}</span>
          <span className="text-muted-foreground text-xs mt-1">위치</span>
          <span className="text-xs mt-1">{selected.row + 1}단 {selected.col + 1}코</span>
        </div>

        {/* Rotation */}
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">회전</span>
          <div className="flex gap-1.5">
            <div className="flex items-center flex-1 border rounded-md overflow-hidden h-8">
              <Input
                type="number"
                min={0}
                max={359}
                value={rotationInput}
                onChange={(e) => setRotationInput(e.target.value)}
                onBlur={handleRotationBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleRotationBlur()}
                className="border-0 h-full rounded-none text-xs px-2 focus-visible:ring-0 w-16"
              />
              <span className="text-xs text-muted-foreground pr-2 shrink-0">°</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => rotateSymbol(selected.id)}
              title="+90° 회전"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={() => removeSymbols(selectedIds)}
              title={`${selectedIds.length}개 삭제`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Color */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">배경색</span>
            <div
              className="w-5 h-5 rounded border border-border shadow-sm"
              style={{ backgroundColor: selected.color ?? '#1f2937' }}
            />
          </div>
          <div className="grid grid-cols-8 gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                title={color}
                onClick={() => setSymbolColor(selected.id, color)}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  (selected.color ?? '#1f2937') === color
                    ? 'border-primary scale-110 shadow-sm'
                    : 'border-transparent hover:border-border'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <label
              title="사용자 정의 색상"
              className="w-6 h-6 rounded border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
            >
              <Plus className="w-3 h-3 text-muted-foreground" />
              <input
                type="color"
                className="sr-only"
                value={selected.color ?? '#1f2937'}
                onChange={(e) => setSymbolColor(selected.id, e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Repeat region */}
        {selectedIds.length >= 1 && (
          <div className="space-y-1.5 pt-1 border-t border-border">
            <span className="text-xs text-muted-foreground">반복 구간</span>
            <div className="flex gap-1.5">
              <div className="flex items-center flex-1 border rounded-md overflow-hidden h-8">
                <Input
                  type="number"
                  min={2}
                  max={99}
                  value={repeatCount}
                  onChange={(e) => setRepeatCount(e.target.value)}
                  className="border-0 h-full rounded-none text-xs px-2 focus-visible:ring-0 w-14"
                />
                <span className="text-xs text-muted-foreground pr-2 shrink-0">회</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                title="선택 기호로 반복 구간 생성"
                onClick={() => {
                  const selectedSymbols = symbols.filter((s) => selectedIds.includes(s.id))
                  if (selectedSymbols.length === 0) return
                  const startRow = Math.min(...selectedSymbols.map((s) => s.row))
                  const endRow   = Math.max(...selectedSymbols.map((s) => s.row))
                  const startCol = Math.min(...selectedSymbols.map((s) => s.col))
                  const endCol   = Math.max(...selectedSymbols.map((s) => s.col))
                  const count    = Math.max(2, parseInt(repeatCount, 10) || 2)
                  addRepeatRegion({ startRow, endRow, startCol, endCol, count })
                }}
              >
                <Repeat2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Existing repeat regions */}
      {repeatRegions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">반복 구간 목록</h4>
          <div className="space-y-1">
            {repeatRegions.map((r, i) => (
              <div key={r.id} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  구간 {i + 1} &nbsp;×{r.count}회
                </span>
                <button
                  onClick={() => removeRepeatRegion(r.id)}
                  className="text-destructive hover:underline"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
