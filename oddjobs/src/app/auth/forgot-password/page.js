"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { MailCheck, Loader2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleReset = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Email required', {
        description: 'Please enter your email address'
      })
      return
    }
    
    setLoading(true)
    toast.dismiss() // Clear any existing toasts

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error

      // Visual success state
      setSuccess(true)
      toast.success('Check your email', {
        description: (
          <div className="flex flex-col gap-1">
            <p>We have sent a password reset link to <span className="font-semibold">{email}</span></p>
            <p className="text-sm text-muted-foreground">
              Didnt receive it? Check spam or <button 
                onClick={() => handleReset(e)} 
                className="text-primary underline"
              >
                resend
              </button>
            </p>
          </div>
        ),
        duration: 10000,
        icon: <MailCheck className="w-5 h-5 text-green-500" />,
      })
    } catch (error) {
      toast.error('Could not send reset link', {
        description: (
          <div>
            <p>{error.message}</p>
            {error.message.includes('email') && (
              <p className="text-sm mt-1">Need to <Link href="/auth/signup" className="text-primary underline">create an account</Link>?</p>
            )}
          </div>
        ),
        action: {
          label: 'Try again',
          onClick: () => handleReset(e)
        }
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
            <MailCheck className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Email sent!</h1>
          <p className="text-muted-foreground">
            We sent a password reset link to <span className="font-medium text-foreground">{email}</span>
          </p>
          <div className="pt-4">
            <Button 
              onClick={() => {
                setSuccess(false)
                setEmail('')
              }}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            Didnt receive the email? Check your spam folder or{' '}
            <button 
              onClick={handleReset}
              className="text-primary underline font-medium"
            >
              resend
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 max-w-md">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email to receive a reset link
          </p>
        </div>
        
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : 'Send reset link'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-primary underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}