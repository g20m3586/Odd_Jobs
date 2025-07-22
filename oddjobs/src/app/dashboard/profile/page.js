"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { supabase } from "@/lib/client"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Switch } from "@/components/ui/switch"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { debounce } from "lodash"


// Schema for form validation
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[0-9\s-]{6,}$/, "Invalid phone number").optional(),
  location: z.string().max(100, "Location too long").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  twitter: z.string().url("Invalid URL").or(z.literal("")).optional(),
  linkedin: z.string().url("Invalid URL").or(z.literal("")).optional(),
  is_public: z.boolean(),
  avatar_url: z.string().url("Invalid URL").optional()
})


// Add to ProfileService in profile.js
const ActivityService = {
  async getRecentActivities(userId, limit = 5) {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },
   async logActivity(userId, type, description, metadata = {}) {
    const { error } = await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        type,
        description,
        metadata,
        created_at: new Date().toISOString()
      })
    
    if (error) throw error
  }
}

// Services
const ProfileService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async updateProfile(userId, data) {
    const { error } = await supabase
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) throw new Error(error.message)
  },

  async uploadAvatar(userId, file) {
    const filePath = `avatars/${userId}-${Date.now()}-${file.name}`
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed')
    }

    if (file.size > maxSize) {
      throw new Error('Image must be less than 5MB')
    }

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw new Error("Image upload failed")

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath)

    return urlData.publicUrl
  }
  
}

// Custom Hooks
function useProfileData(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const data = await ProfileService.getProfile(userId)
      setProfile(data)
    } catch (err) {
      setError(err.message || "Failed to load profile")
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, error, refetch: fetchProfile }
}

// Components
const AvatarUpload = ({ avatarUrl, onUpload, userId }) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleImageUpload = async (file) => {
    if (!file) return

    try {
      setUploading(true)
      const publicUrl = await ProfileService.uploadAvatar(userId, file)
      onUpload(publicUrl)
      toast.success("Avatar updated successfully")
    } catch (err) {
      toast.error(err.message || "Avatar upload failed")
    } finally {
      setUploading(false)
      setDragActive(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    handleImageUpload(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer?.files?.[0]
    handleImageUpload(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative w-24 h-24 rounded-full overflow-hidden border shadow ${
          dragActive ? "ring-2 ring-blue-500" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
      >
        <img
          src={avatarUrl || "/default-avatar.jpg"}
          alt="User avatar"
          className="w-full h-full object-cover"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-sm">Uploading...</span>
          </div>
        )}
      </div>

      <div>
        <input
          id="avatar-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          aria-describedby="avatar-upload-help"
        />
        <Label htmlFor="avatar-upload" className="cursor-pointer inline-block">
          <Button variant="outline" disabled={uploading} asChild>
            <span>{uploading ? "Uploading..." : "Change Avatar"}</span>
          </Button>
        </Label>
        <p id="avatar-upload-help" className="text-xs text-muted-foreground mt-1">
          JPEG, PNG or WebP. Max 5MB. Or drag-and-drop.
        </p>
      </div>
    </div>
  )
}


const ProfileFormSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
    <Skeleton className="h-10 w-64" />
    <div className="flex items-center gap-4">
      <Skeleton className="w-24 h-24 rounded-full" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-5 w-16 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
    <div>
      <Skeleton className="h-5 w-16 mb-2" />
      <Skeleton className="h-32 w-full" />
    </div>
    <Skeleton className="h-10 w-32" />
  </div>
)

// Main Component
export default function ProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const { profile, loading, error, refetch } = useProfileData(userId)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty: formIsDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: "onChange"
  })

  const formData = watch()

  // Set form values when profile loads
  useEffect(() => {
    if (profile) {
      reset(profile)
    }
  }, [profile, reset])

  // Track dirty state
  useEffect(() => {
    setIsDirty(formIsDirty)
  }, [formIsDirty])

  // Auto-save with debouncing
  const debouncedSave = useMemo(
    () =>
      debounce(async (data) => {
        if (!userId || !isDirty) return
        
        try {
          await ProfileService.updateProfile(userId, data)
          toast.success("Profile auto-saved")
          setIsDirty(false)
        } catch (err) {
          toast.error("Failed to auto-save profile")
        }
      }, 2000),
    [userId, isDirty]
  )

  useEffect(() => {
    const subscription = watch((data) => {
      if (userId && isDirty) {
        debouncedSave(data)
      }
    })
    return () => {
      subscription.unsubscribe()
      debouncedSave.cancel()
    }
  }, [watch, debouncedSave, userId, isDirty])

  // Get user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error("Please login to access your profile")
        router.push("/login")
        return
      }
      setUserId(user.id)
    }

    fetchUser()
  }, [router])

  const handleAvatarUpdate = async (url) => {
    if (!userId) return
    
    try {
      await ProfileService.updateProfile(userId, { avatar_url: url })
      setValue("avatar_url", url, { shouldDirty: true })
      refetch()
    } catch (err) {
      toast.error("Failed to update avatar")
    }
  }

// When profile is updated in profile.js
const confirmSubmit = async () => {
  if (!userId) return
  
  try {
    await ProfileService.updateProfile(userId, formData)
    await ActivityService.logActivity(
      userId,
      'profile_updated',
      'Updated profile information',
      { fields: Object.keys(formData) }
    )
    toast.success("Profile updated successfully")
    setPreviewOpen(false)
    setIsDirty(false)
    refetch()
  } catch (err) {
    toast.error(err.message || "Failed to update profile")
  }
}

  if (loading) return <ProfileFormSkeleton />
  if (error) return <p className="text-center text-red-600">{error}</p>
  if (!profile) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-3xl font-bold" tabIndex={0}>Profile Settings</h1>

      <AvatarUpload 
        avatarUrl={profile.avatar_url} 
        onUpload={handleAvatarUpdate}
        userId={userId}
      />

      <form onSubmit={handleSubmit(() => setPreviewOpen(true))} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input 
              id="name" 
              {...register("name")} 
              aria-invalid={!!errors.name}
              aria-describedby="name-error"
            />
            {errors.name && (
              <p id="name-error" className="text-red-500 text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" disabled {...register("email")} />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input 
              id="phone" 
              {...register("phone")} 
              aria-invalid={!!errors.phone}
              aria-describedby="phone-error"
            />
            {errors.phone && (
              <p id="phone-error" className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              {...register("location")} 
              aria-invalid={!!errors.location}
              aria-describedby="location-error"
            />
            {errors.location && (
              <p id="location-error" className="text-red-500 text-sm mt-1">
                {errors.location.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            {...register("bio")}
            rows={4}
            className="w-full border rounded-md p-2 text-sm"
            aria-invalid={!!errors.bio}
            aria-describedby="bio-error"
          />
          <div className="flex justify-between">
            {errors.bio && (
              <p id="bio-error" className="text-red-500 text-sm mt-1">
                {errors.bio.message}
              </p>
            )}
            <span className="text-xs text-muted-foreground">
              {(formData.bio?.length || 0)}/500 characters
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input 
              id="twitter" 
              {...register("twitter")} 
              placeholder="https://twitter.com/username"
              aria-invalid={!!errors.twitter}
              aria-describedby="twitter-error"
            />
            {errors.twitter && (
              <p id="twitter-error" className="text-red-500 text-sm mt-1">
                {errors.twitter.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input 
              id="linkedin" 
              {...register("linkedin")} 
              placeholder="https://linkedin.com/in/username"
              aria-invalid={!!errors.linkedin}
              aria-describedby="linkedin-error"
            />
            {errors.linkedin && (
              <p id="linkedin-error" className="text-red-500 text-sm mt-1">
                {errors.linkedin.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="is_public">Public Profile</Label>
          <Switch 
            id="is_public" 
            {...register("is_public")} 
            aria-label="Toggle public profile"
          />
        </div>

        <div className="flex items-center justify-between pt-6">
          <Button 
            type="submit" 
            disabled={!isDirty}
            aria-disabled={!isDirty}
          >
            Preview & Save
          </Button>
          <div className="text-sm space-y-1 text-right">
            <Link 
              href="/auth/change-password" 
              className="text-primary hover:underline block"
              aria-label="Change password"
            >
              Change Password
            </Link>
            {userId && (
              <Link 
                href={`/user/${userId}`} 
                className="hover:underline block text-muted-foreground"
                aria-label="View public profile"
              >
                View Profile
              </Link>
            )}
            <Link 
              href="/directory" 
              className="hover:underline block text-muted-foreground"
              aria-label="Browse directory"
            >
              Directory
            </Link>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent aria-labelledby="preview-title">
          <DialogHeader>
            <DialogTitle id="preview-title">Confirm Profile Changes</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Phone:</strong> {formData.phone || "Not provided"}</p>
            <p><strong>Location:</strong> {formData.location || "Not provided"}</p>
            <p><strong>Bio:</strong> {formData.bio || "Not provided"}</p>
            <p><strong>Twitter:</strong> {formData.twitter || "Not provided"}</p>
            <p><strong>LinkedIn:</strong> {formData.linkedin || "Not provided"}</p>
            <p><strong>Public:</strong> {formData.is_public ? "Yes" : "No"}</p>
          </div>
          <DialogFooter>
            <Button onClick={confirmSubmit} aria-label="Confirm changes">
              Confirm
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setPreviewOpen(false)}
              aria-label="Cancel changes"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}