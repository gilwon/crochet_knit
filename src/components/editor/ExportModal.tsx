'use client'

import { useState } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'
import { toWritten } from '@/lib/written/converter'
import { exportToPdf } from '@/lib/export/pdf'

interface ExportModalProps {
  open: boolean
  onClose: () => void
}

export default function ExportModal({ open, onClose }: ExportModalProps) {
  const [exporting, setExporting] = useState(false)
  const title = useEditorStore((s) => s.title)
  const symbols = useEditorStore((s) => s.symbols)
  const gridConfig = useEditorStore((s) => s.gridConfig)

  if (!open) return null

  const handleExport = async () => {
    setExporting(true)
    try {
      // 캔버스 DOM 요소 찾기 (Konva Stage의 container)
      const canvasEl = document.querySelector('.konvajs-content') as HTMLElement
      if (!canvasEl) {
        alert('캔버스를 찾을 수 없습니다.')
        return
      }
      const writtenRows = toWritten(symbols, gridConfig)
      await exportToPdf(canvasEl, writtenRows, title)
      onClose()
    } catch {
      alert('PDF 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">PDF 내보내기</h2>

        <p className="text-sm text-gray-600 mb-6">
          현재 도안을 PDF 파일로 내보냅니다.
          <br />
          차트 이미지와 서술형 텍스트가 포함됩니다.
        </p>

        <div className="text-sm text-gray-500 mb-4">
          <div>제목: <span className="font-medium text-gray-800">{title}</span></div>
          <div>기호 수: {symbols.length}개</div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {exporting ? '생성 중...' : 'PDF 다운로드'}
          </button>
        </div>
      </div>
    </div>
  )
}
