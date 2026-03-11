import type { PlacedSymbol } from '@/types/symbol'
import type { GridConfig } from '@/types/grid'
import { DEFAULT_GRID_CONFIG } from '@/types/grid'
import { getSymbolDefinition } from '@/lib/symbols'

interface PatternThumbnailProps {
  symbols: PlacedSymbol[]
  gridConfig: GridConfig
  width?: number
  height?: number
}

export default function PatternThumbnail({
  symbols,
  gridConfig,
  width = 240,
  height = 144,
}: PatternThumbnailProps) {
  const { rows, cols } = gridConfig ?? DEFAULT_GRID_CONFIG
  const cellSize = Math.min(width / cols, height / rows)
  const totalW = cols * cellSize
  const totalH = rows * cellSize
  const ox = (width - totalW) / 2
  const oy = (height - totalH) / 2
  const scale = cellSize / 30

  const isEmpty = !symbols || symbols.length === 0

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block' }}
    >
      {/* Grid lines */}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={ox}
          y1={oy + i * cellSize}
          x2={ox + totalW}
          y2={oy + i * cellSize}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={ox + i * cellSize}
          y1={oy}
          x2={ox + i * cellSize}
          y2={oy + totalH}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      ))}

      {isEmpty ? (
        /* Placeholder text when no symbols */
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          fill="#9ca3af"
        >
          비어 있음
        </text>
      ) : (
        symbols.map((symbol) => {
          const def = getSymbolDefinition(symbol.symbolId)
          if (!def) return null
          const sx = ox + symbol.col * cellSize
          const sy = oy + symbol.row * cellSize
          const color = symbol.color ?? '#1f2937'
          return (
            <g key={symbol.id} transform={`translate(${sx}, ${sy}) scale(${scale})`}>
              <path
                d={def.svgPath}
                fill="none"
                stroke={color}
                strokeWidth={1.5 / scale}
              />
            </g>
          )
        })
      )}
    </svg>
  )
}
