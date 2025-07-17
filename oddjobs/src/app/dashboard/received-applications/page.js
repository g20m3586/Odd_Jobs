"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

export default function ReceivedApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("You must be signed in")

        // First get all jobs owned by this user
        const { data: jobs, error: jobsError } = await supabase
          .from("jobs")
          .select("id")
          .eq("user_id", user.id)

        if (jobsError) throw jobsError
        if (!jobs.length) {
          setApplications([])
          return
        }

        // Then get applications for those jobs
        const { data, error } = await supabase
          .from("applications")
          .select(`
            id, status, created_at, cover_letter,
            job:jobs(id, title),
            applicant:profiles!user_id(id, name, email)
          `)
          .in("job_id", jobs.map(j => j.id))
          .order("created_at", { ascending: false })

        if (error) throw error

        setApplications(data)
      } catch (error) {
        toast.error("Failed to load applications", { description: error.message })
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", id)

    if (error) {
      toast.error("Failed to update status", { description: error.message })
    } else {
      toast.success(`Marked as ${newStatus}`)
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      )
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10">
        <Skeleton className="h-10 w-48 mb-4" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full mb-4 rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold mb-4">Received Applications</h1>

      {applications.length === 0 ? (
        <p className="text-muted-foreground">No applications received yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="border rounded-md p-4 bg-muted/50 hover:bg-muted/30 transition"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="space-y-1">
                  <Link href={`/received-applications/${app.id}`}>
                    <h3 className="font-semibold text-lg hover:underline">
                      {app.job?.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    From: {app.applicant?.name || "Unknown"} •{" "}
                    {app.applicant?.email || "No email"} •{" "}
                    {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Badge
                    variant={statusVariant[app.status] || "secondary"}
                    className="capitalize"
                  >
                    {app.status}
                  </Badge>

                  {(app.status === "pending" || app.status === "reviewed") && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(app.id, "accepted")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(app.id, "rejected")}
                      >
                        Reject
                      </Button>
                      {app.status === "pending" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateStatus(app.id, "reviewed")}
                        >
                          Mark Reviewed
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}