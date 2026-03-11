'use client'

import { useRef, useState } from 'react'
import { crochetSymbols } from '@/lib/symbols/crochet'
import { knittingSymbols } from '@/lib/symbols/knitting'
import type { SymbolDefinition } from '@/types/symbol'
import { useEditorStore } from '@/stores/useEditorStore'
import { useCustomSymbols } from '@/hooks/useCustomSymbols'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Plus, Trash2 } from 'lucide-react'
import { PRESET_COLORS } from '@/lib/colors'
import CustomSymbolUploadDialog from './CustomSymbolUploadDialog'

export default function SymbolPanel() {
  const [search, setSearch] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const { activePlacementSymbolId, setActivePlacementSymbolId, activeColor, setActiveColor } = useEditorStore()
  const { customSymbols, addCustomSymbol, deleteCustomSymbol } = useCustomSymbols()

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

  const renderList = (symbols: SymbolDefinition[], deletable = false) => {
    const filtered = search
      ? symbols.filter(
          (s) =>
            s.name.includes(search) ||
            s.nameEn.toLowerCase().includes(search.toLowerCase()) ||
            s.abbreviation.toLowerCase().includes(search.toLowerCase())
        )
      : symbols

    if (filtered.length === 0) {
      return (
        <div className="p-4 text-center text-xs text-muted-foreground">
          {deletable ? '커스텀 기호가 없습니다.' : '검색 결과가 없습니다.'}
        </div>
      )
    }

    return (
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {filtered.map((symbol) => (
            <div
              key={symbol.id}
              draggable
              onDragStart={(e) => handleDragStart(e, symbol)}
              onClick={() => handleSymbolClick(symbol)}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-md cursor-pointer select-none transition-colors group ${
                activePlacementSymbolId === symbol.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 ${
                activePlacementSymbolId === symbol.id
                  ? 'border-primary-foreground/30 bg-primary-foreground/10'
                  : 'border-border bg-background'
              }`}>
                <svg viewBox="0 0 30 30" className="w-5 h-5">
                  <path
                    d={symbol.svgPath}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{symbol.name}</div>
                <div className="text-xs opacity-60">{symbol.abbreviation}</div>
              </div>
              {deletable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteCustomSymbol(symbol.id)
                    if (activePlacementSymbolId === symbol.id) setActivePlacementSymbolId(null)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                  title="기호 삭제"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="w-60 border-r bg-card flex flex-col h-full shrink-0">
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="기호 검색..."
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Color palette */}
      <div className="px-3 py-2 border-b shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">배치 색상</span>
          <div
            className="w-5 h-5 rounded border border-border shadow-sm"
            style={{ backgroundColor: activeColor }}
          />
        </div>
        <div className="grid grid-cols-8 gap-1">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              title={color}
              onClick={() => setActiveColor(color)}
              className={`w-6 h-6 rounded border-2 transition-all ${
                activeColor === color
                  ? 'border-primary scale-110 shadow-sm'
                  : 'border-transparent hover:border-border'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <label
            title="사용자 정의 색상"
            className="w-6 h-6 rounded border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
          >
            <Plus className="w-3 h-3 text-muted-foreground" />
            <input
              ref={colorInputRef}
              type="color"
              className="sr-only"
              value={activeColor}
              onChange={(e) => setActiveColor(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="crochet"
        className="flex flex-col flex-1 overflow-hidden"
        onValueChange={() => setActivePlacementSymbolId(null)}
      >
        <TabsList className="w-full rounded-none border-b h-9 bg-transparent p-0 shrink-0">
          <TabsTrigger
            value="crochet"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none h-full text-xs"
          >
            코바늘
          </TabsTrigger>
          <TabsTrigger
            value="knitting"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none h-full text-xs"
          >
            대바늘
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none h-full text-xs"
          >
            커스텀
          </TabsTrigger>
        </TabsList>
        <TabsContent value="crochet" className="flex-1 overflow-hidden mt-0">
          {renderList(crochetSymbols)}
        </TabsContent>
        <TabsContent value="knitting" className="flex-1 overflow-hidden mt-0">
          {renderList(knittingSymbols)}
        </TabsContent>
        <TabsContent value="custom" className="flex flex-col flex-1 overflow-hidden mt-0">
          <div className="p-2 border-b shrink-0">
            <button
              onClick={() => setUploadOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 h-8 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              SVG 기호 업로드
            </button>
          </div>
          {renderList(customSymbols, true)}
        </TabsContent>
      </Tabs>

      <CustomSymbolUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onAdd={addCustomSymbol}
      />
    </div>
  )
}
