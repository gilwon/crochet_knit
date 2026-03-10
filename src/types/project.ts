import type { GridConfig } from './grid'
import type { PlacedSymbol } from './symbol'

export interface Project {
  id: string
  user_id: string
  title: string
  grid_config: GridConfig
  symbols: PlacedSymbol[]
  created_at: string
  updated_at: string
}

export interface ProjectVersion {
  id: string
  project_id: string
  snapshot: {
    grid_config: GridConfig
    symbols: PlacedSymbol[]
  }
  label: string
  created_at: string
}
