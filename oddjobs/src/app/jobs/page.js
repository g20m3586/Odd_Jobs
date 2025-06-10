"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, AlertCircle } from 'lucide-react'

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: ''
  })
  const router = useRouter()

  // Optimized data fetching with caching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Build query with filters
        let query = supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })

        if (filters.category) query = query.ilike('category', `%${filters.category}%`)
        if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice))
        if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice))

        const { data, error } = await query
        
        if (error) throw error
        setJobs(data || [])
      } catch (error) {
        console.error('Error fetching jobs:', error)
        toast.error('Failed to load jobs', {
          description: error.message
        })
      } finally {
        setLoading(false)
      }
    }

    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        toast.error('Please sign in to view jobs', {
          action: {
            label: 'Sign In',
            onClick: () => router.push('/auth/login')
          },
        })
        router.push('/auth/login')
        return
      }
      setAuthChecked(true)
      fetchData()
    }

    // Only check auth if not already checked
    if (!authChecked) {
      checkAuth()
    } else {
      fetchData()
    }
  }, [filters, authChecked, router])

  const handleResetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: ''
    })
  }

  // Loading skeletons for better perceived performance
  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-9 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        
        {/* Filter Skeletons */}
        <div className="bg-muted/50 p-4 rounded-lg mb-8 mx-8">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-9 w-[100px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-[80px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Job Card Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow h-full flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold px-8">Available Jobs</h1>
        <Button asChild>
          <Link href="/jobs/post" className="flex items-center gap-2">
            Post a Job
          </Link>
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-muted/50 p-4 rounded-lg mb-8 mx-8 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium">Filter Jobs</h2>
          <Button 
            variant="ghost" 
            onClick={handleResetFilters}
            disabled={!filters.category && !filters.minPrice && !filters.maxPrice}
            className="transition-opacity"
          >
            Reset Filters
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="Design, Development, etc."
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="minPrice">Min Price ($)</Label>
            <Input
              id="minPrice"
              type="number"
              min="0"
              step="1"
              placeholder="Minimum"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="maxPrice">Max Price ($)</Label>
            <Input
              id="maxPrice"
              type="number"
              min="0"
              step="1"
              placeholder="Maximum"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No jobs found</h3>
          <p className="text-muted-foreground mb-4">
            {Object.values(filters).some(Boolean) 
              ? "Try adjusting your filters" 
              : "Check back later or post a job"}
          </p>
          <Button asChild variant="outline">
            <Link href="/jobs/post">Post a Job</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-8">
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              className="hover:shadow-md transition-all duration-300 h-full flex flex-col hover:scale-[1.02]"
            >
              <CardHeader>
                <CardTitle className="truncate">{job.title}</CardTitle>
                <p className="text-primary font-medium">${job.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground capitalize">{job.category}</p>
                {job.deadline && (
                  <p className="text-sm text-muted-foreground">
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="line-clamp-3 text-muted-foreground mb-4">{job.description}</p>
              </CardContent>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/jobs/${job.id}`} className="flex items-center justify-center gap-2">
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}