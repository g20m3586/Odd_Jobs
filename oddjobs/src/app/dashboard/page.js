"use client"

import Link from 'next/link'
import { useEffect, useState } from "react"
import { supabase } from "@/lib/client"
import StatCard from "@/components/dashboard/StatCard"
import ActionCard from "@/components/dashboard/ActionCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
// Fix imports at the top:
import { useRouter } from "next/navigation"
import { 
  ArrowRight, 
  Plus, 
  Search, 
  RefreshCw, 
  ChevronRight, 
} from "lucide-react"

// Remove the duplicate ArrowRight from Heroicons imports
import {
  BriefcaseIcon,
  UserIcon,
  InboxIcon,
  CurrencyDollarIcon,
  ClockIcon,
  EyeIcon
} from "@heroicons/react/24/outline"

const activityTypeMap = {
  job_posted: {
    icon: BriefcaseIcon,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    label: "New job posted",
  },
  profile_updated: {
    icon: UserIcon,
    bgColor: "bg-green-50 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
    label: "Profile updated",
  },
  application_submitted: {
    icon: InboxIcon,
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    label: "Application submitted",
  },
  job_viewed: {
    icon: EyeIcon,
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    label: "Job viewed",
  },
  default: {
    icon: ClockIcon,
    bgColor: "bg-gray-50 dark:bg-gray-700/20",
    iconColor: "text-gray-600 dark:text-gray-400",
    label: "Activity",
  }
}

function timeAgoFromNow(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""} ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? "s" : ""} ago`
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    jobCount: 0,
    applications: 0,
    earnings: 0,
    profileComplete: 0,
  })
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) throw authError
      setUser(user)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError || !profile) throw profileError
      setProfile(profile)

      const [{ count: jobCount }, appsRes, paymentsRes] = await Promise.all([
        supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),

        profile.role === "business"
          ? supabase
              .from("applications")
              .select("*", { count: "exact", head: true })
              .eq("business_id", user.id)
          : supabase
              .from("applications")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id),

        profile.role === "business"
          ? supabase
              .from("payments")
              .select("amount")
              .eq("recipient_id", user.id)
          : supabase
              .from("payments")
              .select("amount")
              .eq("user_id", user.id),
      ])

      const earnings = paymentsRes.data?.reduce(
        (acc, cur) => acc + (cur.amount || 0),
        0
      ) || 0

const completeFields = [
  profile.name,
  profile.email,
  profile.phone,
  profile.avatar_url,
  profile.location,
  profile.bio,
  // add any additional fields here
].filter(Boolean)

const totalFields = 7
const profileComplete = Math.round((completeFields.length / totalFields) * 100)

setStats({
  jobCount: jobCount || 0,
  applications: appsRes.count || 0,
  earnings,
  profileComplete, // ✅ clean and working
})


      const { data: recentActivity } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      setActivities(recentActivity || [])
    } catch (err) {
      console.error(err)
      setError("Failed to load dashboard. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border">
          {error}
        </div>
        <Button onClick={fetchDashboardData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile.name}!
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Here’s your snapshot overview.
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" className="text-sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

{/* Stats */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Profile Completeness (static) */}
  
<Link href="/dashboard/profile" className="block">
  <StatCard
    title="Profile Completeness"
    value={`${stats.profileComplete}%`}
    icon="User"
    trend={
      stats.profileComplete > 80 ? "up" : stats.profileComplete > 50 ? "neutral" : "down"
    }
    variant={
      stats.profileComplete < 50
        ? "destructive"
        : stats.profileComplete < 80
        ? "warning"
        : "success"
    }
  />
</Link>

  {/* My Jobs (clickable) */}
  <Link href="/dashboard/my-jobs" className="block">
    <StatCard
      title="My Jobs"
      value={stats.jobCount}
      subtitle="Open Listings"
      icon="Briefcase"
      trend="up"
    />
  </Link>

  {/* Applications (clickable) */}
  <Link href="/dashboard/applications" className="block">
    <StatCard
      title="Applications"
      value={stats.applications}
      subtitle={profile.role === "business" ? "Received" : "Submitted"}
      icon="Inbox"
      trend="up"
    />
  </Link>

  {/* Earnings (static) */}
  <StatCard
    title="Earnings"
    value={`$${stats.earnings.toFixed(2)}`}
    icon="DollarSign"
    trend="up"
  />
</div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          title="Complete Your Profile"
          description="Complete your setup to get better visibility"
          href="/dashboard/profile"
          icon="User"
          variant={
            stats.profileComplete < 50
              ? "destructive"
              : stats.profileComplete < 80
              ? "warning"
              : "success"
          }
        />
        <ActionCard
          title={profile.role === "business" ? "Post a New Job" : "Find Jobs"}
          description={
            profile.role === "business"
              ? "List a job and receive applications"
              : "Explore jobs that match your skillset"
          }
          href={profile.role === "business" ? "/jobs/post" : "/jobs"}
          icon={profile.role === "business" ? "Plus" : "Search"}
        />
      </div>



{/* Activity */}
<section className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
    <Button 
      variant="ghost" 
      className="text-blue-600 dark:text-blue-400"
      onClick={() => router.push('/dashboard/activity')}
    >
      View All <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
  <div className="space-y-4">
    {activities.length === 0 ? (
      <p className="text-sm text-muted-foreground">No recent activity</p>
    ) : (
      activities.map((activity) => {
        const typeInfo = activityTypeMap[activity.type] || activityTypeMap.default
        const Icon = typeInfo.icon
        const timeAgo = timeAgoFromNow(activity.created_at)

        return (
          <Link 
            key={activity.id} 
            href={`/dashboard/activity/${activity.id}`}
            className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className={`${typeInfo.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-5 w-5 ${typeInfo.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.description || typeInfo.label}
                </p>
                <p className="text-sm text-muted-foreground">{timeAgo}</p>
                {activity.metadata && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {JSON.stringify(activity.metadata)}
                  </div>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
        )
      })
    )}
  </div>
</section>
    </div>
  )
}
