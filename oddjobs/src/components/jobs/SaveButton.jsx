"use client"

import { useEffect, useState } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { supabase } from "@/lib/client"
import { toast } from "sonner"

export default function SaveJobButton({ jobId }) {
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const fetchSavedStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      const { data } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("user_id", user.id)
        .eq("job_id", jobId)
        .single()

      setSaved(!!data)
    }

    fetchSavedStatus()
  }, [jobId])

  const toggleSave = async () => {
    if (!userId) {
      toast.error("You must be signed in to save jobs.")
      return
    }

    if (saved) {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("user_id", userId)
        .eq("job_id", jobId)

      if (error) {
        toast.error("Failed to unsave job.")
      } else {
        toast.success("Job removed from saved.")
        setSaved(false)
      }
    } else {
      const { error } = await supabase
        .from("saved_jobs")
        .insert({ user_id: userId, job_id: jobId })

      if (error) {
        toast.error("Failed to save job.")
      } else {
        toast.success("Job saved.")
        setSaved(true)
      }
    }
  }

  const Icon = saved ? BookmarkCheck : Bookmark

  return (
    <button
      onClick={toggleSave}
      className="text-muted-foreground hover:text-primary"
      aria-label="Save job"
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}
