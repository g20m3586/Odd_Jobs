"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
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
    <div>
      <h2 className="text-xl font-semibold mb-4">Welcome back, {profile.name}!</h2>
      <p className="text-muted-foreground mb-6">
        You are logged in as a {profile.role}.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">My Profile</h3>
          <p className="text-sm text-muted-foreground">
            Update your profile information
          </p>
          <Button className="mt-4" asChild>
            <a href="/dashboard/profile">Edit Profile</a>
          </Button>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">My Jobs</h3>
          <p className="text-sm text-muted-foreground">
            View and manage your jobs
          </p>
          <Button className="mt-4" asChild>
            <a href="/dashboard/jobs">View Jobs</a>
          </Button>
        </div>
      </div>
    </div>
  )
}