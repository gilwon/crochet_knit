import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { PlacedSymbol } from '@/types/symbol'
import type { GridConfig } from '@/types/grid'
import { DEFAULT_GRID_CONFIG } from '@/types/grid'

interface EditorState {
  projectId: string | null
  title: string
  gridConfig: GridConfig
  symbols: PlacedSymbol[]
  selectedIds: string[]
  clipboard: PlacedSymbol[]
  past: PlacedSymbol[][]
  future: PlacedSymbol[][]
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error'
  zoom: number
  activePlacementSymbolId: string | null

  addSymbol: (symbol: Omit<PlacedSymbol, 'id'>) => void
  removeSymbols: (ids: string[]) => void
  moveSymbol: (id: string, row: number, col: number) => void
  rotateSymbol: (id: string) => void
  selectSymbols: (ids: string[]) => void
  clearSelection: () => void
  copySelected: () => void
  pasteSymbols: () => void
  undo: () => void
  redo: () => void
  setTitle: (title: string) => void
  setGridConfig: (config: Partial<GridConfig>) => void
  setZoom: (zoom: number) => void
  setSaveStatus: (status: EditorState['saveStatus']) => void
  setActivePlacementSymbolId: (id: string | null) => void
  loadProject: (data: {
    id: string
    title: string
    gridConfig: GridConfig
    symbols: PlacedSymbol[]
  }) => void
  clear: () => void
}

const MAX_HISTORY = 50

function pushHistory(state: EditorState): Partial<EditorState> {
  const past = [...state.past, state.symbols].slice(-MAX_HISTORY)
  return { past, future: [] }
}

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  title: '새 도안',
  gridConfig: DEFAULT_GRID_CONFIG,
  symbols: [],
  selectedIds: [],
  clipboard: [],
  past: [],
  future: [],
  saveStatus: 'saved',
  zoom: 1,
  activePlacementSymbolId: null,

  addSymbol: (symbol) =>
    set((state) => {
      // 동일 셀에 이미 기호가 있으면 교체
      const filtered = state.symbols.filter(
        (s) => !(s.row === symbol.row && s.col === symbol.col)
      )
      const newSymbol: PlacedSymbol = { ...symbol, id: uuidv4() }
      return {
        ...pushHistory(state),
        symbols: [...filtered, newSymbol],
        saveStatus: 'unsaved',
      }
    }),

  removeSymbols: (ids) =>
    set((state) => ({
      ...pushHistory(state),
      symbols: state.symbols.filter((s) => !ids.includes(s.id)),
      selectedIds: [],
      saveStatus: 'unsaved',
    })),

  moveSymbol: (id, row, col) =>
    set((state) => {
      // 이동 대상 셀에 다른 기호가 있으면 교체
      const filtered = state.symbols.filter(
        (s) => s.id === id || !(s.row === row && s.col === col)
      )
      return {
        ...pushHistory(state),
        symbols: filtered.map((s) =>
          s.id === id ? { ...s, row, col } : s
        ),
        saveStatus: 'unsaved',
      }
    }),

  rotateSymbol: (id) =>
    set((state) => ({
      ...pushHistory(state),
      symbols: state.symbols.map((s) =>
        s.id === id ? { ...s, rotation: (s.rotation + 90) % 360 } : s
      ),
      saveStatus: 'unsaved',
    })),

  selectSymbols: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),

  copySelected: () =>
    set((state) => ({
      clipboard: state.symbols.filter((s) =>
        state.selectedIds.includes(s.id)
      ),
    })),

  pasteSymbols: () =>
    set((state) => {
      if (state.clipboard.length === 0) return state
      const newSymbols = state.clipboard.map((s) => ({
        ...s,
        id: uuidv4(),
        row: s.row + 1,
        col: s.col + 1,
      }))
      return {
        ...pushHistory(state),
        symbols: [...state.symbols, ...newSymbols],
        selectedIds: newSymbols.map((s) => s.id),
        saveStatus: 'unsaved',
      }
    }),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        symbols: previous,
        past: state.past.slice(0, -1),
        future: [state.symbols, ...state.future],
        saveStatus: 'unsaved',
      }
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        symbols: next,
        past: [...state.past, state.symbols],
        future: state.future.slice(1),
        saveStatus: 'unsaved',
      }
    }),

  setActivePlacementSymbolId: (id) => set({ activePlacementSymbolId: id }),

  setTitle: (title) => set({ title, saveStatus: 'unsaved' }),
  setGridConfig: (config) =>
    set((state) => ({
      gridConfig: { ...state.gridConfig, ...config },
      saveStatus: 'unsaved',
    })),
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(4, zoom)) }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),

  loadProject: ({ id, title, gridConfig, symbols }) =>
    set({
      projectId: id,
      title,
      gridConfig,
      symbols,
      selectedIds: [],
      past: [],
      future: [],
      saveStatus: 'saved',
      activePlacementSymbolId: null,
    }),

  clear: () =>
    set((state) => ({
      ...pushHistory(state),
      symbols: [],
      selectedIds: [],
      activePlacementSymbolId: null,
      saveStatus: 'unsaved',
    })),
}))
