import { Group, Rect, Text } from 'react-konva'
import type { RepeatRegion } from '@/types/grid'

const REGION_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6',
]

interface RepeatOverlayProps {
  repeatRegions: RepeatRegion[]
  cellSize: number
}

export default function RepeatOverlay({ repeatRegions, cellSize }: RepeatOverlayProps) {
  return (
    <>
      {repeatRegions.map((region, i) => {
        const color = REGION_COLORS[i % REGION_COLORS.length]
        const x = region.startCol * cellSize
        const y = region.startRow * cellSize
        const w = (region.endCol - region.startCol + 1) * cellSize
        const h = (region.endRow - region.startRow + 1) * cellSize

        return (
          <Group key={region.id} listening={false}>
            <Rect x={x} y={y} width={w} height={h} fill={color} opacity={0.08} />
            <Rect
              x={x + 1} y={y + 1} width={w - 2} height={h - 2}
              stroke={color} strokeWidth={1.5} dash={[4, 3]} fill="transparent"
            />
            <Text
              x={x + 3} y={y + 2}
              text={`×${region.count}`}
              fontSize={10} fontStyle="bold" fill={color}
            />
          </Group>
        )
      })}
    </>
  )
}
