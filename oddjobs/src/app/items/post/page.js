"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// Valid values that match your database constraints
const VALID_CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor']
const DEFAULT_CONDITION = 'good'

export default function PostItemPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: DEFAULT_CONDITION,
    category: 'general'
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setImage(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    if (!formData.title?.trim()) {
      toast.error('Title is required')
      return false
    }
    if (formData.title.trim().length > 100) {
      toast.error('Title must be less than 100 characters')
      return false
    }
    if (!formData.description?.trim()) {
      toast.error('Description is required')
      return false
    }
    if (formData.description.trim().length > 1000) {
      toast.error('Description must be less than 1000 characters')
      return false
    }
    const price = parseFloat(formData.price)
    if (isNaN(price) || price < 0 || price > 1000000) {
      toast.error('Please enter a valid price between $0 and $1,000,000')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setLoading(true)
    let uploadSuccessful = false

    try {
      // 1. Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        toast.error('Please sign in to post an item', {
          action: {
            label: 'Sign In',
            onClick: () => router.push('/auth/login')
          }
        })
        return router.push('/auth/login')
      }

      // 2. Prepare item data with validated condition
      const condition = VALID_CONDITIONS.includes(formData.condition) 
        ? formData.condition 
        : DEFAULT_CONDITION

      const newItem = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        condition: condition,
        category: formData.category,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      // 3. Handle image upload if exists
// 3. Handle image upload if exists
if (image) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `public/${fileName}`
  
    const uploadToast = toast.loading('Uploading image...')
  
    try {
      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(filePath, image)
  
      if (uploadError) throw uploadError
  
      uploadSuccessful = true
  
      // ✅ Save the actual public URL from Supabase
      const { data: publicUrlData } = supabase
        .storage
        .from('item-images')
        .getPublicUrl(filePath)
  
      newItem.image_url = publicUrlData?.publicUrl || ''
    } finally {
      toast.dismiss(uploadToast)
    }
  }
  

      // 4. Insert to database
      const insertToast = toast.loading('Creating your listing...')
      
      try {
        const { error: insertError } = await supabase
          .from('items')
          .insert(newItem)

        if (insertError) {
          // Clean up uploaded image if database insert failed
          if (uploadSuccessful && newItem.image_url) {
            await supabase.storage
              .from('item-images')
              .remove([`public/${newItem.image_url}`])
          }
          throw insertError
        }

        // 5. Success handling
        toast.success('Item posted successfully!', {
          action: {
            label: 'View Marketplace',
            onClick: () => router.push('/items')
          }
        })
        router.push('/items?posted=1')

      } finally {
        toast.dismiss(insertToast)
      }

    } catch (error) {
      console.error('Submission Error:', error)
      
      if (error.message?.includes('violates check constraint "items_condition_check"')) {
        toast.error('Invalid item condition', {
          description: 'Please select a valid condition from the dropdown'
        })
      } else {
        toast.error(error.message || 'Failed to post item', {
          description: 'Please check your inputs and try again'
        })
      }
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
            placeholder="What are you selling?"
            maxLength={100}
            required
          />
          <p className="text-xs text-muted-foreground">
            {formData.title.length}/100 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your item in detail..."
            maxLength={1000}
            required
          />
          <p className="text-xs text-muted-foreground">
            {formData.description.length}/1000 characters
          </p>
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
              placeholder="0.00"
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
            required
          >
            {VALID_CONDITIONS.map(cond => (
              <option key={cond} value={cond}>
                {cond.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </option>
            ))}
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
            <option value="books">Books</option>
            <option value="vehicles">Vehicles</option>
            <option value="property">Property</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image (optional)</Label>
          {imagePreview && (
            <div className="mb-2">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-40 object-cover rounded-md border"
              />
            </div>
          )}
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            Maximum file size: 5MB. Supported formats: JPG, PNG, WEBP
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            'Post Item'
          )}
        </Button>
      </form>
    </div>
  )
}