"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: ''
  })

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let query = supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })

        // Apply filters if they exist
        if (filters.category) query = query.ilike('category', `%${filters.category}%`)
        if (filters.minPrice) query = query.gte('price', filters.minPrice)
        if (filters.maxPrice) query = query.lte('price', filters.maxPrice)

        const { data, error } = await query
        
        if (error) throw error
        setJobs(data)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [filters]) // Re-fetch when filters change

  if (loading) return <div className="container py-8">Loading jobs...</div>

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold px-8">Available Jobs</h1>
        <Button asChild>
          <Link href="/jobs/post">Post a Job</Link>
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-muted/50 p-4 rounded-lg mb-8 mx-8">
        <h2 className="font-medium mb-4">Filter Jobs</h2>
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
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-8">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <p className="text-primary font-medium">${job.price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{job.category}</p>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-muted-foreground mb-4">{job.description}</p>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/jobs/${job.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}