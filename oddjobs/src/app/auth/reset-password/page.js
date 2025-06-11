"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, LockKeyhole } from 'lucide-react'
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [accessToken, setAccessToken] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const token = params.get('access_token')
    const type = params.get('type')

    if (type === 'recovery' && token) {
      setAccessToken(token)
      window.history.replaceState({}, document.title, window.location.pathname)
    } else {
      toast.error('Invalid or expired link', {
        description: 'Please request a new password reset link',
        action: {
          label: 'Get new link',
          onClick: () => router.push('/auth/forgot-password')
        }
      })
      router.push('/auth/forgot-password')
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    toast.dismiss()

    // Validate password
    if (password.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters'
      })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure both passwords match'
      })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      }, {
        accessToken
      })

      if (error) throw error

      // Visual success state
      setSuccess(true)
      toast.success('Password updated!', {
        description: 'You can now sign in with your new password',
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      })
    } catch (error) {
      toast.error('Failed to update password', {
        description: error.message.includes('expired') 
          ? 'This link has expired. Please request a new one.'
          : error.message,
        action: error.message.includes('expired') 
          ? {
              label: 'Get new link',
              onClick: () => router.push('/auth/forgot-password')
            }
          : undefined
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen py-12 max-w-md">
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Password updated!</h1>
          <p className="text-muted-foreground">
            Your password has been successfully updated.
          </p>
          <Button asChild className="w-full mt-6">
            <Link href="/auth/login">
              Continue to login
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 max-w-md">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <LockKeyhole className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">Create new password</h1>
          <p className="text-muted-foreground">
            Your new password must be different from previous passwords
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Must be at least 6 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : 'Reset password'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="text-primary underline font-medium">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}