'use client'

import { Circle, Line, Text } from 'react-konva'
import type { GridConfig } from '@/types/grid'

interface GridOverlayProps {
  gridConfig: GridConfig
}

export default function GridOverlay({ gridConfig }: GridOverlayProps) {
  const { rows, cols, cellSize, showRowNumbers, showColNumbers, patternType } = gridConfig
  const width = cols * cellSize
  const height = rows * cellSize

  if (patternType === 'round') {
    const cx = width / 2
    const cy = height / 2
    const outerRadius = Math.min(width, height) / 2

    const elements: React.ReactNode[] = []

    // Concentric rings
    for (let i = 1; i <= rows; i++) {
      const r = (i / rows) * outerRadius
      elements.push(
        <Circle
          key={`ring-${i}`}
          x={cx}
          y={cy}
          radius={r}
          stroke={i === rows ? '#bbb' : '#ddd'}
          strokeWidth={i === rows ? 1 : 0.5}
          fill="transparent"
        />
      )
      // Round number labels (outside each ring, to the right)
      if (showRowNumbers) {
        elements.push(
          <Text
            key={`rl-${i}`}
            x={cx + r + 3}
            y={cy - 6}
            text={`${i}`}
            fontSize={9}
            fill="#aaa"
          />
        )
      }
    }

    // Radial dividing lines
    for (let i = 0; i < cols; i++) {
      const angle = (i / cols) * 2 * Math.PI - Math.PI / 2
      const endX = cx + outerRadius * Math.cos(angle)
      const endY = cy + outerRadius * Math.sin(angle)
      elements.push(
        <Line
          key={`ray-${i}`}
          points={[cx, cy, endX, endY]}
          stroke="#ddd"
          strokeWidth={0.5}
        />
      )
      // Col number labels around the outer edge
      if (showColNumbers) {
        const labelR = outerRadius + 14
        elements.push(
          <Text
            key={`cl-${i}`}
            x={cx + labelR * Math.cos(angle) - 8}
            y={cy + labelR * Math.sin(angle) - 6}
            text={`${i + 1}`}
            fontSize={9}
            fill="#aaa"
            align="center"
            width={16}
          />
        )
      }
    }

    return <>{elements}</>
  }

  // Flat pattern: rectangular grid
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
