"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function MyJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setJobs(data)
      
      setLoading(false)
    }

    fetchJobs()
  }, [])

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (!error) {
      setJobs(jobs.filter(job => job.id !== jobId))
    }
  }

  if (loading) return <div>Loading your jobs...</div>

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <Button asChild>
          <Link href="/jobs/post">Post New Job</Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You have not posted any jobs yet</p>
          <Button asChild>
            <Link href="/jobs/post">Create Your First Job</Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/my-jobs/${job.id}`} className="hover:underline">
                    {job.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>${job.price}</TableCell>
                <TableCell>
                  {new Date(job.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/my-jobs/${job.id}`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(job.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}