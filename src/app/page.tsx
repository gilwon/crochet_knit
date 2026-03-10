import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <main className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">KnitCanvas</h1>
        <p className="text-lg text-gray-600 mb-8">
          그리면 도안이 되고, 쓰면 완성되는 전문 뜨개 편집 툴
        </p>
        <Link
          href="/editor"
          className="inline-block px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          에디터 시작하기
        </Link>
      </main>
    </div>
  )
}
