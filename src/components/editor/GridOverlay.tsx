'use client'

import { Line, Text } from 'react-konva'
import type { GridConfig } from '@/types/grid'

interface GridOverlayProps {
  gridConfig: GridConfig
}

export default function GridOverlay({ gridConfig }: GridOverlayProps) {
  const { rows, cols, cellSize, showRowNumbers, showColNumbers } = gridConfig
  const width = cols * cellSize
  const height = rows * cellSize

  const lines = []
  // Vertical lines
  for (let i = 0; i <= cols; i++) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i * cellSize, 0, i * cellSize, height]}
        stroke="#ddd"
        strokeWidth={i === 0 ? 1.5 : 0.5}
      />
    )
  }
  // Horizontal lines
  for (let i = 0; i <= rows; i++) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i * cellSize, width, i * cellSize]}
        stroke="#ddd"
        strokeWidth={i === 0 ? 1.5 : 0.5}
      />
    )
  }

  const labels = []
  // Row numbers (단수)
  if (showRowNumbers) {
    for (let i = 0; i < rows; i++) {
      labels.push(
        <Text
          key={`r-${i}`}
          x={-24}
          y={i * cellSize + cellSize / 2 - 6}
          text={`${i + 1}`}
          fontSize={10}
          fill="#999"
          align="right"
          width={20}
        />
      )
    }
  }
  // Col numbers (코수)
  if (showColNumbers) {
    for (let i = 0; i < cols; i++) {
      labels.push(
        <Text
          key={`c-${i}`}
          x={i * cellSize}
          y={-16}
          text={`${i + 1}`}
          fontSize={10}
          fill="#999"
          align="center"
          width={cellSize}
        />
      )
    }
  }

  return (
    <>
      {lines}
      {labels}
    </>
  )
}
