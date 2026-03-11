'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getProjects, createProject, deleteProject } from '@/lib/supabase/projects'
import ProjectCard from '@/components/dashboard/ProjectCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import type { PlacedSymbol } from '@/types/symbol'
import type { GridConfig } from '@/types/grid'

interface ProjectSummary {
  id: string
  title: string
  updated_at: string
  symbols: PlacedSymbol[]
  grid_config: GridConfig
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const loadProjects = async () => {
    const { data } = await getProjects()
    setProjects((data as ProjectSummary[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    loadProjects()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    const { data, error } = await createProject('새 도안')
    if (error) {
      console.error('[createProject]', error)
      alert(`도안 생성 실패: ${error.message}`)
      return
    }
    if (data) router.push(`/editor/${data.id}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 도안을 삭제하시겠습니까?')) return
    await deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight">KnitCanvas</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </header>

      <Separator />

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">내 도안</h2>
          <Button onClick={handleCreate} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            새 도안 만들기
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            불러오는 중...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground text-sm">아직 도안이 없습니다.</p>
            <Button variant="outline" size="sm" onClick={handleCreate}>
              첫 도안 만들기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                symbols={project.symbols}
                gridConfig={project.grid_config}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
