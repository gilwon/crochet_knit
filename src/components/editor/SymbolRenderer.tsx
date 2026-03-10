'use client'

import { Group, Path, Rect } from 'react-konva'
import type { PlacedSymbol } from '@/types/symbol'
import { getSymbolDefinition } from '@/lib/symbols'
import { gridToPixel } from '@/lib/grid/snap'

interface SymbolRendererProps {
  symbol: PlacedSymbol
  cellSize: number
  isSelected: boolean
  onSelect: (id: string) => void
  onDragEnd: (id: string, row: number, col: number) => void
}

export default function SymbolRenderer({
  symbol,
  cellSize,
  isSelected,
  onSelect,
  onDragEnd,
}: SymbolRendererProps) {
  const def = getSymbolDefinition(symbol.symbolId)
  if (!def) return null

  const { x, y } = gridToPixel(symbol.row, symbol.col, cellSize)
  const w = def.width * cellSize
  const h = def.height * cellSize

  return (
    <Group
      x={x}
      y={y}
      width={w}
      height={h}
      draggable
      rotation={symbol.rotation}
      offsetX={symbol.rotation ? w / 2 : 0}
      offsetY={symbol.rotation ? h / 2 : 0}
      onClick={() => onSelect(symbol.id)}
      onTap={() => onSelect(symbol.id)}
      onDragEnd={(e) => {
        const stage = e.target.getStage()
        if (!stage) return
        const pos = e.target.position()
        const newCol = Math.max(0, Math.round(pos.x / cellSize))
        const newRow = Math.max(0, Math.round(pos.y / cellSize))
        // Snap back to grid
        e.target.position({
          x: newCol * cellSize,
          y: newRow * cellSize,
        })
        onDragEnd(symbol.id, newRow, newCol)
      }}
    >
      {/* Selection highlight */}
      {isSelected && (
        <Rect
          x={-2}
          y={-2}
          width={w + 4}
          height={h + 4}
          stroke="#3b82f6"
          strokeWidth={2}
          cornerRadius={2}
          dash={[4, 2]}
        />
      )}
      {/* Cell background */}
      <Rect
        x={0}
        y={0}
        width={w}
        height={h}
        fill="white"
        stroke="#e5e7eb"
        strokeWidth={0.5}
      />
      {/* Symbol SVG path */}
      <Path
        data={def.svgPath}
        fill="transparent"
        stroke="#1f2937"
        strokeWidth={2}
        scaleX={cellSize / 30}
        scaleY={(cellSize * def.height) / 30}
      />
    </Group>
  )
}
