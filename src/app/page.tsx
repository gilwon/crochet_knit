'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">KnitCanvas</h1>
          <p className="text-muted-foreground text-lg">
            그리면 도안이 되고, 쓰면 완성되는 전문 뜨개 편집 툴
          </p>
        </div>
        <Link href="/dashboard" className={buttonVariants({ size: 'lg' })}>
          시작하기
        </Link>
      </main>
    </div>
  )
}
