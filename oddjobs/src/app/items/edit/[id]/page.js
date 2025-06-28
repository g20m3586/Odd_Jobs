"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function EditItemPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: ""
  })

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        const { data: item, error } = await supabase
          .from("items")
          .select("*")
          .eq("id", id)
          .single()

        if (error || !item) throw error
        if (item.user_id !== user.id) {
          toast.error("You are not authorized to edit this item.")
          router.push("/items/my")
          return
        }

        setFormData({
          title: item.title,
          description: item.description,
          price: item.price.toString(),
          category: item.category,
          condition: item.condition
        })
      } catch (error) {
        toast.error("Error loading item", { description: error.message })
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, router])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)

    try {
      let image_url = null

      // Upload new image if provided
      if (imageFile) {
        const ext = imageFile.name.split(".").pop()
        const filePath = `items/${Date.now()}-${Math.random()}.${ext}`

        const { data, error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError
        image_url = data?.path
      }

      // Update item
      const updates = {
        ...formData,
        price: parseFloat(formData.price),
      }

      if (image_url) updates.image_url = image_url

      const { error } = await supabase
        .from("items")
        .update(updates)
        .eq("id", id)

      if (error) throw error

      toast.success("Item updated successfully!")
      router.push("/items/my")
    } catch (error) {
      toast.error("Update failed", { description: error.message })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="container py-12 text-center">Loading item...</div>
  }

  return (
    <div className="container max-w-2xl py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Edit Item</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={formData.title} onChange={handleInputChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={formData.description} rows={4} onChange={handleInputChange} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input id="price" type="number" value={formData.price} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={handleInputChange}
              className="border rounded-md h-10 px-3 text-sm w-full"
              required
            >
              <option value="general">General</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
              <option value="furniture">Furniture</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <select
            id="condition"
            value={formData.condition}
            onChange={handleInputChange}
            className="border rounded-md h-10 px-3 text-sm w-full"
            required
          >
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Change Image</Label>
          <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0])} />
        </div>

        <Button type="submit" className="w-full" disabled={updating}>
          {updating ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  )
}
