"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Search, Filter, AlertCircle, Clock, MapPin,
  DollarSign, BadgeCheck, Hourglass, Ban, Bookmark
} from "lucide-react"
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem
} from "@/components/ui/select"
import {
  Tabs, TabsList, TabsTrigger
} from "@/components/ui/tabs"

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    minPrice: "",
    maxPrice: "",
    jobType: "any",
  })
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        let query = supabase
          .from("jobs")
          .select("*")
          .order("created_at", { ascending: false })

        if (filters.search) query = query.ilike("title", `%${filters.search}%`)
        if (filters.category !== "all") query = query.eq("category", filters.category)
        if (filters.minPrice) query = query.gte("price", parseFloat(filters.minPrice))
        if (filters.maxPrice) query = query.lte("price", parseFloat(filters.maxPrice))
        if (filters.jobType !== "any") query = query.eq("job_type", filters.jobType)
        if (activeTab === "featured") query = query.eq("is_featured", true)
        if (activeTab === "remote") query = query.ilike("location", "%remote%")

        const { data, error } = await query
        if (error) throw error
        setJobs(data || [])
      } catch (err) {
        toast.error("Failed to load jobs", { description: err.message })
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [filters, activeTab])

  useEffect(() => {
    const fetchSavedJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", user.id)

      if (data) {
        setSavedJobs(new Set(data.map((d) => d.job_id)))
      }
    }

    fetchSavedJobs()
  }, [])

  const toggleSaveJob = async (jobId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return toast.error("You must be logged in to save jobs.")

    if (savedJobs.has(jobId)) {
      await supabase
        .from("saved_jobs")
        .delete()
        .eq("user_id", user.id)
        .eq("job_id", jobId)
      setSavedJobs((prev) => {
        const copy = new Set(prev)
        copy.delete(jobId)
        return copy
      })
    } else {
      await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId })
      setSavedJobs((prev) => new Set(prev).add(jobId))
    }
  }

  const handleResetFilters = () =>
    setFilters({ search: "", category: "all", minPrice: "", maxPrice: "", jobType: "any" })

  const isExpired = (job) =>
    job.deadline && new Date(job.deadline) < new Date()

  const isCompleted = (job) =>
    job.status?.toLowerCase() === "completed"

  return (
    <div className="container py-8 px-4 mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Find Your Next Opportunity</h1>
          <p className="text-muted-foreground mt-1">
            Browse {jobs.length} {jobs.length === 1 ? "job" : "jobs"} matching your filters
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/jobs/saved">Saved Jobs</Link>
          </Button>
          <Button asChild>
            <Link href="/jobs/post">Post a Job</Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="remote">Remote</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <div className="bg-muted/10 p-6 rounded-xl mb-8 border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              placeholder="Job title"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category}
              onValueChange={(val) => setFilters({ ...filters, category: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Writing">Writing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Min Price</Label>
            <Input
              type="number"
              min={0}
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Max Price</Label>
            <Input
              type="number"
              min={0}
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Job Type</Label>
            <Select
              value={filters.jobType}
              onValueChange={(val) => setFilters({ ...filters, jobType: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={handleResetFilters}>Reset Filters</Button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => {
          const expired = isExpired(job)
          const completed = isCompleted(job)
          return (
            <Card
              key={job.id}
              className={`relative group transition-all ${expired || completed ? "opacity-60" : ""}`}
            >
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => toggleSaveJob(job.id)} title="Save job">
                  <Bookmark
                    className={`w-5 h-5 transition-colors ${
                      savedJobs.has(job.id) ? "fill-blue-500 text-blue-500" : "text-gray-400 group-hover:text-blue-500"
                    }`}
                  />
                </button>
              </div>
              <CardHeader className="pb-3">
                <CardTitle>
                  <Link href={`/jobs/${job.id}`} className="hover:underline">
                    {job.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm flex gap-2 mt-2">
                  <span className="font-semibold text-primary">${job.price?.toFixed(2)}</span>
                  <span>•</span>
                  <span className="capitalize">{job.job_type || "Type"}</span>
                </CardDescription>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                    <MapPin className="w-3 h-3" /> {job.location || "Remote"}
                  </span>
                  <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                    {job.category}
                  </span>
                  {expired && (
                    <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      <Hourglass className="h-3 w-3" /> Expired
                    </span>
                  )}
                  {completed && (
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <Ban className="h-3 w-3" /> Completed
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {job.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/jobs/${job.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
