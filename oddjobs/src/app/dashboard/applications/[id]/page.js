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

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState(null)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUserId(user?.id)

        const { data, error } = await supabase
          .from("applications")
          .select(`
            id, status, created_at, cover_letter,
            job: jobs (id, title, category, description, user_id),
            business: profiles!jobs(user_id)
          `)
          .eq("id", id)
          .single()

        if (error || !data) throw error
        setApplication(data)
      } catch (err) {
        toast.error("Could not load application", { description: err.message })
        router.push("/applications")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  const handleWithdraw = async () => {
    const confirmed = confirm("Are you sure you want to withdraw this application?")
    if (!confirmed) return

    const { error } = await supabase
      .from("applications")
      .update({ status: "withdrawn" })
      .eq("id", id)

    if (error) {
      toast.error("Failed to withdraw", { description: error.message })
    } else {
      toast.success("Application withdrawn")
      setApplication({ ...application, status: "withdrawn" })
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!application) return null

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6 animate-fade-in">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1">{application.job?.title}</h1>
          <p className="text-muted-foreground text-sm capitalize">
            {application.job?.category} • Posted by {application.business?.full_name || "Unknown"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge variant={statusVariant[application.status]} className="capitalize">
            {application.status}
          </Badge>
          {application.status === "pending" && (
            <Button size="sm" variant="destructive" onClick={handleWithdraw}>
              Withdraw
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-md p-4 bg-muted/40 space-y-3">
        <h2 className="text-lg font-semibold">Your Cover Letter</h2>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {application.cover_letter || "No message provided"}
        </p>
      </div>

      <div className="border rounded-md p-4 bg-muted/20 space-y-3">
        <h2 className="text-lg font-semibold">Job Description</h2>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {application.job?.description || "No description provided"}
        </p>
      </div>
    </div>
  )
}
