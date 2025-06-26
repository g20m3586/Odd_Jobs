"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ApplyPage({ params }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkOwnership = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: job } = await supabase
        .from('jobs')
        .select('user_id')
        .eq('id', params.id)
        .single()

      if (user?.id === job?.user_id) {
        setIsOwner(true)
        toast.error("You can't apply to your own job")
        router.push(`/jobs/${params.id}`)
      }
    }
    checkOwnership()
  }, [params.id, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: job } = await supabase
        .from('jobs')
        .select('user_id')
        .eq('id', params.id)
        .single()

      if (!job) throw new Error('Job not found')
      if (user.id === job.user_id) throw new Error("Can't apply to your own job")

      const { error } = await supabase.from('applications').insert({
        job_id: params.id,
        user_id: user.id,
        business_id: job.user_id,
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

  if (isOwner) return null

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