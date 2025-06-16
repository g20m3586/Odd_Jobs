"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ApplyForm({ params }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get business ID from the job
      const { data: job } = await supabase
        .from('jobs')
        .select('user_id')
        .eq('id', params.id)
        .single()

      const { error } = await supabase.from('applications').insert({
        job_id: params.id,
        user_id: user.id,
        business_id: job.user_id,
        cover_letter: coverLetter,
        status: 'pending'
      })

      if (error) throw error

      toast.success('Application submitted!')
      router.push('/dashboard/applications')
    } catch (error) {
      toast.error('Application failed', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Apply for Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Cover Letter</label>
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            minLength={100}
            className="min-h-[200px]"
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </form>
    </div>
  )
}