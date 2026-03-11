'use client'

import { useMemo, useState } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'
import { toWritten } from '@/lib/written/converter'
import type { RepeatRegion } from '@/types/grid'

function isRowInRepeat(rowNum: number, region: RepeatRegion) {
  return rowNum >= region.startRow + 1 && rowNum <= region.endRow + 1
}

export default function WrittenView() {
  const symbols       = useEditorStore((s) => s.symbols)
  const gridConfig    = useEditorStore((s) => s.gridConfig)
  const repeatRegions = useEditorStore((s) => s.repeatRegions)
  const [lang, setLang] = useState<'ko' | 'en'>('ko')

  const writtenRows = useMemo(
    () => toWritten(symbols, gridConfig, lang),
    [symbols, gridConfig, lang]
  )

  const rowLabel = (n: number) => {
    if (lang === 'en') return `${gridConfig.patternType === 'round' ? 'Rnd' : 'Row'} ${n}:`
    return `${n}${gridConfig.patternType === 'round' ? '라운드' : '단'}:`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          서술형 도안
        </h3>
        <div className="flex rounded-md border overflow-hidden text-xs">
          <button
            onClick={() => setLang('ko')}
            className={`px-2 py-0.5 transition-colors ${
              lang === 'ko' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            KO
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-0.5 transition-colors ${
              lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            EN
          </button>
        </div>
      </div>
      {writtenRows.length === 0 ? (
        <p className="text-xs text-muted-foreground leading-relaxed">
          캔버스에 기호를 배치하면 서술형 텍스트가 자동으로 생성됩니다.
        </p>
      ) : (
        <div className="space-y-1.5">
          {writtenRows.map((row) => {
            const repeat = repeatRegions.find((r) => isRowInRepeat(row.rowNumber, r))
            const isRepeatStart = repeat && row.rowNumber === repeat.startRow + 1
            const isRepeatEnd   = repeat && row.rowNumber === repeat.endRow + 1
            return (
              <div key={row.rowNumber} className="text-sm leading-snug">
                {isRepeatStart && (
                  <div className="text-xs text-blue-500 font-medium mb-0.5">
                    {lang === 'en' ? `[Repeat ×${repeat!.count}]` : `[반복 ×${repeat!.count}]`}
                  </div>
                )}
                <div className={repeat ? 'pl-2 border-l-2 border-blue-300' : ''}>
                  <span className="font-semibold text-foreground">
                    {rowLabel(row.rowNumber)}
                  </span>{' '}
                  <span className="text-muted-foreground">{row.instructions}</span>
                </div>
                {isRepeatEnd && (
                  <div className="text-xs text-blue-500 font-medium mt-0.5">
                    {lang === 'en' ? `[End repeat]` : `[반복 끝]`}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
