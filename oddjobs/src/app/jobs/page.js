"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, AlertCircle, Clock, MapPin, DollarSign, BadgeCheck } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    jobType: 'any'
  })
  const [activeTab, setActiveTab] = useState('all')
  const router = useRouter()

  // Job categories for dropdown
  const categories = [
    'Design',
    'Development',
    'Marketing',
    'Writing',
    'Administrative',
    'Customer Service',
    'Sales',
    'Other'
  ]

  const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship'
  ]

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        let query = supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })

        if (filters.search) query = query.ilike('title', `%${filters.search}%`)
        if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category)
        if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice))
        if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice))
        if (filters.jobType && filters.jobType !== 'any') query = query.eq('job_type', filters.jobType)
        if (activeTab === 'featured') query = query.eq('is_featured', true)
        if (activeTab === 'remote') query = query.ilike('location', '%remote%')

        const { data, error } = await query
        
        if (error) throw error
        setJobs(data || [])
      } catch (error) {
        toast.error('Failed to load jobs', {
          description: error.message
        })
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchJobs()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [filters, activeTab])

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      minPrice: '',
      maxPrice: '',
      jobType: 'any'
    })
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <Skeleton className="h-9 w-[250px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </div>
        
        {/* Filter Skeletons */}
        <div className="bg-muted/10 p-6 rounded-xl mb-8 border">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-[80px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Job Card Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="hover:shadow-lg transition-all h-full flex flex-col">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 mx-auto px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight">Find Your Next Opportunity</h1>
          <p className="text-muted-foreground mt-2">
            Browse {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} matching your skills
          </p>
        </div>
        <div className="flex gap-2 justify-center md:justify-start w-full md:w-auto">
          <Button asChild variant="outline">
            <Link href="/jobs/saved" className="flex items-center gap-2">
              Saved Jobs
            </Link>
          </Button>
          <Button asChild>
            <Link href="/jobs/post" className="flex items-center gap-2">
              Post a Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex justify-center mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All Jobs
            </TabsTrigger>
            <TabsTrigger value="featured">
              Featured
            </TabsTrigger>
            <TabsTrigger value="remote">
              Remote
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filter Section */}
      <div className="bg-muted/10 p-6 rounded-xl mb-8 border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="flex items-center gap-1">
              <Search className="h-4 w-4" /> Search
            </Label>
            <Input
              id="search"
              placeholder="Job title or keywords"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-1">
              <Filter className="h-4 w-4" /> Category
            </Label>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({...filters, category: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobType" className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> Job Type
            </Label>
            <Select
              value={filters.jobType}
              onValueChange={(value) => setFilters({...filters, jobType: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Type</SelectItem>
                {jobTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minPrice" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" /> Min Rate
            </Label>
            <Input
              id="minPrice"
              type="number"
              min="0"
              placeholder="$0"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxPrice" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" /> Max Rate
            </Label>
            <Input
              id="maxPrice"
              type="number"
              min="0"
              placeholder="$1000+"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="ghost" 
            onClick={handleResetFilters}
            disabled={
              !filters.search && 
              filters.category === 'all' && 
              !filters.minPrice && 
              !filters.maxPrice && 
              filters.jobType === 'any'
            }
            className="text-sm"
          >
            Clear all filters
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center border rounded-lg">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No jobs found</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            {filters.search || filters.category !== 'all' || filters.minPrice || filters.maxPrice || filters.jobType !== 'any'
              ? "Try adjusting your filters or search different keywords" 
              : "There are currently no jobs available. Check back later or be the first to post a job!"}
          </p>
          <Button asChild>
            <Link href="/jobs/post">Post a Job</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              className="hover:shadow-lg transition-all h-full flex flex-col group"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg leading-tight">
                    <Link href={`/jobs/${job.id}`} className="hover:underline">
                      {job.title}
                    </Link>
                  </CardTitle>
                  {job.is_featured && (
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                      <BadgeCheck className="h-3 w-3" /> Featured
                    </span>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2 text-sm mt-2">
                  <span className="font-medium text-primary">${job.price?.toFixed(2)}</span>
                  <span>•</span>
                  <span className="capitalize">{job.job_type || 'Not specified'}</span>
                </CardDescription>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                    <MapPin className="h-3 w-3" /> {job.location || 'Remote'}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs capitalize">
                    {job.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="line-clamp-3 text-muted-foreground text-sm">
                  {job.description}
                </p>
                {job.deadline && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Apply by {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/jobs/${job.id}`}>
                    View Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {jobs.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}