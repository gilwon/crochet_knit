'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useEditorStore } from '@/stores/useEditorStore'

interface GaugeCalculatorDialogProps {
  open: boolean
  onClose: () => void
}

const SIZE_TEMPLATES = [
  { size: 'XS', chest: 76, length: 55 },
  { size: 'S',  chest: 84, length: 58 },
  { size: 'M',  chest: 92, length: 61 },
  { size: 'L',  chest: 100, length: 64 },
  { size: 'XL', chest: 108, length: 67 },
]

export default function GaugeCalculatorDialog({ open, onClose }: GaugeCalculatorDialogProps) {
  const [stGauge, setStGauge] = useState('20') // stitches per 10cm
  const [rowGauge, setRowGauge] = useState('24') // rows per 10cm
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const setGridConfig = useEditorStore((s) => s.setGridConfig)

  const sts = parseFloat(stGauge) || 0
  const rows = parseFloat(rowGauge) || 0

  const calc = (cm: number, gauge: number) =>
    gauge > 0 ? Math.round((cm / 10) * gauge) : 0

  const handleApplyToGrid = (t: typeof SIZE_TEMPLATES[0]) => {
    const cols = calc(t.chest, sts)
    const rowCount = calc(t.length, rows)
    if (cols > 0 && rowCount > 0) {
      setGridConfig({ cols, rows: rowCount })
      setSelectedSize(t.size)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>사이즈/게이지 계산기</DialogTitle>
          <DialogDescription>
            10cm 기준 게이지를 입력하면 S~XL 사이즈별 콧수/단수를 자동 계산합니다.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Gauge inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">콧수 게이지 (10cm 기준)</label>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min={1}
                max={100}
                value={stGauge}
                onChange={(e) => { setStGauge(e.target.value); setSelectedSize(null) }}
                className="h-8 text-sm"
              />
              <span className="text-xs text-muted-foreground shrink-0">코</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">단수 게이지 (10cm 기준)</label>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min={1}
                max={100}
                value={rowGauge}
                onChange={(e) => { setRowGauge(e.target.value); setSelectedSize(null) }}
                className="h-8 text-sm"
              />
              <span className="text-xs text-muted-foreground shrink-0">단</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Results table */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">성인 기준 상의 사이즈 — 행 클릭 시 그리드에 적용</p>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-medium">사이즈</th>
                  <th className="text-right px-3 py-2 text-xs font-medium">가슴</th>
                  <th className="text-right px-3 py-2 text-xs font-medium">길이</th>
                  <th className="text-right px-3 py-2 text-xs font-medium">콧수</th>
                  <th className="text-right px-3 py-2 text-xs font-medium">단수</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SIZE_TEMPLATES.map((t) => (
                  <tr
                    key={t.size}
                    className={`transition-colors ${
                      selectedSize === t.size
                        ? 'bg-primary/10'
                        : 'hover:bg-muted/50 cursor-pointer'
                    }`}
                  >
                    <td className="px-3 py-2 font-semibold">{t.size}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{t.chest}cm</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{t.length}cm</td>
                    <td className="px-3 py-2 text-right font-medium">{calc(t.chest, sts)}코</td>
                    <td className="px-3 py-2 text-right font-medium">{calc(t.length, rows)}단</td>
                    <td className="px-2 py-2 text-right">
                      <Button
                        variant={selectedSize === t.size ? 'default' : 'outline'}
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => handleApplyToGrid(t)}
                        disabled={sts === 0 || rows === 0}
                      >
                        {selectedSize === t.size ? '적용됨' : '적용'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * 실 두께, 바늘 호수, 뜨개 장력에 따라 실제 게이지가 달라질 수 있습니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
