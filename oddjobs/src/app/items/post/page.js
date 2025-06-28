// src/app/items/post/page.js
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function PostItemPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'good',
    category: 'general'
  })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be signed in to post an item.")

      if (!formData.title || !formData.price || !formData.description) {
        throw new Error("All required fields must be filled.")
      }

      const newItem = {
        ...formData,
        price: parseFloat(formData.price),
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      if (image) {
        const filePath = `public/${image.name}`
        const { data, error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(filePath, image)

        if (uploadError) throw uploadError
        newItem.image_url = data.path
      }

      const { error } = await supabase.from('items').insert(newItem)
      if (error) throw error

      toast.success('Item posted successfully!')
      router.push('/items')
    } catch (err) {
      toast.error('Error posting item', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Post an Item</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Item Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition">Condition *</Label>
            <select
              id="condition"
              className="w-full h-10 rounded-md border border-input px-3 py-2 text-sm"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            >
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="used">Used</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            className="w-full h-10 rounded-md border border-input px-3 py-2 text-sm"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="general">General</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="furniture">Furniture</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image (optional)</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0])}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Posting...' : 'Post Item'}
        </Button>
      </form>
    </div>
  )
}
