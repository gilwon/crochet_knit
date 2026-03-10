'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useEditorStore } from '@/stores/useEditorStore'
import ExportModal from './ExportModal'

export default function TopBar() {
  const [exportOpen, setExportOpen] = useState(false)
  const title = useEditorStore((s) => s.title)
  const setTitle = useEditorStore((s) => s.setTitle)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const past = useEditorStore((s) => s.past)
  const future = useEditorStore((s) => s.future)
  const saveStatus = useEditorStore((s) => s.saveStatus)
  const zoom = useEditorStore((s) => s.zoom)
  const setZoom = useEditorStore((s) => s.setZoom)

  const saveStatusText = {
    saved: '저장됨',
    saving: '저장 중...',
    unsaved: '저장 안됨',
    error: '저장 실패',
  }

  const saveStatusColor = {
    saved: 'text-green-600',
    saving: 'text-yellow-600',
    unsaved: 'text-gray-400',
    error: 'text-red-600',
  }

  return (
    <div className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-2 py-1"
        />
        <span className={`text-xs ${saveStatusColor[saveStatus]}`}>
          {saveStatusText[saveStatus]}
        </span>
      </div>

      {/* Center: Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={past.length === 0}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="실행 취소 (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a4 4 0 014 4v2M3 10l4-4M3 10l4 4" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="재실행 (Ctrl+Shift+Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a4 4 0 00-4 4v2M21 10l-4-4M21 10l-4 4" />
          </svg>
        </button>
      </div>

      {/* Right: Zoom + Export */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <button
            onClick={() => setZoom(zoom - 0.1)}
            className="px-1 hover:bg-gray-100 rounded"
          >
            -
          </button>
          <span className="w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(zoom + 0.1)}
            className="px-1 hover:bg-gray-100 rounded"
          >
            +
          </button>
        </div>
        <button
          onClick={() => setExportOpen(true)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          PDF 내보내기
        </button>
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  )
}
