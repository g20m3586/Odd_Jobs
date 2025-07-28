"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { Clock, MapPin, DollarSign, BadgeCheck } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'

export default function MyJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const fetchUserAndJobs = async () => {
      setLoading(true)
      try {
        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          toast.error('You must be logged in to view your jobs')
          setJobs([])
          setUserId(null)
          setLoading(false)
          return
        }
        setUserId(user.id)

        // Fetch jobs for user
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setJobs(data || [])
      } catch (error) {
        toast.error('Failed to load jobs', { description: error.message })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndJobs()
  }, [])

  const confirmDelete = (job) => {
    setJobToDelete(job)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!jobToDelete) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobToDelete.id)

      if (error) throw error

      toast.success('Job deleted successfully!')
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id))
      setDeleteModalOpen(false)
      setJobToDelete(null)
    } catch (error) {
      toast.error('Failed to delete job', { description: error.message })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading your jobs...</p>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="container py-8 text-center">
        <p>Please log in to view your posted jobs.</p>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Posted Jobs</h1>

      {jobs.length === 0 ? (
        <p>You have not posted any jobs yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="flex flex-col hover:shadow-lg transition-all"
            >
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link href={`/jobs/${job.id}`} className="hover:underline">
                    {job.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="line-clamp-3 text-muted-foreground">{job.description}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                    <DollarSign className="h-3 w-3" /> {job.price?.toFixed(2)}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full capitalize">
                    {job.category}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                    <MapPin className="h-3 w-3" /> {job.address || 'Remote'}
                  </span>
                  {job.deadline && (
                    <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                      <Clock className="h-3 w-3" /> Apply by {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/jobs/edit/${job.id}`}>
                  <Button variant="outline" className="flex-grow">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="flex-grow"
                  onClick={() => confirmDelete(job)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Job"
        description={`Are you sure you want to delete the job "${jobToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
