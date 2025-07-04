"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function DashboardSettingsPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    visible: true,
    notificationsEnabled: false,
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) throw authError
        setUser(user)

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError
        setProfile(profile)
        setFormData({
          name: profile.name || "",
          email: user.email || "",
          visible: profile.visible ?? true,
          notificationsEnabled: profile.notifications_enabled ?? false,
        })
      } catch (err) {
        toast.error("Failed to load settings", { description: err.message })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleToggle = (id) => {
    setFormData((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return toast.error("Name is required")
    }

    try {
      setUpdating(true)

      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          visible: formData.visible,
          notifications_enabled: formData.notificationsEnabled,
        })
        .eq("id", user.id)

      if (error) throw error
      toast.success("Settings updated successfully!")
    } catch (err) {
      toast.error("Failed to update settings", { description: err.message })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={formData.email} disabled />
        </div>

        {/* Role (read-only) */}
        <div className="space-y-2">
          <Label>Account Role</Label>
          <div className="px-3 py-2 border rounded-md text-sm bg-muted text-muted-foreground">
            {profile?.role || "unknown"}
          </div>
        </div>

        {/* Visibility */}
        <div className="flex items-center justify-between border-t pt-6">
          <div>
            <Label>Profile Visibility</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, your profile is visible to others.
            </p>
          </div>
          <Switch
            checked={formData.visible}
            onCheckedChange={() => handleToggle("visible")}
          />
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between border-t pt-6">
          <div>
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Toggle notifications for job updates and system alerts.
            </p>
          </div>
          <Switch
            checked={formData.notificationsEnabled}
            onCheckedChange={() => handleToggle("notificationsEnabled")}
          />
        </div>

        {/* Save Button */}
        <Button className="w-full mt-6" onClick={handleSave} disabled={updating}>
          {updating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
