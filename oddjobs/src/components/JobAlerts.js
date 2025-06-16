// components/JobAlerts.js
"use client"
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function JobAlerts({ userId }) {
  useEffect(() => {
    const channel = supabase.channel('job_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jobs',
          filter: `category=eq.${userInterest}`
        },
        (payload) => {
          toast.info(`New job: ${payload.new.title}`, {
            action: {
              label: 'View',
              onClick: () => router.push(`/jobs/${payload.new.id}`)
            }
          })
        }
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [userId])
}