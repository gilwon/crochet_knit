export interface SymbolDefinition {
  id: string
  name: string
  nameEn: string
  abbreviation: string
  category: 'crochet' | 'knitting'
  svgPath: string
  width: number
  height: number
}

export interface PlacedSymbol {
  id: string
  symbolId: string
  row: number
  col: number
  rotation: number
  color?: string
}
