"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ApplyPage({ params }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [jobValid, setJobValid] = useState(true)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [jobDetails, setJobDetails] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkJobEligibility = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: job, error } = await supabase
        .from('jobs')
        .select('id, title, user_id, deadline, status')
        .eq('id', params.id)
        .single()

      if (error || !job) {
        setJobValid(false)
        return
      }

      setJobDetails(job)

      if (user?.id === job.user_id) {
        setIsOwner(true)
        return
      }

      // Check if job is closed (status check takes priority)
      if (job.status !== 'open') {
        setJobValid(false)
        return
      }

      // Only check deadline if it exists
      if (job.deadline) {
        const deadlinePassed = new Date(job.deadline) < new Date()
        if (deadlinePassed) {
          setJobValid(false)
          return
        }
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-xl font-semibold text-destructive">Job Unavailable</h2>
        <p className="text-muted-foreground">
          {jobDetails?.status === 'closed' 
            ? 'This position has been closed' 
            : 'The application period has ended'}
        </p>
        <Button onClick={() => router.push('/jobs')}>Browse Open Jobs</Button>
      </div>
    )
  }

  if (isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-xl font-semibold">Own Job Restriction</h2>
        <p className="text-muted-foreground">You can't apply to your own listing</p>
        <Button onClick={() => router.push(`/jobs/${params.id}`)}>
          View Your Listing
        </Button>
      </div>
    )
  }

  if (alreadyApplied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-xl font-semibold">Application Submitted</h2>
        <p className="text-muted-foreground">
          You've already applied for {jobDetails?.title || 'this position'}
        </p>
        <Button onClick={() => router.push(`/jobs/${params.id}`)}>
          View Application Status
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Apply for Position</h1>
          {jobDetails?.title && (
            <h2 className="text-xl text-primary font-medium">
              {jobDetails.title}
            </h2>
          )}
          {jobDetails?.deadline && (
            <p className="text-sm text-muted-foreground">
              Apply before: {new Date(jobDetails.deadline).toLocaleDateString()}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium">Cover Letter *</label>
              <span className={`text-sm ${
                coverLetter.length < 15 ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {coverLetter.length}/15 min
              </span>
            </div>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder={`Explain why you're perfect for "${jobDetails?.title || 'this position'}"...\n\nTip: Focus on relevant skills and measurable achievements.`}
              rows={8}
              minLength={15}
              required
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Minimum 15 characters. Tailor your response to this specific role.
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading || coverLetter.length < 15}
              className="min-w-[180px]"
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
    </div>
  )
}