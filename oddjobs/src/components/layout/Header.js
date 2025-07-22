"use client"

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/theme/ThemeToggle'
// import toast from 'react-hot-toast'
import { toast } from 'sonner'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const loadingToast = toast.loading("Signing you out...")

    const { error } = await supabase.auth.signOut()

    toast.dismiss(loadingToast)

    if (!error) {
      toast.success("Signed out successfully.")
      router.push('/')
    } else {
      toast.error("Failed to sign out. Try again.")
      console.error("Sign out error:", error.message)
    }
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'OddJobs', href: '/jobs' },
    { name: 'Businesses', href: '/businesses' },
    { name: 'Items', href: '/items' },
  ]

  return (
    <header className="border-b bg-background/70 backdrop-blur-md z-50 sticky top-0">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            ODDJobs
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`${pathname === link.href ? 'text-primary font-medium' : 'text-muted-foreground'} hover:text-primary transition-colors`}
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <Link
                href="/jobs/myjobs"
                className={`${pathname === '/jobs/myjobs' ? 'text-primary font-medium' : 'text-muted-foreground'} hover:text-primary transition-colors`}
              >
                My Jobs
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
                <Button size="sm" onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
