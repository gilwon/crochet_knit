'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Stage, Layer } from 'react-konva'
import { useEditorStore } from '@/stores/useEditorStore'
import GridOverlay from './GridOverlay'
import SymbolRenderer from './SymbolRenderer'
import { snapToGrid } from '@/lib/grid/snap'

export default function Canvas() {
  const stageRef = useRef<ReturnType<typeof Stage> | null>(null)
  const {
    gridConfig,
    symbols,
    selectedIds,
    zoom,
    selectSymbols,
    clearSelection,
    moveSymbol,
    addSymbol,
    setZoom,
    activePlacementSymbolId,
    setActivePlacementSymbolId,
  } = useEditorStore()

  const { rows, cols, cellSize } = gridConfig
  const canvasWidth = cols * cellSize
  const canvasHeight = rows * cellSize
  const padding = 40

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const symbolId = e.dataTransfer.getData('symbolId')
      if (!symbolId) return

      const stageEl = stageRef.current
      if (!stageEl) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stage = (stageEl as any).getStage()
      const stageBox = stage.container().getBoundingClientRect()
      const stagePos = stage.position()

      const x = (e.clientX - stageBox.left - stagePos.x - padding * zoom) / zoom
      const y = (e.clientY - stageBox.top - stagePos.y - padding * zoom) / zoom

      const { row, col } = snapToGrid(x, y, cellSize)
      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        addSymbol({ symbolId, row, col, rotation: 0 })
      }
    },
    [addSymbol, cellSize, cols, rows, zoom]
  )

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom(zoom + delta)
      }
    },
    [zoom, setZoom]
  )

  const handleStageClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      const stage = e.target.getStage()
      if (e.target !== stage) return

      if (activePlacementSymbolId) {
        const pos = stage.getPointerPosition()
        if (pos) {
          const x = pos.x / zoom - padding
          const y = pos.y / zoom - padding
          const { row, col } = snapToGrid(x, y, cellSize)
          if (row >= 0 && row < rows && col >= 0 && col < cols) {
            addSymbol({ symbolId: activePlacementSymbolId, row, col, rotation: 0 })
          }
        }
        return
      }

      clearSelection()
    },
    [activePlacementSymbolId, addSymbol, cellSize, cols, rows, zoom, clearSelection]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePlacementSymbolId(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActivePlacementSymbolId])

  return (
    <div
      className={`flex-1 overflow-auto bg-gray-50 ${activePlacementSymbolId ? 'cursor-crosshair' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onWheel={handleWheel}
    >
      <Stage
        ref={stageRef as React.RefObject<never>}
        width={(canvasWidth + padding * 2) * zoom}
        height={(canvasHeight + padding * 2) * zoom}
        scaleX={zoom}
        scaleY={zoom}
        onClick={handleStageClick}
      >
        <Layer x={padding} y={padding}>
          <GridOverlay gridConfig={gridConfig} />
          {symbols.map((symbol) => (
            <SymbolRenderer
              key={symbol.id}
              symbol={symbol}
              cellSize={cellSize}
              isSelected={selectedIds.includes(symbol.id)}
              onSelect={(id) => selectSymbols([id])}
              onDragEnd={moveSymbol}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}
