"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchApplication = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(*),
          user:profiles(*),
          business:profiles(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        toast.error('Failed to load application')
        router.push('/dashboard/applications')
      } else {
        setApplication(data)
      }
      setLoading(false)
    }

    fetchApplication()
  }, [id, router])

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true)
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(`Application marked as ${newStatus}`)
      setApplication({ ...application, status: newStatus })
    }
    setActionLoading(false)
  }

  if (loading) return <div className="container py-8">Loading...</div>
  if (!application) return <div className="container py-8">Application not found</div>

  return (
    <div className="container py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{application.job.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={application.user.avatar_url} />
                <AvatarFallback>
                  {application.user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">
                Applied by {application.user.name}
              </span>
            </div>
          </div>
          <Badge variant={
            application.status === 'accepted' ? 'success' : 
            application.status === 'rejected' ? 'destructive' : 
            application.status === 'withdrawn' ? 'secondary' : 'outline'
          }>
            {application.status}
          </Badge>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="font-semibold mb-2">Cover Letter</h2>
            <div className="bg-muted/50 p-4 rounded whitespace-pre-line">
              {application.cover_letter || 'No cover letter provided'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="font-semibold mb-2">Application Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span>
                    {new Date(application.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>
                    {new Date(application.updated_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job Status:</span>
                  <Badge variant="outline">
                    {application.job.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Actions</h2>
              <div className="flex flex-wrap gap-2">
                {application.status !== 'accepted' && (
                  <Button 
                    onClick={() => handleStatusChange('accepted')}
                    disabled={actionLoading}
                  >
                    Accept Application
                  </Button>
                )}
                {application.status !== 'rejected' && (
                  <Button 
                    variant="destructive"
                    onClick={() => handleStatusChange('rejected')}
                    disabled={actionLoading}
                  >
                    Reject Application
                  </Button>
                )}
                {application.status !== 'reviewed' && (
                  <Button 
                    variant="secondary"
                    onClick={() => handleStatusChange('reviewed')}
                    disabled={actionLoading}
                  >
                    Mark as Reviewed
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href={`/jobs/${application.job_id}`}>
                    View Job
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}