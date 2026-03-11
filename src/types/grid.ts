export interface GridConfig {
  rows: number
  cols: number
  cellSize: number
  showRowNumbers: boolean
  showColNumbers: boolean
  patternType: 'flat' | 'round'
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  rows: 20,
  cols: 20,
  cellSize: 30,
  showRowNumbers: true,
  showColNumbers: true,
  patternType: 'flat',
}

export interface RepeatRegion {
  id: string
  startRow: number
  endRow: number
  startCol: number
  endCol: number
  count: number
}
