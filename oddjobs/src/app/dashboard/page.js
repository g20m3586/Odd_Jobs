"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
import StatCard from '@/components/dashboard/StatCard'
import ActionCard from '@/components/dashboard/ActionCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

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
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="text-destructive p-4 rounded-lg border border-destructive">
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back, {profile.name}!</h2>
        <p className="text-muted-foreground">
          You are logged in as <span className="font-medium">{profile.role}</span>.
        </p>
      </div>
  
      {/* Dynamic Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Profile Completeness" 
          value={`${stats.profileComplete}%`}
          icon="user-check"
          variant={stats.profileComplete < 50 ? 'destructive' : stats.profileComplete < 80 ? 'warning' : 'default'}
        />
        <StatCard 
          title="My Jobs" 
          value={`${stats.jobCount} ${stats.jobCount === 1 ? 'Job' : 'Jobs'}`} 
          icon="briefcase"
        />
        
        {profile.role === 'business' ? (
          <>
            <StatCard 
              title="Applications" 
              value={`${stats.applications} ${stats.applications === 1 ? 'Application' : 'Applications'}`}
              icon="inbox"
            />
            <StatCard 
              title="Total Earnings" 
              value={`$${stats.earnings.toFixed(2)}`}
              icon="dollar-sign"
            />
          </>
        ) : (
          <>
            <StatCard 
              title="Account Type" 
              value={profile.role} 
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActionCard
          title="Complete Profile"
          description={`${stats.profileComplete}% completed - Finish your setup`}
          href="/dashboard/profile"
          variant={stats.profileComplete < 50 ? 'destructive' : stats.profileComplete < 80 ? 'warning' : 'default'}
        />
        <ActionCard
          title={profile.role === 'business' ? "Post New Job" : "Browse Jobs"}
          description={profile.role === 'business' 
            ? "Create a new job listing" 
            : "Find available jobs"}
          href={profile.role === 'business' ? "/jobs/post" : "/jobs"}
        />
      </div>
    </div>
  )
}