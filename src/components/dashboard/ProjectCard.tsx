'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ProjectCardProps {
  project: {
    id: string
    title: string
    updated_at: string
  }
  onDelete: (id: string) => void
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const timeAgo = getTimeAgo(project.updated_at)

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <Link href={`/editor/${project.id}`} className="block p-4">
        {/* Thumbnail placeholder */}
        <div className="w-full h-32 bg-gray-100 rounded-md mb-3 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 9h16M9 4v16" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-800 truncate">
          {project.title}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{timeAgo} 수정</p>
      </Link>

      {/* Menu */}
      <div className="relative px-4 pb-3">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ...
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute bottom-8 left-4 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onDelete(project.id)
                }}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                삭제
              </button>
            </div>
          </>
        )}
      </div>
    </div>
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
