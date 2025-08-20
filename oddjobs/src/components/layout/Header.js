
"use client"

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/theme/ThemeToggle'
import { toast } from 'sonner'
import { 
  Home, 
  Briefcase, 
  Building2, 
  Package, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    { name: 'Home', href: '/', icon: Home },
    { name: 'OddJobs', href: '/jobs', icon: Briefcase },
    { name: 'Businesses', href: '/businesses', icon: Building2 },
    { name: 'Items', href: '/items', icon: Package },
  ]

  return (
    <>
      {/* Top Header - Desktop */}
      <header className="border-b bg-background/70 backdrop-blur-md z-50 sticky top-0 hidden md:block">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">
              ODDJobs
            </Link>

            <nav className="flex items-center gap-8">
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

      {/* Top Header - Mobile */}
      <header className="border-b bg-background/70 backdrop-blur-md z-50 sticky top-0 flex md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-bold text-lg">
              ODDJobs
            </Link>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-16 right-0 w-64 h-full bg-background border-l shadow-lg p-6 animate-in slide-in-from-right">
            <nav className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-3 ${pathname === link.href ? 'text-primary font-medium' : 'text-foreground'} hover:text-primary transition-colors`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                    {link.name}
                  </Link>
                )
              })}

              {user && (
                <Link
                  href="/jobs/myjobs"
                  className={`flex items-center gap-3 ${pathname === '/jobs/myjobs' ? 'text-primary font-medium' : 'text-foreground'} hover:text-primary transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Briefcase size={20} />
                  My Jobs
                </Link>
              )}

              <div className="border-t pt-6 mt-4">
                {user ? (
                  <div className="flex flex-col gap-4">
                    <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                      <User size={20} />
                      Dashboard
                    </Link>
                    <Button variant="outline" onClick={handleSignOut} className="justify-start gap-3">
                      <LogOut size={20} />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-40 p-2 md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navLinks.slice(0, 4).map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center p-2 rounded-lg ${pathname === link.href ? 'text-primary bg-primary/10' : 'text-muted-foreground'} transition-colors`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{link.name}</span>
              </Link>
            )
          })}
          
          {user ? (
            <Link
              href="/dashboard"
              className={`flex flex-col items-center p-2 rounded-lg ${pathname === '/dashboard' ? 'text-primary bg-primary/10' : 'text-muted-foreground'} transition-colors`}
            >
              <User size={20} />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className={`flex flex-col items-center p-2 rounded-lg ${pathname.startsWith('/auth') ? 'text-primary bg-primary/10' : 'text-muted-foreground'} transition-colors`}
            >
              <User size={20} />
              <span className="text-xs mt-1">Login</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}