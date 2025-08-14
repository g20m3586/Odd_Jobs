"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"
import Image from "next/image"
import { getItemImageUrl, uploadItemImage, deleteItemImage } from '@/lib/images'

const VALID_CONDITIONS = ["new", "like_new", "good", "fair", "poor"]
const CATEGORIES = ["general", "electronics", "clothing", "books", "furniture", "vehicles", "property"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_TITLE_LENGTH = 100
const MAX_DESC_LENGTH = 1000

export default function EditItemPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
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
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error("Not authenticated")

        const { data: item, error } = await supabase
          .from("items")
          .select("*")
          .eq("id", id)
          .single()

        if (error || !item) throw error || new Error("Item not found")
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

        if (item.image_url) {
          setCurrentImage(item.image_url)
        }
      } catch (error) {
        console.error("Fetch error:", error)
        toast.error("Error loading item", {
          description: error.message || "Please try again later"
        })
        router.push("/items/my")
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, router])

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP)")
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Image size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`)
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    // Title validation
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return false
    }
    if (formData.title.length > MAX_TITLE_LENGTH) {
      toast.error(`Title must be less than ${MAX_TITLE_LENGTH} characters`)
      return false
    }

    // Description validation
    if (!formData.description.trim()) {
      toast.error("Description is required")
      return false
    }
    if (formData.description.length > MAX_DESC_LENGTH) {
      toast.error(`Description must be less than ${MAX_DESC_LENGTH} characters`)
      return false
    }

    // Price validation
    if (!formData.price.trim()) {
      toast.error("Price is required")
      return false
    }
    const price = parseFloat(formData.price)
    if (isNaN(price) || price < 0 || price > 1000000) {
      toast.error("Please enter a valid price between $0 and $1,000,000")
      return false
    }

    // Condition validation
    if (!VALID_CONDITIONS.includes(formData.condition)) {
      toast.error("Invalid item condition selected")
      return false
    }

    return true
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!validateForm() || updating) return

  setUpdating(true)
  let filePath = null
  let newImageUrl = null

  try {
    // Verify user is still authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      toast.error("Session expired. Please sign in again.", {
        action: {
          label: "Sign In",
          onClick: () => router.push("/auth/login"),
        },
      })
      return
    }

    // Verify the item still exists and belongs to the user
    const { data: existingItem, error: fetchError } = await supabase
      .from("items")
      .select("id, user_id, image_url")
      .eq("id", id)
      .single()

    if (fetchError || !existingItem) {
      throw new Error("Item not found or you don't have permission to edit it")
    }

    if (existingItem.user_id !== user.id) {
      throw new Error("You are not authorized to edit this item")
    }

    const price = parseFloat(formData.price)

    // Handle image upload if new image was selected
// In your handleSubmit function, modify the image URL handling:
if (imageFile) {
  filePath = await uploadItemImage(imageFile, user.id);
  newImageUrl = filePath;
}
if (newImageUrl && existingItem.image_url) {
  await deleteItemImage(existingItem.image_url);
}

    // Prepare updates
    const updates = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price,
      category: formData.category,
      condition: formData.condition,
      updated_at: new Date().toISOString(),
      ...(newImageUrl && { image_url: newImageUrl })
    }

    // Update item in database with explicit error handling
    const updateToast = toast.loading("Saving changes...")
    try {
      const { data: updatedItem, error: updateError } = await supabase
        .from("items")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (updateError) {
        // Handle specific constraint violations
        if (updateError.code === '23505') {
          throw new Error("An item with this title already exists")
        }
        throw updateError
      }

      // Delete old image if it exists and was replaced
      if (newImageUrl && existingItem.image_url) {
        try {
          await supabase.storage
            .from("item-images")
            .remove([`public/${existingItem.image_url}`])
        } catch (cleanupError) {
          console.error("Failed to cleanup old image:", cleanupError)
          // Not critical - we can continue
        }
      }

      toast.success("Item updated successfully!")
      router.push("/items/my")
    } catch (updateError) {
      console.error("Update error:", updateError)
      throw updateError
    } finally {
      toast.dismiss(updateToast)
    }

  } catch (error) {
    console.error("Submission error:", error)
    
    // Clean up uploaded file if update failed
    if (filePath && newImageUrl) {
      try {
        await supabase.storage.from("item-images").remove([filePath])
      } catch (cleanupError) {
        console.error("Failed to cleanup new image:", cleanupError)
      }
    }

    let errorMessage = "Failed to update item"
    if (error.message.includes("Item not found")) {
      errorMessage = "This item no longer exists"
    } else if (error.message.includes("not authorized")) {
      errorMessage = "You don't have permission to edit this item"
    } else if (error.message.includes("title already exists")) {
      errorMessage = "An item with this title already exists"
    }

    toast.error(errorMessage, {
      description: error.message || "Please try again.",
      action: error.message.includes("Session expired") ? {
        label: "Sign In",
        onClick: () => router.push("/auth/login"),
      } : undefined
    })
  } finally {
    setUpdating(false)
  }
}

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p>Loading item details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-background p-6 rounded-lg shadow-md border animate-fade-in">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Item</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={MAX_TITLE_LENGTH}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              rows={5}
              onChange={handleInputChange}
              maxLength={MAX_DESC_LENGTH}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition *</Label>
            <select
              id="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
            <Label htmlFor="image">Item Image</Label>

{(currentImage || imagePreview) && (
  <div className="relative mb-2">
    <Image
  src={imagePreview || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${currentImage}`}
  alt="Item preview"
  width={300}
  height={200}
  className="rounded-md object-cover w-full h-40 border"
  unoptimized={true} // Disables Next.js image optimization
/>
    <button
      type="button"
      onClick={() => {
        setImageFile(null);
        setImagePreview(null);
        setCurrentImage(null);
      }}
      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
      aria-label="Remove image"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
)}
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
              disabled={updating}
            />
            <p className="text-xs text-muted-foreground">
              Max file size: {MAX_FILE_SIZE / 1024 / 1024}MB (JPEG, PNG, WEBP)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={updating}
            aria-live="polite"
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}