"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Check, X, Clock } from 'lucide-react'
import { toast } from 'sonner'

const statusMap = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-800' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' }
}

export default function JobApplications() {
  const { id: jobId } = useParams()
  const router = useRouter()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Verify job ownership first
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (jobError || !job) {
        router.push('/dashboard/my-jobs')
        return
      }

      // Fetch applications
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          cover_letter,
          created_at,
          updated_at,
          applicant:profiles(id, name, email, avatar_url)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to load applications')
      } else {
        setApplications(data || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [jobId, router])

  const updateStatus = async (applicationId, status) => {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId)

    if (error) {
      toast.error('Update failed')
    } else {
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ))
      toast.success(`Status updated to ${status}`)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Job Applications</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/my-jobs')}
        >
          Back to My Jobs
        </Button>
      </div>

      {applications.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No applications yet</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {application.applicant.avatar_url ? (
                      <img 
                        src={application.applicant.avatar_url} 
                        className="h-8 w-8 rounded-full" 
                        alt="Applicant"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {application.applicant.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{application.applicant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {application.applicant.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusMap[application.status].color}>
                    {statusMap[application.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(application.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(application.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateStatus(application.id, 'reviewed')}
                        className="flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Mark as Reviewed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateStatus(application.id, 'accepted')}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Accept Application
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateStatus(application.id, 'rejected')}
                        className="flex items-center gap-2 text-red-600"
                      >
                        <X className="h-4 w-4" />
                        Reject Application
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}