'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  // const handleGoogleLogin = async () => {
  //   await supabase.auth.signInWithOAuth({
  //     provider: 'google',
  //     options: { redirectTo: `${window.location.origin}/auth/callback` },
  //   })
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
            KnitCanvas
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            계정에 로그인하세요
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {error && (
            <div className="mb-5 px-3 py-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-white placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-1 transition-shadow"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-white placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-1 transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 px-4 text-sm font-medium text-white bg-gray-950 hover:bg-gray-800 disabled:opacity-50 rounded-md transition-colors"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* Google login — disabled until OAuth is configured */}
          {/* <div className="my-4 flex items-center gap-3">
            <div className="flex-1 border-t border-gray-100" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="flex-1 border-t border-gray-100" />
          </div>
          <button
            onClick={handleGoogleLogin}
            className="w-full h-9 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Google로 로그인
          </button> */}
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="font-medium text-gray-950 hover:underline underline-offset-4">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
