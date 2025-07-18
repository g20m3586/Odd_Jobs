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

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("You must be signed in")

        // Fetch applications with both applicant and business info
        const { data, error } = await supabase
          .from("applications")
          .select(`
            id, status, created_at, 
            job:jobs(id, title, category, description),
            applicant:profiles!user_id(name, email),
            business:profiles!business_id(name)
          `)
          .eq("user_id", user.id)
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

  const handleWithdraw = async (id) => {
    const confirm = window.confirm("Are you sure you want to withdraw this application?")
    if (!confirm) return

    const { error } = await supabase
      .from("applications")
      .update({ status: "withdrawn" })
      .eq("id", id)

    if (error) {
      toast.error("Failed to withdraw", { description: error.message })
    } else {
      toast.success("Application withdrawn")
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "withdrawn" } : app
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
      <h1 className="text-3xl font-bold mb-4">My Applications</h1>

      {applications.length === 0 ? (
        <p className="text-muted-foreground">You haven&apos;t applied to any jobs yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="border rounded-md p-4 bg-muted/50 hover:bg-muted/30 transition"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="space-y-1">
                  <Link href={`/applications/${app.id}`}>
                    <h3 className="font-semibold text-lg hover:underline">
                      {app.job?.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {app.business?.name || "Unknown Company"} •{" "}
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

                  {app.status === "pending" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleWithdraw(app.id)}
                    >
                      Withdraw
                    </Button>
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