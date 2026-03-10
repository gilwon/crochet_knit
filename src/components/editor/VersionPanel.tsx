'use client'

import { useEffect, useState } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'
import {
  createVersion,
  getVersions,
  getVersion,
} from '@/lib/supabase/projects'

interface VersionItem {
  id: string
  label: string
  created_at: string
}

export default function VersionPanel() {
  const [versions, setVersions] = useState<VersionItem[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const projectId = useEditorStore((s) => s.projectId)
  const symbols = useEditorStore((s) => s.symbols)
  const gridConfig = useEditorStore((s) => s.gridConfig)
  const loadProject = useEditorStore((s) => s.loadProject)
  const title = useEditorStore((s) => s.title)

  const loadVersions = async () => {
    if (!projectId) return
    const { data } = await getVersions(projectId)
    setVersions((data as VersionItem[]) || [])
  }

  useEffect(() => {
    if (open && projectId) loadVersions()
  }, [open, projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveVersion = async () => {
    if (!projectId) return
    setSaving(true)
    const label = `v${versions.length + 1}`
    await createVersion(projectId, { grid_config: gridConfig, symbols }, label)
    await loadVersions()
    setSaving(false)
  }

  const handleRestore = async (versionId: string) => {
    if (!confirm('이 버전으로 복원하시겠습니까? 현재 작업이 대체됩니다.')) return
    const { data } = await getVersion(versionId)
    if (data?.snapshot && projectId) {
      loadProject({
        id: projectId,
        title,
        gridConfig: data.snapshot.grid_config,
        symbols: data.snapshot.symbols,
      })
    }
  }

  if (!projectId) return null

  return (
    <div className="border-t border-gray-200 p-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-semibold text-gray-700 w-full text-left flex items-center justify-between"
      >
        버전 히스토리
        <span className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          <button
            onClick={handleSaveVersion}
            disabled={saving}
            className="w-full px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 rounded-md transition-colors"
          >
            {saving ? '저장 중...' : '현재 버전 저장'}
          </button>

          {versions.length === 0 ? (
            <p className="text-xs text-gray-400">저장된 버전이 없습니다.</p>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between text-xs p-2 rounded hover:bg-gray-50"
                >
                  <div>
                    <span className="font-medium text-gray-700">
                      {v.label || '이름 없음'}
                    </span>
                    <span className="text-gray-400 ml-2">
                      {new Date(v.created_at).toLocaleDateString('ko')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRestore(v.id)}
                    className="text-blue-600 hover:underline"
                  >
                    복원
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
