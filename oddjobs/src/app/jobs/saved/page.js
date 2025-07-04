"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, MapPin, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          toast.error("Please sign in first")
          router.push("/auth/login")
          return
        }

        const { data, error } = await supabase
          .from("saved_jobs")
          .select("job:jobs(*)") // foreign key to jobs table
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        const validJobs = data?.map((entry) => entry.job).filter(Boolean) || []
        setJobs(validJobs)
      } catch (err) {
        console.error(err)
        setError("Failed to load saved jobs.")
      } finally {
        setLoading(false)
      }
    }

    fetchSavedJobs()
  }, [router])

  if (loading) {
    return (
      <div className="container py-10 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10 space-y-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Saved Jobs</h1>
      {jobs.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">You haven't saved any jobs yet</h3>
          <p className="text-muted-foreground mt-2 mb-4">Browse jobs and save the ones that interest you.</p>
          <Button asChild>
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle className="text-lg leading-tight">
                  <Link href={`/jobs/${job.id}`} className="hover:underline">
                    {job.title}
                  </Link>
                </CardTitle>
                <CardDescription className="mt-1 text-sm flex gap-2">
                  <span>${job.price?.toFixed(2)}</span>
                  <span>•</span>
                  <span className="capitalize">{job.job_type}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground line-clamp-3">
                {job.description}
              </CardContent>
              <CardFooter className="flex items-center justify-between mt-auto">
                <div className="text-xs flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {job.location || "Remote"}
                </div>
                {job.deadline && (
                  <div className="text-xs flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Apply by {new Date(job.deadline).toLocaleDateString()}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
