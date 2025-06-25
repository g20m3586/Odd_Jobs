"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/client"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useForm } from "react-hook-form"

export default function ProfilePage() {
  const [userId, setUserId] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) return setError("User not found")

      setUserId(user.id)

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) return setError(profileError.message)

      if (data) {
        setProfile(data)
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            setValue(key, data[key])
          }
        }
      }
    }

    fetchData()
  }, [setValue])

  const handleImageUpload = async (e) => {
    const selectedFile = e.target.files[0]
    const { data: { user } } = await supabase.auth.getUser()
    const filePath = `avatars/${user.id}-${selectedFile.name}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, selectedFile, { upsert: true })

    if (uploadError) {
      setError("Image upload failed.")
      return
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", user.id)
      .from("profiles")
      .update({
      ...formData,
      updated_at: new Date().toISOString(),
  })
  .eq("id", user.id)

    if (updateError) return setError(updateError.message)

    setValue("avatar_url", urlData.publicUrl)
    setSuccess(true)
  }

  const onSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return setError("User not authenticated")

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setLoading(false)
  }

  if (!profile) return <p>Loading profile...</p>

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold">Profile Settings</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Profile updated successfully!
        </div>
      )}

      <div className="flex items-center gap-4">
        <img
          src={profile.avatar_url || "/default-avatar.jpg"}
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover"
        />
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register("name", { required: true })} />
          {errors.name && <p className="text-red-500 text-sm">Name is required</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...register("email") } disabled />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone", { pattern: /^[0-9+\-\s()]*$/ })} />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register("location")} />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            className="w-full border rounded-md text-sm p-2"
            rows={4}
            {...register("bio")}
          />
        </div>

        <div>
          <Label htmlFor="twitter">Twitter</Label>
          <Input id="twitter" {...register("twitter")} placeholder="@yourhandle" />
        </div>

        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input id="linkedin" {...register("linkedin")} placeholder="https://linkedin.com/in/you" />
        </div>

        <div className="text-sm text-muted-foreground">
          Role: <span className="font-medium">{profile.role}</span><br />
          Member since: {new Date(profile.created_at).toLocaleDateString()}
        </div>
        <div className="flex items-center justify-between">
  <Label htmlFor="is_public" className="text-sm">Public Profile</Label>
  <input
    type="checkbox"
    id="is_public"
    className="w-5 h-5"
    {...register("is_public")}
  />
</div>


        <div className="flex items-center justify-between pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <div className="flex flex-col text-right gap-1">
            <Link
              href="/auth/change-password"
              className="text-sm text-primary hover:underline"
            >
              Change Password
            </Link>
            {userId && (
              <Link
                href={`/user/${userId}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                View My Public Profile
              </Link>
            )}
            <Link href="/directory" className="text-sm text-muted-foreground hover:underline">
  Browse Directory
</Link>

          </div>
        </div>
      </form>
    </div>
  )
}
