"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useParams } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function EditJobPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'general',
    deadline: '',
    address: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch existing job data on mount
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .eq('user_id', user.id) // Make sure user owns the job
          .single()

        if (error) throw error
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category || 'general',
          deadline: data.deadline ? data.deadline.split('T')[0] : '',
          address: data.address || '',
        })
      } catch (error) {
        toast.error('Failed to load job', { description: error.message })
        router.back()
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [jobId, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Validate inputs
      if (!formData.title || !formData.description || !formData.price) {
        throw new Error('Please fill all required fields')
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const updates = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        deadline: formData.deadline || null,
        address: formData.address || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Job updated successfully!')
      router.push('/jobs/myjobs')
    } catch (error) {
      toast.error('Failed to update job', { description: error.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading job data...</p>
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Job</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Budget ($) *</Label>
            <Input
              id="price"
              type="number"
              min="5"
              step="1"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="general">General</option>
              <option value="design">Design</option>
              <option value="development">Development</option>
              <option value="writing">Writing</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline (optional)</Label>
          <Input
            id="deadline"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Location (optional)</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Enter job location or address"
          />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Saving...' : 'Update Job'}
        </Button>
      </form>
    </div>
  )
}
