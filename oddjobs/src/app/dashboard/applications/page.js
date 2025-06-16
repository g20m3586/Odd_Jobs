"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const statusVariant = {
  pending: 'secondary',
  reviewed: 'outline',
  accepted: 'success',
  rejected: 'destructive',
  withdrawn: 'outline'
}

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('applications')
        .select(`
          id, status, created_at,
          job:jobs(title, price)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setApplications(data || [])
      setLoading(false)
    }

    fetchApplications()
  }, [])

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.job.title}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[app.status]}>
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(app.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>${app.job.price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}