"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"
import Image from "next/image"
import { uploadItemImage } from '@/lib/images'

const VALID_CONDITIONS = ["new", "like_new", "good", "fair", "poor"]
const DEFAULT_CONDITION = "good"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function ConditionSelect({ value, onChange }) {
  return (
    <select
      id="condition"
      className="w-full h-10 rounded-md border border-input px-3 py-2 text-sm"
      value={value}
      onChange={onChange}
      required
    >
      {VALID_CONDITIONS.map((cond) => (
        <option key={cond} value={cond}>
          {cond.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </option>
      ))}
    </select>
  )
}

function CategorySelect({ value, onChange }) {
  return (
    <select
      id="category"
      className="w-full h-10 rounded-md border border-input px-3 py-2 text-sm"
      value={value}
      onChange={onChange}
    >
      <option value="general">General</option>
      <option value="electronics">Electronics</option>
      <option value="clothing">Clothing</option>
      <option value="furniture">Furniture</option>
      <option value="books">Books</option>
      <option value="vehicles">Vehicles</option>
      <option value="property">Property</option>
    </select>
  )
}

function PostItemForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    condition: DEFAULT_CONDITION,
    category: "general",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("posted") === "1") {
      toast.success("Item posted successfully!")
    }
  }, [searchParams])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP)")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Image size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`)
      return
    }

    setImageFile(file)

    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    if (!formData.title?.trim()) {
      toast.error("Title is required")
      return false
    }
    if (formData.title.trim().length > 100) {
      toast.error("Title must be less than 100 characters")
      return false
    }
    if (!formData.description?.trim()) {
      toast.error("Description is required")
      return false
    }
    if (formData.description.trim().length > 1000) {
      toast.error("Description must be less than 1000 characters")
      return false
    }
    if (formData.price.trim() === "") {
      toast.error("Price is required")
      return false
    }
    const price = parseFloat(formData.price)
    if (isNaN(price) || price < 0 || price > 1000000) {
      toast.error("Please enter a valid price between $0 and $1,000,000")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm() || isSuccess) return

    setLoading(true)
    let uploadSuccessful = false
    let filePath = null

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        toast.error("Please sign in to post an item", {
          action: {
            label: "Sign In",
            onClick: () => router.push("/auth/login"),
          },
        })
        return router.push("/auth/login")
      }

      const condition = VALID_CONDITIONS.includes(formData.condition)
        ? formData.condition
        : DEFAULT_CONDITION

      const trimmedTitle = formData.title.trim()

      // Prevent duplicate title
      const { data: existingItems } = await supabase
        .from("items")
        .select("id")
        .eq("title", trimmedTitle)
        .eq("user_id", user.id)
        .limit(1)

      if (existingItems?.length > 0) {
        toast.error("You already have an item with this title")
        return
      }

      const newItem = {
        title: trimmedTitle,
        description: formData.description.trim(),
        price: Math.max(0, parseFloat(formData.price) || 0),
        condition,
        category: formData.category,
        user_id: user.id,
        created_at: new Date().toISOString(),
      }

if (imageFile) {
  filePath = await uploadItemImage(imageFile, user.id);
  newItem.image_url = filePath; // Store full path
}

      const insertToast = toast.loading("Creating your listing...")

      try {
        const { error: insertError } = await supabase
          .from("items")
          .insert(newItem)

        if (insertError) throw insertError

        setIsSuccess(true)
        toast.dismiss(insertToast)
        router.push("/items/my?posted=1")
      } catch (insertError) {
        // Clean up uploaded image if item creation failed
        if (uploadSuccessful && filePath) {
          await supabase.storage.from("item-images").remove([filePath])
        }
        throw insertError
      } finally {
        toast.dismiss(insertToast)
      }
    } catch (error) {
      console.error("Submission Error:", error)
      let errorMessage = "Failed to post item. Please try again."
      
      if (error.message?.includes('violates check constraint "items_condition_check"')) {
        errorMessage = "Invalid item condition. Please select a valid condition from the dropdown."
      } else if (error.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again."
      }
      
      toast.error(errorMessage)
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
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="What are you selling?"
            maxLength={100}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            rows={5}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe your item in detail..."
            maxLength={1000}
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
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition">Condition *</Label>
            <ConditionSelect
              value={formData.condition}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <CategorySelect
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image (optional)</Label>
          {imagePreview && (
            <div className="mb-2 relative">
              <Image
                src={imagePreview}
                alt="Preview"
                className="h-40 object-cover rounded-md border"
                width={160}
                height={160}
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null)
                  setImagePreview(null)
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
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
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Max file size: {MAX_FILE_SIZE / 1024 / 1024}MB. Formats: JPG, PNG, WEBP
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || isSuccess}
          aria-live="polite"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Posting...</span>
            </>
          ) : isSuccess ? (
            "Posted Successfully!"
          ) : (
            "Post Item"
          )}
        </Button>
      </form>
    </div>
  )
}

export default function PostItemPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <PostItemForm />
    </Suspense>
  )
}