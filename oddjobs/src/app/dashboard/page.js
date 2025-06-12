"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
import StatCard from '@/components/dashboard/StatCard'
import ActionCard from '@/components/dashboard/ActionCard'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profile)
      }
    }

    fetchData()
  }, [])

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
  
      {/* Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Profile Completeness" value="80%" />
        <StatCard title="My Jobs" value="12 Jobs" />
        <StatCard title="Account Type" value={profile.role} />
        <StatCard title="Last Login" value={new Date(user.last_sign_in_at).toLocaleDateString()} />
      </div>
  
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActionCard
          title="My Profile"
          description="Update your profile information"
          href="/dashboard/profile"
        />
        <ActionCard
          title="My Jobs"
          description="View and manage your jobs"
          href="/dashboard/my-jobs"
        />
      </div>
    </div>
  )
  
}