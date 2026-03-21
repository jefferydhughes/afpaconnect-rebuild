'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionReady, setIsSessionReady] = useState(false)

  useEffect(() => {
    // Handle error params from Supabase (e.g. expired token)
    const error = searchParams.get('error_description') || searchParams.get('error')
    if (error) {
      toast.error(decodeURIComponent(error.replace(/\+/g, ' ')))
      router.push('/login')
      return
    }

    const code = searchParams.get('code')

    if (code) {
      // PKCE flow: exchange the code for a session first
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          toast.error('Invalid or expired reset link. Please request a new one.')
          router.push('/login')
        } else {
          setIsSessionReady(true)
          // Clean the code from the URL
          window.history.replaceState({}, '', '/reset-password')
        }
      })
    } else {
      // No code — check if there's already an active session (e.g. hash fragment flow)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          toast.error('Invalid or expired reset link. Please request a new one.')
          router.push('/login')
        } else {
          setIsSessionReady(true)
        }
      })
    }
  }, [supabase, router, searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      toast.success('Password updated successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-brand-cream">
        <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-brand-cream p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy">
              <span className="text-lg font-bold text-brand-gold">A</span>
            </div>
            <span className="text-xl font-bold text-brand-navy">AFPA</span>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Set new password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    minLength={8}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    minLength={8}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Must be at least 8 characters</p>
              </div>
              <Button
                type="submit"
                className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-brand-cream">
        <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
