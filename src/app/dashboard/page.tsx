'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getProjects, createProject, deleteProject } from '@/lib/supabase/projects'
import ProjectCard from '@/components/dashboard/ProjectCard'

interface ProjectSummary {
  id: string
  title: string
  updated_at: string
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
    const { data } = await createProject('새 도안')
    if (data) {
      router.push(`/editor/${data.id}`)
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">KnitCanvas</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">내 도안</h2>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            + 새 도안 만들기
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">불러오는 중...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">아직 도안이 없습니다.</p>
            <button
              onClick={handleCreate}
              className="text-blue-600 hover:underline text-sm"
            >
              첫 도안 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
