"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { 
  ChevronLeft,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Clock,
  Check,
  X
} from 'lucide-react'

export default function ReceivedApplicationDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            job:jobs(title, description, price),
            applicant:profiles(name, email, phone, avatar_url, bio)
          `)
          .eq('id', id)
          .eq('business_id', user.id)
          .single()

        if (error || !data) {
          toast.error('Application not found')
          router.push('/dashboard/received-applications')
          return
        }

        setApplication(data)
      } catch (error) {
        console.error('Error fetching application:', error)
        toast.error('Failed to load application')
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [id, router])

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true)
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      toast.success(`Application marked as ${newStatus}`)
      setApplication(prev => ({ ...prev, status: newStatus }))
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container py-8">
        <p>Application not found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push('/dashboard/received-applications')}
        >
          Back to Applications
        </Button>
      </div>
    )
  }

  const statusVariant = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400',
    withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }

  return (
    <div className="container py-8 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/dashboard/received-applications')}
        className="mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Applications
      </Button>

      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{application.job.title}</h1>
              <p className="text-muted-foreground mt-1">Application from {application.applicant.name}</p>
            </div>
            <Badge className={`${statusVariant[application.status]} capitalize`}>
              {application.status}
            </Badge>
          </div>
        </div>

        {/* Applicant Info */}
        <div className="p-6 border-b">
          <div className="flex items-start gap-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={application.applicant.avatar_url} />
              <AvatarFallback>
                {application.applicant.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="space-y-1">
                <h3 className="font-semibold">Applicant Details</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{application.applicant.email}</span>
                </div>
                {application.applicant.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{application.applicant.phone}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Application Details</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Applied on {new Date(application.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>Job Price: ${application.job.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Letter */}
        <div className="p-6 border-b">
          <h3 className="font-semibold mb-4">Cover Letter</h3>
          <div className="prose dark:prose-invert max-w-none">
            {application.cover_letter ? (
              <p className="whitespace-pre-line">{application.cover_letter}</p>
            ) : (
              <p className="text-muted-foreground italic">No cover letter provided</p>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="p-6 border-b">
          <h3 className="font-semibold mb-4">Job Description</h3>
          <div className="prose dark:prose-invert max-w-none">
            {application.job.description ? (
              <p className="whitespace-pre-line">{application.job.description}</p>
            ) : (
              <p className="text-muted-foreground italic">No description provided</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6">
          <h3 className="font-semibold mb-4">Manage Application</h3>
          <div className="flex flex-wrap gap-3">
            {application.status !== 'reviewed' && (
              <Button 
                variant="secondary"
                onClick={() => updateStatus('reviewed')}
                disabled={updating}
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark as Reviewed
              </Button>
            )}
            {application.status !== 'accepted' && (
              <Button 
                onClick={() => updateStatus('accepted')}
                disabled={updating}
              >
                <Check className="h-4 w-4 mr-2" />
                Accept Application
              </Button>
            )}
            {application.status !== 'rejected' && (
              <Button 
                variant="destructive"
                onClick={() => updateStatus('rejected')}
                disabled={updating}
              >
                <X className="h-4 w-4 mr-2" />
                Reject Application
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => router.push(`/jobs/${application.job_id}`)}
            >
              View Job Posting
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}