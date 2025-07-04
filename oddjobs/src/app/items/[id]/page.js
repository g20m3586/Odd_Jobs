"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function ItemDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [item, setItem] = useState(null)
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  const getImageUrl = (filename) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/public/${filename}`

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUserId(user?.id)

        const { data, error } = await supabase
          .from("items")
          .select("*")
          .eq("id", id)
          .single()

        if (error || !data) throw error
        setItem(data)
      } catch (error) {
        toast.error("Failed to load item", { description: error.message })
        router.push("/items")
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, router])

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this item?")
    if (!confirm) return

    const { error } = await supabase.from("items").delete().eq("id", id)

    if (error) {
      toast.error("Error deleting item", { description: error.message })
    } else {
      toast.success("Item deleted")
      router.push("/items/my")
    }
  }

  if (loading) {
    return (
      <div className="container py-10 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-5 w-1/4 mb-2" />
        <Skeleton className="h-60 w-full rounded mb-4" />
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="min-h-screen flex justify-center px-4 py-10 animate-fade-in">
      <Card className="w-full max-w-3xl p-6">
        <CardHeader className="mb-4">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <p className="text-muted-foreground text-sm capitalize mt-1">
            {item.condition} • {item.category}
          </p>
        </CardHeader>

        {item.image_url ? (
          <img
            src={getImageUrl(item.image_url)}
            alt={item.title}
            className="w-full h-72 object-cover rounded-lg shadow mb-4"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-72 bg-muted rounded-md flex items-center justify-center text-muted-foreground mb-4">
            No image available
          </div>
        )}

        <CardContent className="space-y-3">
          <p className="text-lg font-semibold text-primary">
            ${item.price.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </CardContent>

        <CardFooter className="flex justify-end gap-4 pt-6">
          {userId === item.user_id ? (
            <>
              <Button onClick={() => router.push(`/items/edit/${item.id}`)}>Edit</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </>
          ) : (
            <Button variant="outline">Contact Seller</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
