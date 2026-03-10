'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/login?message=이메일을 확인해주세요')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
            KnitCanvas
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            새 계정을 만들어보세요
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {error && (
            <div className="mb-5 px-3 py-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상"
                required
                minLength={8}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-white placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-1 transition-shadow"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
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
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-medium text-gray-950 hover:underline underline-offset-4">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
