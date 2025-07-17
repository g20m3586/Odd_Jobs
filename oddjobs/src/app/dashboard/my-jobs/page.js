"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { CheckCircle, UserCheck, XCircle, Search, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"

export default function MyJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const router = useRouter()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/login")
          return
        }

        const { data, error } = await supabase
          .from("jobs")
          .select(`
            id,
            title,
            created_at,
            status,
            applications:applications(id)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setJobs(data || [])
      } catch (error) {
        toast.error("Failed to load your jobs", { description: error.message })
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [router])

  // Status configuration for consistent usage
  const statusOptions = {
    open: { label: "Open", variant: "default", icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
    filled: { label: "Filled", variant: "success", icon: <UserCheck className="h-4 w-4 text-blue-500" /> },
    expired: { label: "Expired", variant: "destructive", icon: <XCircle className="h-4 w-4 text-red-500" /> },
    in_progress: { label: "In Progress", variant: "secondary", icon: <CheckCircle className="h-4 w-4 text-yellow-500" /> },
    completed: { label: "Completed", variant: "outline", icon: <CheckCircle className="h-4 w-4 text-purple-500" /> }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <Button asChild>
          <Link href="/jobs/post">Post New Job</Link>
        </Button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search job title..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              {statusFilter === "all" ? "All Statuses" : statusOptions[statusFilter]?.label || statusFilter}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
            {Object.entries(statusOptions).map(([key, { label }]) => (
              <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Job list */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            {jobs.length === 0 ? "You haven't posted any jobs yet." : "No jobs found matching your filters."}
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-semibold text-base">
                    <Link href={`/jobs/${job.id}`} className="hover:underline text-primary">
                      {job.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={statusOptions[job.status]?.variant || "outline"} 
                      className="flex items-center gap-1 capitalize"
                    >
                      {statusOptions[job.status]?.icon}
                      {statusOptions[job.status]?.label || job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(job.created_at)}</TableCell>
                  <TableCell>{job.applications?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/received-applications?job_id=${job.id}`)}
                        disabled={job.applications?.length === 0}
                      >
                        View Applications
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/my-jobs/${job.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}