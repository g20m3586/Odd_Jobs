"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const VALID_CONDITIONS = ["new", "like_new", "good", "fair", "poor"]
const CATEGORIES = ["general", "electronics", "clothing", "books", "furniture", "vehicles", "property"]

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
    category: "general",
    condition: "good"
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
          title: item.title || "",
          description: item.description || "",
          price: item.price?.toString() || "",
          category: item.category || "general",
          condition: item.condition || "good"
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
      const price = parseFloat(formData.price)
      if (isNaN(price) || price < 0 || price > 1000000) {
        toast.error("Please enter a valid price between $0 and $1,000,000")
        setUpdating(false)
        return
      }

      if (!VALID_CONDITIONS.includes(formData.condition)) {
        toast.error("Invalid item condition")
        setUpdating(false)
        return
      }

      let image_url = null

      if (imageFile) {
        const ext = imageFile.name.split(".").pop()
        const filePath = `public/${Date.now()}-${Math.random()}.${ext}`
        const uploadToast = toast.loading("Uploading image...")

        const { data, error: uploadError } = await supabase
          .storage
          .from("item-images")
          .upload(filePath, imageFile)

        toast.dismiss(uploadToast)

        if (uploadError) throw uploadError
        const { data: publicUrlData } = supabase.storage
          .from("item-images")
          .getPublicUrl(filePath)

        image_url = publicUrlData?.publicUrl
      }

      const updates = {
        ...formData,
        price,
        image_url: image_url || undefined
      }

      const { error } = await supabase
        .from("items")
        .update(updates)
        .eq("id", id)

      if (error) throw error

      toast.success("Item updated successfully!")
      router.push("/items/my")
    } catch (error) {
      console.error("Update failed:", error)
      toast.error("Update failed", {
        description: error.message || "Something went wrong"
      })
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
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
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
            {VALID_CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Change Image</Label>
          <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0])} />
        </div>

        <Button type="submit" className="w-full" disabled={updating}>
          {updating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  )
}
