"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronDown, Mail, MessageSquare, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const statusVariant = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400',
  reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400',
  withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('received')
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setUserRole(profile?.role || 'user')
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('applications')
        .select(`
          *,
          job:jobs(id, title, status, user_id),
          applicant:profiles(id, name, avatar_url, email, phone),
          recipient:profiles(id, name, avatar_url, email),
          business:profiles(id, name, avatar_url, email)
        `)
        .order('created_at', { ascending: false })

      if (view === 'received') {
        query = query.or(`recipient_id.eq.${user.id},job.user_id.eq.${user.id}`)
      } else {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query

      if (error) {
        toast.error("Failed to load applications")
        console.error("Supabase error:", error?.message || error)
      } else {
        const transformedData = data?.map(app => ({
          ...app,
          recipient: app.recipient || app.business
        })) || []
        setApplications(transformedData)
      }

      setLoading(false)
    }

    fetchApplications()
  }, [view])

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update status')
      console.error("Status update error:", error?.message || error)
    } else {
      setApplications(applications.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      ))
      toast.success(`Application status updated to ${newStatus}`)
    }
  }

  const handleContact = async (contactInfo) => {
    try {
      await navigator.clipboard.writeText(
        `Contact ${contactInfo.name} at ${contactInfo.email}${contactInfo.phone ? ` or ${contactInfo.phone}` : ''}`
      )
      toast.success('Contact info copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy contact info')
    }
  }

  const getRecipientType = (app) => {
    if (app.job?.user_id === app.recipient?.id) return 'Job Poster'
    if (app.business) return 'Business'
    return 'Recipient'
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {view === 'received' ? 'Applications Received' : 'Applications Submitted'}
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">View:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                {view === 'received' ? 'Received' : 'Submitted'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setView('received')}>
                Received Applications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('submitted')}>
                Submitted Applications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          {view === 'received'
            ? 'No applications received yet'
            : 'You have not submitted any applications yet'}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>{view === 'received' ? 'Applicant' : 'Recipient'}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map(app => (
                <TableRow key={app.id}>
                  <TableCell>
                    <Link href={`/jobs/${app.job_id}`} className="hover:underline font-medium">
                      {app.job?.title || 'Untitled Job'}
                    </Link>
                    {app.job?.status !== 'open' && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({app.job?.status})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {view === 'received' ? (
                        <>
                          <Avatar>
                            <AvatarImage src={app.applicant?.avatar_url} />
                            <AvatarFallback>{app.applicant?.name?.[0] || 'A'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p>{app.applicant?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{app.applicant?.email}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Avatar>
                            <AvatarImage src={app.recipient?.avatar_url} />
                            <AvatarFallback>{app.recipient?.name?.[0] || 'R'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p>{app.recipient?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{getRecipientType(app)}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusVariant[app.status]}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(app.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/applications/${app.id}`}>
                          View
                        </Link>
                      </Button>

                      {view === 'received' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {app.status !== 'accepted' && (
                              <DropdownMenuItem onClick={() => updateStatus(app.id, 'accepted')}>
                                Accept
                              </DropdownMenuItem>
                            )}
                            {app.status !== 'rejected' && (
                              <DropdownMenuItem
                                onClick={() => updateStatus(app.id, 'rejected')}
                                className="text-red-600"
                              >
                                Reject
                              </DropdownMenuItem>
                            )}
                            {app.status !== 'reviewed' && (
                              <DropdownMenuItem onClick={() => updateStatus(app.id, 'reviewed')}>
                                Mark as Reviewed
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleContact({
                                email: app.applicant?.email,
                                phone: app.applicant?.phone,
                                name: app.applicant?.name
                              })}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Contact Applicant
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      {view === 'submitted' && (
                        <>
                          {app.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(app.id, 'withdrawn')}
                            >
                              Withdraw
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContact({
                              email: app.recipient?.email,
                              name: app.recipient?.name
                            })}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
