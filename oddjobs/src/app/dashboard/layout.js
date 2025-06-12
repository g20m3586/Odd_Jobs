"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  UserIcon,
  BriefcaseIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

const navItems = [
  { name: "Overview", href: "/dashboard", icon: HomeIcon },
  { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { name: "My Jobs", href: "/dashboard/my-jobs", icon: BriefcaseIcon },
]

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64
          border-r border-gray-200 dark:border-gray-700
          transform md:translate-x-0 transition-transform duration-300 ease-in-out
          z-30
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0
          flex flex-col
        `}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h2>
          <button
            className="md:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <a
                key={href}
                href={href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
              >
                <Icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  }`}
                  aria-hidden="true"
                />
                {name}
              </a>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top nav with hamburger */}
        <header className="md:hidden flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <button
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <div /> {/* placeholder for right side */}
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
