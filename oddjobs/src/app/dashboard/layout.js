export default function DashboardLayout({ children }) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              <a
                href="/dashboard"
                className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Overview
              </a>
              <a
                href="/dashboard/profile"
                className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Profile
              </a>
              <a
                href="/dashboard/jobs"
                className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                My Jobs
              </a>
            </nav>
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    )
  }