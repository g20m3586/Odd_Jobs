'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { BadgeCheck, Clock, MapPin, UserCheck } from 'lucide-react'

export default function JobDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise)
  const router = useRouter()

  const [job, setJob] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [jobStatus, setJobStatus] = useState('loading')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        toast.error('Auth error')
        return
      }
      setUser(currentUser)

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        setJobStatus('invalid')
        return
      }

      const deadlinePassed = data.deadline && new Date(data.deadline) < new Date()
      const closed = data.status !== 'open' || deadlinePassed

      setIsOwner(currentUser.id === data.user_id)
      setJob(data)
      setJobStatus(closed ? 'closed' : 'open')
    }

    fetchData()
  }, [params.id])

  if (jobStatus === 'loading') {
    return <div className="container py-16">Loading...</div>
  }

  if (jobStatus === 'invalid') {
    return (
      <div className="container py-16 text-center">
        <p className="text-lg font-semibold text-destructive">Job not found or no longer available.</p>
        <Button className="mt-4" onClick={() => router.push('/jobs')}>Back to Jobs</Button>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full capitalize">
            <MapPin className="h-4 w-4" />
            {job.location || 'Remote'}
          </span>
          <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full capitalize">
            {job.category}
          </span>
          {job.is_featured && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
              <BadgeCheck className="h-3 w-3" />
              Featured
            </span>
          )}
          {job.deadline && (
            <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
              <Clock className="h-4 w-4" />
              Apply by {new Date(job.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="bg-muted px-4 py-3 rounded-lg text-sm text-muted-foreground flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          You posted this job
        </div>
      )}

      <div className="text-muted-foreground leading-relaxed">
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        <p>{job.description}</p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          <p className="text-muted-foreground text-sm">
            Status: <strong className="capitalize">{job.status}</strong>
            {jobStatus === 'closed' && ' (Closed or Expired)'}
          </p>
        </div>
        {!isOwner && jobStatus === 'open' && (
          <Button onClick={() => router.push(`/jobs/${job.id}/apply`)}>
            Apply Now
          </Button>
        )}
      </div>
    </div>
  )
}
