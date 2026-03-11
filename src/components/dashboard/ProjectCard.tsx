'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import PatternThumbnail from './PatternThumbnail'
import type { PlacedSymbol } from '@/types/symbol'
import type { GridConfig } from '@/types/grid'
import { DEFAULT_GRID_CONFIG } from '@/types/grid'

interface ProjectCardProps {
  project: {
    id: string
    title: string
    updated_at: string
  }
  symbols?: PlacedSymbol[]
  gridConfig?: GridConfig
  onDelete: (id: string) => void
}

export default function ProjectCard({ project, symbols, gridConfig, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const timeAgo = getTimeAgo(project.updated_at)

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/editor/${project.id}`} className="block">
        <CardContent className="p-0">
          <div className="w-full h-36 bg-muted overflow-hidden">
            <PatternThumbnail
              symbols={symbols ?? []}
              gridConfig={gridConfig ?? DEFAULT_GRID_CONFIG}
              width={320}
              height={144}
            />
          </div>
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-sm font-medium truncate">{project.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{timeAgo} 수정</p>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="px-4 pb-3 pt-1">
        <div className="relative ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 bottom-8 z-20 w-36 bg-card border border-border rounded-md shadow-md py-1">
                <button
                  onClick={() => { setMenuOpen(false); onDelete(project.id) }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`
  return `${Math.floor(days / 30)}개월 전`
}
