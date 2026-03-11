'use client'

import { useState } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'
import { toWritten } from '@/lib/written/converter'
import { exportToPdf } from '@/lib/export/pdf'
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
import { Separator } from '@/components/ui/separator'
import { FileDown } from 'lucide-react'

interface ExportModalProps {
  open: boolean
  onClose: () => void
}

export default function ExportModal({ open, onClose }: ExportModalProps) {
  const [exporting, setExporting] = useState(false)
  const [watermark, setWatermark] = useState('')
  const title      = useEditorStore((s) => s.title)
  const symbols    = useEditorStore((s) => s.symbols)
  const gridConfig = useEditorStore((s) => s.gridConfig)

  const handleExport = async () => {
    setExporting(true)
    try {
      const canvasEl = document.querySelector('.konvajs-content') as HTMLElement
      if (!canvasEl) {
        alert('캔버스를 찾을 수 없습니다.')
        return
      }
      const writtenRows = toWritten(symbols, gridConfig)
      await exportToPdf(canvasEl, writtenRows, title, watermark.trim() || undefined)
      onClose()
    } catch {
      alert('PDF 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>PDF 내보내기</DialogTitle>
          <DialogDescription>
            차트 이미지와 서술형 텍스트가 포함된 PDF 파일로 내보냅니다.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="text-sm space-y-1.5 py-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">제목</span>
            <span className="font-medium">{title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">기호 수</span>
            <span className="font-medium">{symbols.length}개</span>
          </div>
        </div>

        <Separator />

        {/* Watermark */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">
            워터마크 텍스트 <span className="opacity-60">(선택사항)</span>
          </label>
          <Input
            value={watermark}
            onChange={(e) => setWatermark(e.target.value)}
            placeholder="구매자 이름 또는 이메일..."
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            입력 시 PDF 전체에 대각선 워터마크가 삽입됩니다.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            취소
          </Button>
          <Button onClick={handleExport} disabled={exporting} className="gap-1.5">
            <FileDown className="w-4 h-4" />
            {exporting ? '생성 중...' : 'PDF 다운로드'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
