'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import EditorLayout from '@/components/editor/EditorLayout'
import { useEditorStore } from '@/stores/useEditorStore'
import { getProject } from '@/lib/supabase/projects'

export default function EditorPage() {
  const params = useParams()
  const id = params.id as string
  const loadProject = useEditorStore((s) => s.loadProject)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id || id === 'new') {
      setLoading(false)
      return
    }

    async function load() {
      const { data, error } = await getProject(id)
      if (error || !data) {
        setError('도안을 불러올 수 없습니다.')
        setLoading(false)
        return
      }
      loadProject({
        id: data.id,
        title: data.title,
        gridConfig: data.grid_config,
        symbols: data.symbols || [],
      })
      setLoading(false)
    }
    load()
  }, [id, loadProject])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        불러오는 중...
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    )
  }

  return <EditorLayout />
}
