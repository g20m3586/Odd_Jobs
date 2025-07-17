"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

const statusVariant = {
  pending: "outline",
  reviewed: "secondary",
  accepted: "success",
  rejected: "destructive",
  withdrawn: "secondary",
}

export default function ReceivedApplicationDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("You must be signed in")

        const { data, error } = await supabase
          .from("applications")
          .select(`
            id, status, created_at, cover_letter,
            job:jobs(id, title, description, user_id),
            applicant:profiles!user_id(id, name, email, phone, location)
          `)
          .eq("id", id)
          .single()

        if (error || !data) throw error
        if (data.job?.user_id !== user.id) {
          toast.error("You are not authorized to view this application")
          return router.push("/received-applications")
        }

        setApplication(data)
      } catch (error) {
        toast.error("Failed to load application", { description: error.message })
        router.push("/received-applications")
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [id, router])

  const updateStatus = async (newStatus) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", id)

    if (error) {
      toast.error("Failed to update status", { description: error.message })
    } else {
      toast.success(`Application marked as ${newStatus}`)
      setApplication((prev) => ({ ...prev, status: newStatus }))
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-40 w-full rounded mb-4" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  if (!application) return null

  const { job, applicant, cover_letter, status, created_at } = application

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{job?.title}</h1>
        <p className="text-muted-foreground text-sm">
          From: {applicant?.name || "Unknown"} •{" "}
          {applicant?.email || "No email"} •{" "}
          {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={statusVariant[status] || "secondary"} className="capitalize">
            {status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Applicant Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {applicant?.name || "Not provided"}</p>
              <p><span className="font-medium">Email:</span> {applicant?.email || "Not provided"}</p>
              <p><span className="font-medium">Phone:</span> {applicant?.phone || "Not provided"}</p>
              <p><span className="font-medium">Location:</span> {applicant?.location || "Not provided"}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Cover Letter</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {cover_letter || "No cover letter provided"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Job Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {job?.description || "No description provided"}
          </p>
        </div>
      </div>

      {(status === "pending" || status === "reviewed") && (
        <div className="flex gap-3 pt-4">
          <Button variant="success" onClick={() => updateStatus("accepted")}>
            Accept
          </Button>
          <Button variant="destructive" onClick={() => updateStatus("rejected")}>
            Reject
          </Button>
          {status === "pending" && (
            <Button variant="secondary" onClick={() => updateStatus("reviewed")}>
              Mark as Reviewed
            </Button>
          )}
        </div>
      )}
    </div>
  )
}