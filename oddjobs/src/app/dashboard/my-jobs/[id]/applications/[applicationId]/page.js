"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ApplicationDetail() {
  const { id: jobId, applicationId } = useParams()
  const router = useRouter()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          cover_letter,
          created_at,
          applicant:profiles(name, email, phone, avatar_url),
          job:jobs(title)
        `)
        .eq('id', applicationId)
        .single()

      if (error || !data) {
        toast.error('Application not found')
        router.push(`/dashboard/my-jobs/${jobId}/applications`)
      } else {
        setApplication(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [jobId, applicationId, router])

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Application for {application.job.title}
        </h1>
        <Button 
          variant="outline"
          onClick={() => router.push(`/dashboard/my-jobs/${jobId}/applications`)}
        >
          Back to Applications
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
        <div className="flex items-start gap-6 mb-8">
          {application.applicant.avatar_url ? (
            <img
              src={application.applicant.avatar_url}
              className="h-16 w-16 rounded-full"
              alt="Applicant"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
              {application.applicant.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{application.applicant.name}</h2>
            <p className="text-muted-foreground">{application.applicant.email}</p>
            <p className="text-muted-foreground">{application.applicant.phone}</p>
            <Badge className="mt-2">
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Cover Letter</h3>
          <div className="prose dark:prose-invert max-w-none">
            {application.cover_letter ? (
              <p className="whitespace-pre-line">{application.cover_letter}</p>
            ) : (
              <p className="text-muted-foreground italic">No cover letter provided</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}