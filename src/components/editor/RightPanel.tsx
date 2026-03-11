'use client'

import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import PropertyEditor from './PropertyEditor'
import WrittenView from './WrittenView'
import VersionPanel from './VersionPanel'

export default function RightPanel() {
  return (
    <div className="w-72 border-l bg-card flex flex-col h-full shrink-0">
      {/* Property Editor */}
      <div className="p-3 shrink-0">
        <PropertyEditor />
      </div>

      <Separator />

      {/* Written View */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          <WrittenView />
        </div>
      </ScrollArea>

      <Separator />

      {/* Version History */}
      <VersionPanel />
    </div>
  )
}
