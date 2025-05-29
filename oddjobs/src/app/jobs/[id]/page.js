// "use client"

import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link';


export default async function JobDetailPage({ params }) {
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !job) return notFound()

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
        <p className="text-primary text-2xl font-medium mb-4">${job.price.toFixed(2)}</p>
        
        <div className="bg-muted/50 p-6 rounded-lg mb-6">
          <h2 className="font-semibold mb-2">Job Description</h2>
          <p className="whitespace-pre-line">{job.description}</p>
        </div>

        <div className="flex gap-4">
          <Button asChild>
            <Link href={`/jobs/${job.id}/apply`}>Apply Now</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/jobs">Back to Listings</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}