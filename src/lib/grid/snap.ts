export function snapToGrid(
  pixelX: number,
  pixelY: number,
  cellSize: number
): { row: number; col: number } {
  return {
    col: Math.max(0, Math.floor(pixelX / cellSize)),
    row: Math.max(0, Math.floor(pixelY / cellSize)),
  }
}

export function gridToPixel(
  row: number,
  col: number,
  cellSize: number
): { x: number; y: number } {
  return {
    x: col * cellSize,
    y: row * cellSize,
  }
}
