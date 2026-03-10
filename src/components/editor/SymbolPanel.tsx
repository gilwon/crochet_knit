'use client'

import { useState } from 'react'
import { crochetSymbols } from '@/lib/symbols/crochet'
import { knittingSymbols } from '@/lib/symbols/knitting'
import type { SymbolDefinition } from '@/types/symbol'
import { useEditorStore } from '@/stores/useEditorStore'

export default function SymbolPanel() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'crochet' | 'knitting'>('crochet')
  const { activePlacementSymbolId, setActivePlacementSymbolId } = useEditorStore()

  const symbols = activeTab === 'crochet' ? crochetSymbols : knittingSymbols
  const filtered = search
    ? symbols.filter(
        (s) =>
          s.name.includes(search) ||
          s.nameEn.toLowerCase().includes(search.toLowerCase()) ||
          s.abbreviation.toLowerCase().includes(search.toLowerCase())
      )
    : symbols

  const handleDragStart = (e: React.DragEvent, symbol: SymbolDefinition) => {
    e.dataTransfer.setData('symbolId', symbol.id)
    e.dataTransfer.effectAllowed = 'copy'
    setActivePlacementSymbolId(null)
  }

  const handleSymbolClick = (symbol: SymbolDefinition) => {
    setActivePlacementSymbolId(
      activePlacementSymbolId === symbol.id ? null : symbol.id
    )
  }

  return (
    <div className="w-60 border-r border-gray-200 bg-white flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="기호 검색..."
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('crochet'); setActivePlacementSymbolId(null) }}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'crochet'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          코바늘
        </button>
        <button
          onClick={() => { setActiveTab('knitting'); setActivePlacementSymbolId(null) }}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'knitting'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          대바늘
        </button>
      </div>

      {/* Symbol List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.map((symbol) => (
          <div
            key={symbol.id}
            draggable
            onDragStart={(e) => handleDragStart(e, symbol)}
            onClick={() => handleSymbolClick(symbol)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-50 active:cursor-grabbing select-none ${
              activePlacementSymbolId === symbol.id
                ? 'bg-blue-50 ring-1 ring-blue-400'
                : ''
            }`}
          >
            <div className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center bg-white">
              <svg viewBox="0 0 30 30" className="w-5 h-5">
                <path
                  d={symbol.svgPath}
                  fill="transparent"
                  stroke="#1f2937"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">
                {symbol.name}
              </div>
              <div className="text-xs text-gray-400">{symbol.abbreviation}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
