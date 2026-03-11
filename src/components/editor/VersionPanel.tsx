'use client'

import { useEffect, useState } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'
import { createVersion, getVersions, getVersion } from '@/lib/supabase/projects'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown, ChevronUp, RotateCcw, Save } from 'lucide-react'

interface VersionItem {
  id: string
  label: string
  created_at: string
}

export default function VersionPanel() {
  const [versions, setVersions] = useState<VersionItem[]>([])
  const [open, setOpen]         = useState(false)
  const [saving, setSaving]     = useState(false)

  const projectId  = useEditorStore((s) => s.projectId)
  const symbols    = useEditorStore((s) => s.symbols)
  const gridConfig = useEditorStore((s) => s.gridConfig)
  const loadProject = useEditorStore((s) => s.loadProject)
  const title      = useEditorStore((s) => s.title)

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
    <div className="shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:bg-accent transition-colors"
      >
        버전 히스토리
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 gap-1.5 text-xs"
            onClick={handleSaveVersion}
            disabled={saving}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? '저장 중...' : '현재 버전 저장'}
          </Button>

          {versions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-1">저장된 버전이 없습니다.</p>
          ) : (
            <ScrollArea className="max-h-36">
              <div className="space-y-0.5">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md hover:bg-accent"
                  >
                    <div>
                      <span className="font-medium">{v.label || '이름 없음'}</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(v.created_at).toLocaleDateString('ko')}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRestore(v.id)}
                      title="이 버전으로 복원"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  )
}
