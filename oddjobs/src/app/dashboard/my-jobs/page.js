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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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

      if (error) {
        toast.error("Failed to load your jobs")
        console.error(error)
      } else {
        setJobs(data || [])
      }

      setLoading(false)
    }

    fetchJobs()
  }, [])

  const statusVariant = {
    open: "default",
    filled: "success",
    expired: "destructive"
  }

  const statusIcon = {
    open: <CheckCircle className="h-4 w-4 text-green-500" />,
    filled: <UserCheck className="h-4 w-4 text-blue-500" />,
    expired: <XCircle className="h-4 w-4 text-red-500" />
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
              {statusFilter === "all" ? "All Statuses" : `Status: ${statusFilter}`}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("open")}>Open</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("filled")}>Filled</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("expired")}>Expired</DropdownMenuItem>
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
          <p className="text-muted-foreground">No jobs found matching your filters.</p>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-semibold text-base text-primary">{job.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[job.status]} className="flex items-center gap-1">
                      {statusIcon[job.status]} {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{job.applications?.length || 0}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/my-jobs/${job.id}/applications`)}
                      >
                        View Apps
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                      >
                        View Job
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
