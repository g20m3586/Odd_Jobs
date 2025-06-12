"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function EditJobPage() {
  const router = useRouter()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    status: 'open'
  })

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        toast.error('Failed to load job')
        router.push('/dashboard/my-jobs')
      } else {
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price,
          status: data.status
        })
      }
    }

    fetchJob()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('jobs')
      .update(formData)
      .eq('id', id)

    if (error) {
      toast.error('Update failed')
    } else {
      toast.success('Job updated!')
      router.push('/dashboard/my-jobs')
    }
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Job</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Save Changes</Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push('/dashboard/my-jobs')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}