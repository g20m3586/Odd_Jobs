"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { Github } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Custom Components with Original Styling
const Card = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)

const CardHeader = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)

const CardTitle = ({ children, className = '' }) => (
  <h3 className={className}>{children}</h3>
)

const CardDescription = ({ children, className = '' }) => (
  <p className={className}>{children}</p>
)

const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)

const CardFooter = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)

const Separator = ({ className = '' }) => (
  <div className={className} />
)

const Alert = ({ variant = 'default', children }) => {
  return variant === 'destructive' ? (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {children}
    </div>
  ) : (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      {children}
    </div>
  )
}

const AlertTitle = ({ children }) => <strong>{children}</strong>
const AlertDescription = ({ children }) => <span>{children}</span>

const PasswordInput = ({ ...props }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        {...props}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
            <line x1="2" x2="22" y1="2" y2="22"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  )
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().min(6, { message: "Please enter a valid phone number" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(['customer', 'business']),
  termsAccepted: z.boolean().refine(val => val, {
    message: "You must accept the terms and conditions",
  }),
})

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'customer',
      termsAccepted: false,
    }
  })

  const handleSignup = async (values) => {
    setLoading(true)
    setError(null)
    setSuccessMessage('')

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            phone: values.phone,
            role: values.role
          }
        }
      })

      if (signUpError) throw signUpError

      setSuccessMessage('Account created! Please check your email to confirm your account.')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      
      if (error) throw error
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-2">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </CardDescription>
      </CardHeader>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <AlertDescription>✅ {successMessage}</AlertDescription>
        </Alert>
      )}

      {/* <div className="grid grid-cols-2 gap-2 mb-6">
        <Button 
          variant="outline" 
          onClick={() => handleSocialLogin('google')}
          disabled={loading}
        >
          <FcGoogle className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handleSocialLogin('github')}
          disabled={loading}
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div> */}

      <CardContent>
        <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...form.register("name")}
                required
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...form.register("email")}
                required
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                {...form.register("phone")}
                required
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                {...form.register("password")}
                required
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <Label>I am a:</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="customer"
                    name="role"
                    value="customer"
                    {...form.register("role")}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <Label htmlFor="customer">Customer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="business"
                    name="role"
                    value="business"
                    {...form.register("role")}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <Label htmlFor="business">Business</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                {...form.register("termsAccepted")}
              />
              <Label htmlFor="terms" className="text-sm font-medium leading-none">
                I accept the terms and conditions
              </Label>
            </div>
            {form.formState.errors.termsAccepted && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.termsAccepted.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="mt-4 p-4 bg-blue-100 border border-blue-300 text-blue-700 rounded text-sm">
        📩 Don`&#39t forget: Please check your inbox for a verification email from Supabase to activate your account.
      </CardFooter>
    </>
  )
}