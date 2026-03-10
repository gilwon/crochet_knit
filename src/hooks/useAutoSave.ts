'use client'

import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'
import { saveProject } from '@/lib/supabase/projects'

export function useAutoSave() {
  const projectId = useEditorStore((s) => s.projectId)
  const symbols = useEditorStore((s) => s.symbols)
  const gridConfig = useEditorStore((s) => s.gridConfig)
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus)
  const saveStatus = useEditorStore((s) => s.saveStatus)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // 첫 로드 시에는 저장하지 않음
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (!projectId) return
    if (saveStatus === 'saving') return

    setSaveStatus('unsaved')

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      const { error } = await saveProject(projectId, symbols, gridConfig)
      setSaveStatus(error ? 'error' : 'saved')

      // 에러 시 3초 간격 재시도 (최대 3회)
      if (error) {
        let retryCount = 0
        const maxRetries = 3
        const retryInterval = setInterval(async () => {
          retryCount++
          setSaveStatus('saving')
          const retry = await saveProject(projectId, symbols, gridConfig)
          if (!retry.error || retryCount >= maxRetries) {
            clearInterval(retryInterval)
            setSaveStatus(retry.error ? 'error' : 'saved')
          }
        }, 3000)
      }
    }, 3000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [symbols, gridConfig]) // eslint-disable-line react-hooks/exhaustive-deps
}
