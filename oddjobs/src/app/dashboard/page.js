"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
import StatCard from '@/components/dashboard/StatCard'
import ActionCard from '@/components/dashboard/ActionCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, Plus, Search } from 'lucide-react'
import { BriefcaseIcon, UserIcon } from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    jobCount: 0,
    applications: 0,
    earnings: 0,
    profileComplete: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          throw authError
        }
        
        setUser(user)

        if (user) {
          // Fetch profile first since other queries depend on it
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError) {
            throw profileError
          }

          setProfile(profile)
          
          // Initialize default values
          let jobCount = 0
          let applications = 0
          let earnings = 0

          // Fetch jobs count
          const { count: jobsCount } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
          jobCount = jobsCount || 0

          // Only fetch business-specific data if user is a business
          if (profile?.role === 'business') {
            const { count: appsCount } = await supabase
              .from('applications')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', user.id)
            applications = appsCount || 0

            const { data: payments } = await supabase
              .from('payments')
              .select('amount')
              .eq('recipient_id', user.id)
            earnings = payments?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
          }

          // Calculate profile completeness
          const completeFields = [
            profile?.name,
            profile?.email,
            profile?.phone
          ].filter(Boolean).length
          
          setStats({
            jobCount,
            applications,
            earnings,
            profileComplete: Math.round((completeFields / 3) * 100)
          })
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
          {error}
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (!user || !profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {profile.name}!</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Here is what is happening with your account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Profile Completeness" 
          value={`${stats.profileComplete}%`}
          icon="user-check"
          trend={stats.profileComplete > 80 ? "up" : stats.profileComplete > 50 ? "neutral" : "down"}
          variant={stats.profileComplete < 50 ? 'destructive' : stats.profileComplete < 80 ? 'warning' : 'success'}
        />
        <StatCard 
          title="My Jobs" 
          value={stats.jobCount}
          subtitle={stats.jobCount === 1 ? 'Job' : 'Jobs'}
          icon="briefcase"
          trend="up"
        />
        
        {profile.role === 'business' ? (
          <>
            <StatCard 
              title="Applications" 
              value={stats.applications}
              subtitle={stats.applications === 1 ? 'Application' : 'Applications'}
              icon="inbox"
              trend="up"
            />
            <StatCard 
              title="Total Earnings" 
              value={`$${stats.earnings.toFixed(2)}`}
              icon="dollar-sign"
              trend="up"
            />
          </>
        ) : (
          <>
            <StatCard 
              title="Account Type" 
              value={profile.role === 'business' ? 'Business' : 'Freelancer'} 
              icon="user"
            />
            <StatCard 
              title="Last Login" 
              value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'} 
              icon="clock"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          title="Complete Profile"
          description={`${stats.profileComplete}% completed - Finish your setup`}
          href="/dashboard/profile"
          icon="user"
          variant={stats.profileComplete < 50 ? 'destructive' : stats.profileComplete < 80 ? 'warning' : 'success'}
          actionText="Complete Now"
        />
        <ActionCard
          title={profile.role === 'business' ? "Post New Job" : "Browse Jobs"}
          description={profile.role === 'business' 
            ? "Create a new job listing" 
            : "Find available jobs"}
          href={profile.role === 'business' ? "/jobs/post" : "/jobs"}
          icon={profile.role === 'business' ? "plus" : "search"}
          actionText={profile.role === 'business' ? "Post Job" : "Browse"}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          <Button variant="ghost" className="text-blue-600 dark:text-blue-400">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
              <BriefcaseIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">New job posted</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
              <UserIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Profile updated</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}