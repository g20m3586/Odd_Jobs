"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function DashboardSettingsPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [formDisabled, setFormDisabled] = useState(true) // New state for disabling form
  const [showModal, setShowModal] = useState(true) // New state for modal visibility
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    visible: true,
    notificationsEnabled: false,
  })
  const [emailPreferences, setEmailPreferences] = useState({
    jobUpdates: false,
    newsletters: false,
    promotions: false,
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

        if (profile.email_preferences) {
          setEmailPreferences(profile.email_preferences)
        }
      } catch (err) {
        toast.error("Failed to load settings", { description: err.message })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e) => {
    if (formDisabled) return
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleToggle = (id) => {
    if (formDisabled) return
    setFormData((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleEmailPreferenceChange = (preference) => {
    if (formDisabled) return
    setEmailPreferences((prev) => ({
      ...prev,
      [preference]: !prev[preference],
    }))
  }

  const sendTestEmail = async () => {
    if (formDisabled) return
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formData.email,
          subject: 'Test Email from Your App',
          html: '<strong>This is a test email to confirm your notification settings are working!</strong>',
        }),
      })

      if (!response.ok) throw new Error('Failed to send test email')
      toast.success('Test email sent successfully!')
    } catch (err) {
      toast.error('Failed to send test email', { description: err.message })
    }
  }

  const handleSave = async () => {
    if (formDisabled) return
    if (!formData.name.trim()) {
      return toast.error("Name is required")
    }

    try {
      setUpdating(true)

      const updates = {
        name: formData.name,
        visible: formData.visible,
        notifications_enabled: formData.notificationsEnabled,
        email_preferences: emailPreferences,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)

      if (error) throw error

      if (formData.notificationsEnabled && !profile?.notifications_enabled) {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: formData.email,
            subject: 'Notifications Enabled',
            html: `<p>Hello ${formData.name},</p>
                  <p>You've successfully enabled email notifications for your account.</p>
                  <p>You'll receive updates about important events and activities.</p>`,
          }),
        })
      }

      toast.success("Settings updated successfully!")
    } catch (err) {
      toast.error("Failed to update settings", { description: err.message })
    } finally {
      setUpdating(false)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setFormDisabled(true) // Keep form disabled after closing modal
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
    <div className={`max-w-2xl mx-auto py-10 px-4 space-y-8 ${showModal ? 'blur-sm' : ''}`}>
      {/* Under Construction Modal */}
      <Dialog open={showModal} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Feature Under Construction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-center text-muted-foreground">
              This settings section is still in development. All fields will be disabled.
            </p>
            <div className="flex justify-center">
              <Button onClick={handleModalClose}>I Understand</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disabled Notice */}
      {!showModal && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                All fields are currently disabled as this section is under development.
              </p>
            </div>
          </div>
        </div>
      )}

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
            disabled={formDisabled}
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
            disabled={formDisabled}
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
            disabled={formDisabled}
          />
        </div>

        {/* Email Preferences */}
        {formData.notificationsEnabled && (
          <div className="space-y-4 border-t pt-6">
            <Label>Email Preferences</Label>
            <p className="text-sm text-muted-foreground">
              Customize the types of emails you receive.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Job Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    New job postings and application updates.
                  </p>
                </div>
                <Switch
                  checked={emailPreferences.jobUpdates}
                  onCheckedChange={() => handleEmailPreferenceChange("jobUpdates")}
                  disabled={formDisabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Newsletters</Label>
                  <p className="text-sm text-muted-foreground">
                    Weekly tips and industry news.
                  </p>
                </div>
                <Switch
                  checked={emailPreferences.newsletters}
                  onCheckedChange={() => handleEmailPreferenceChange("newsletters")}
                  disabled={formDisabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Promotions</Label>
                  <p className="text-sm text-muted-foreground">
                    Special offers and discounts.
                  </p>
                </div>
                <Switch
                  checked={emailPreferences.promotions}
                  onCheckedChange={() => handleEmailPreferenceChange("promotions")}
                  disabled={formDisabled}
                />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={sendTestEmail}
              className="mt-4"
              disabled={formDisabled}
            >
              Send Test Email
            </Button>
          </div>
        )}

        {/* Save Button */}
        <Button 
          className="w-full mt-6" 
          onClick={handleSave} 
          disabled={updating || formDisabled}
        >
          {updating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}