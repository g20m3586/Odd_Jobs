
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  UserIcon,
  BriefcaseIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  InboxArrowDownIcon,
} from "@heroicons/react/24/outline"
import { supabase } from "@/lib/client"

const navItems = [
  { name: "Overview", href: "/dashboard", icon: HomeIcon },
  { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { name: "My Jobs", href: "/dashboard/my-jobs", icon: BriefcaseIcon },
  { name: "Applications", href: "/dashboard/applications", icon: DocumentTextIcon },
  { name: "Received Apps", href: "/dashboard/received-applications", icon: InboxArrowDownIcon },
  { name: "Analytics", href: "/dashboard/analytics", icon: ChartBarIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
]

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError
        if (!user) return

        setUser(user)

        // Get the user's profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        setProfile(profile)

      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    }
  }, [pathname])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64
          bg-white dark:bg-gray-800
          transform transition-all duration-300 ease-in-out
          z-30
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0
          flex flex-col border-r border-gray-200 dark:border-gray-700
        `}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <Link href="/dashboard">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
              <span className="text-blue-600">ODD</span>Jobs
            </h2>
          </Link>
          <button
            className="md:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href || 
                           (href !== "/dashboard" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mx-1
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
              >
                <Icon
                  className={`
                    mr-3 flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 transition-colors
                    ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                    }`}
                  aria-hidden="true"
                />
                <span className="truncate">{name}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User profile section */}
        <div className="px-3 sm:px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="space-y-1.5 sm:space-y-2">
                <div className="h-2.5 w-20 sm:w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                <div className="h-2 w-24 sm:w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 dark:bg-gray-600 flex items-center justify-center">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-gray-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                  {profile?.name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'No email'}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top nav with hamburger */}
        <header className="md:hidden flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3">
          <button
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[50vw]">
            {navItems.find(item => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)))?.name || 'Dashboard'}
          </h1>
          
          <div className="w-6" /> {/* placeholder for right side */}
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto w-full">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:h-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  )
}