'use client'

import dynamic from 'next/dynamic'
import TopBar from './TopBar'
import SymbolPanel from './SymbolPanel'
import RightPanel from './RightPanel'
import StatusBar from './StatusBar'
import { useEditorHotkeys } from '@/hooks/useHotkeys'
import { useAutoSave } from '@/hooks/useAutoSave'

const Canvas = dynamic(() => import('./Canvas'), { ssr: false })

export default function EditorLayout() {
  useEditorHotkeys()
  useAutoSave()

  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <SymbolPanel />
        <Canvas />
        <RightPanel />
      </div>
      <StatusBar />
    </div>
  )
}
