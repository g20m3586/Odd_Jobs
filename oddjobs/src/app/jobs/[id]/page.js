"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function JobDetailPage({ params }) {
  const [job, setJob] = useState(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .single()

      if (jobData) {
        setJob(jobData)
        setIsOwner(user?.id === jobData.user_id)

        // Check if user has already applied
        const { count } = await supabase
          .from('applications')
          .select('*', { count: 'exact' })
          .eq('job_id', params.id)
          .eq('user_id', user?.id)

        setHasApplied(count > 0)
      }
      setLoading(false)
    }

    fetchData()
  }, [params.id])

  if (loading) return <div className="container py-8">Loading...</div>
  if (!job) return <div className="container py-8">Job not found</div>

  return (
    <div className="container py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <Badge className="mt-2">
              {job.status}
            </Badge>
          </div>
          {job.price && (
            <div className="text-2xl font-semibold">
              ${job.price.toFixed(2)}
            </div>
          )}
        </div>

        <div className="prose dark:prose-invert mb-8">
          <p className="whitespace-pre-line">{job.description}</p>
        </div>

        <div className="flex gap-4">
          {!isOwner && (
            <Button
              onClick={() => router.push(`/jobs/${params.id}/apply`)}
              disabled={hasApplied}
            >
              {hasApplied ? 'Already Applied' : 'Apply Now'}
            </Button>
          )}
          {isOwner && (
            <Button
              variant="secondary"
              onClick={() => router.push(`/dashboard/my-jobs/${params.id}`)}
            >
              Manage Applications
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/jobs')}>
            Back to Listings
          </Button>
        </div>
      </div>
    </div>
  )
}