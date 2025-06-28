"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { use } from 'react'

export default function ApplyPage({ params: paramsPromise }) {
  
  const params = use(paramsPromise)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [jobValid, setJobValid] = useState(true)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkJobEligibility = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: job, error } = await supabase
        .from('jobs')
        .select('user_id, deadline, status')
        .eq('id', params.id)
        .single()

      if (error || !job) {
        setJobValid(false)
        return
      }

      if (user?.id === job.user_id) {
        setIsOwner(true)
        return
      }

      const deadlinePassed = job.deadline && new Date(job.deadline) < new Date()
      if (job.status !== 'open' || deadlinePassed) {
        setJobValid(false)
        return
      }

      // Check if the user already applied
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', params.id)
        .maybeSingle()

      if (existingApplication) {
        setAlreadyApplied(true)
      }
    }

    checkJobEligibility()
  }, [params.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from('applications').insert({
        job_id: params.id,
        user_id: user.id,
        cover_letter: coverLetter,
        status: 'pending'
      })

      if (error) throw error

      toast.success('Application submitted successfully!')
      router.push(`/jobs/${params.id}`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!jobValid) {
    return (
      <div className="container py-16 text-center">
        <p className="text-lg text-destructive font-semibold">
          This job is not available or the deadline has passed.
        </p>
        <Button className="mt-4" onClick={() => router.push('/jobs')}>
          Back to Jobs
        </Button>
      </div>
    )
  }

  if (isOwner) {
    return (
      <div className="container py-16 text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          You cannot apply to your own job.
        </p>
        <Button className="mt-4" onClick={() => router.push(`/jobs/${params.id}`)}>
          Go Back
        </Button>
      </div>
    )
  }

  if (alreadyApplied) {
    return (
      <div className="container py-16 text-center">
        <p className="text-lg text-muted-foreground">
          You have already applied to this job.
        </p>
        <Button className="mt-4" onClick={() => router.push(`/jobs/${params.id}`)}>
          View Job
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Apply for this Job</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Cover Letter *</label>
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Explain why you're the best candidate..."
            rows={8}
            minLength={100}
            required
          />
          <p className="text-sm text-muted-foreground">
            Minimum 100 characters. Share your relevant experience.
          </p>
        </div>

        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={loading || coverLetter.length < 100}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(`/jobs/${params.id}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
