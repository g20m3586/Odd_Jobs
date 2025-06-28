"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/client"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function ProfilePage() {
  const [userId, setUserId] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  const formData = watch()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) return setError("User not authenticated")

      setUserId(user.id)

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) return setError(profileError.message)

      setProfile(data)
      Object.keys(data).forEach((key) => setValue(key, data[key]))
      setLoading(false)
    }

    fetchProfile()
  }, [setValue])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    const { data: { user } } = await supabase.auth.getUser()
    const filePath = `avatars/${user.id}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true })

    if (uploadError) return setError("Image upload failed.")

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
    await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", user.id)

    setValue("avatar_url", urlData.publicUrl)
    setProfile(prev => ({ ...prev, avatar_url: urlData.publicUrl }))
  }

  const confirmSubmit = async () => {
    setSuccess(false)
    setError(null)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) return setError("User not authenticated")

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setPreviewOpen(false)
  }

  if (loading) return <p className="text-center py-6 animate-pulse">Loading...</p>
  if (error) return <p className="text-center text-red-600">{error}</p>

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <h2 className="text-3xl font-bold">Profile Settings</h2>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Profile updated successfully!
        </div>
      )}

      <div className="flex items-center gap-4">
        <img
          src={profile.avatar_url || "/default-avatar.jpg"}
          alt="avatar"
          className="w-24 h-24 rounded-full border shadow"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="text-sm"
        />
      </div>

      <form onSubmit={handleSubmit(() => setPreviewOpen(true))} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register("name", { required: true })} />
            {errors.name && <p className="text-red-500 text-sm">Name is required</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" disabled {...register("email")} />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} />
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            {...register("bio")}
            rows={4}
            className="w-full border rounded-md p-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input id="twitter" {...register("twitter")} />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" {...register("linkedin")} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="is_public">Public Profile</Label>
          <Switch id="is_public" {...register("is_public")} />
        </div>

        <div className="flex items-center justify-between pt-6">
          <Button type="submit">Preview & Save</Button>
          <div className="text-sm space-y-1 text-right">
            <Link href="/auth/change-password" className="text-primary hover:underline block">Change Password</Link>
            {userId && <Link href={`/user/${userId}`} className="hover:underline block text-muted-foreground">View Profile</Link>}
            <Link href="/directory" className="hover:underline block text-muted-foreground">Directory</Link>
          </div>
        </div>
      </form>

      {/* Modal Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Profile Changes</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Phone:</strong> {formData.phone}</p>
            <p><strong>Location:</strong> {formData.location}</p>
            <p><strong>Bio:</strong> {formData.bio}</p>
            <p><strong>Twitter:</strong> {formData.twitter}</p>
            <p><strong>LinkedIn:</strong> {formData.linkedin}</p>
            <p><strong>Public:</strong> {formData.is_public ? "Yes" : "No"}</p>
          </div>
          <DialogFooter>
            <Button onClick={confirmSubmit}>Confirm</Button>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
