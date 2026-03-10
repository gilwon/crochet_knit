'use client'

import PropertyEditor from './PropertyEditor'
import WrittenView from './WrittenView'
import VersionPanel from './VersionPanel'

export default function RightPanel() {
  return (
    <div className="w-72 border-l border-gray-200 bg-white flex flex-col h-full">
      {/* Property Editor */}
      <div className="p-3 border-b border-gray-200">
        <PropertyEditor />
      </div>

      {/* Written View */}
      <div className="flex-1 p-3 overflow-y-auto">
        <WrittenView />
      </div>

      {/* Version History */}
      <VersionPanel />
    </div>
  )
}
