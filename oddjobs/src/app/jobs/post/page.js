"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export default function PostJobPage() {
  const [preview, setPreview] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Design',
    deadline: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)

  const categories = [
    'Design',
    'Development',
    'Marketing',
    'Writing',
    'Administrative',
    'Customer Service',
    'Sales',
    'Other'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
        throw new Error('Please fill all required fields')
      }

      const { data, error } = await supabase.from('jobs').insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        deadline: formData.deadline || null,
        user_id: user.id,
        status: 'open',
        address: formData.address.trim() || null,
        is_featured: false
      }).select().single()

      if (error) throw error

      // Success toast with action button
      toast.success("Job posted successfully!", {
        description: "Your job is now live and visible to applicants.",
        action: {
          label: "View Job",
          onClick: () => router.push(`/jobs/${data.id}`)
        },
        duration: 10000
      })
      setTimeout(() => router.push('/jobs/myjobs'), 3000)

    } catch (error) {
      // Error toast
      toast.error("Failed to post job", {
        description: error.message,
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto">
<h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
<p className="text-muted-foreground mb-6">
  Fill out the form below to create your job listing
</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter job title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the job requirements"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Budget ($) *</Label>
            <Input
              id="price"
              type="number"
              min="1"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Enter budget"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              id="category"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline (optional)</Label>
          <Input
            id="deadline"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Location (optional)</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter job location or address"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Posting...' : 'Post Job'}
        </Button>
        
      </form>
    </div>
  )
}