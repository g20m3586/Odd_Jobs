"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Pencil, Trash2, Tag, DollarSign } from 'lucide-react'

export default function MyItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const getImageUrl = (filename) => {
    if (!filename) return null
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/public/${filename}`
  }

  useEffect(() => {
    const fetchMyItems = async () => {
      setLoading(true)
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        toast.error('Please sign in first')
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to load your items', { description: error.message })
      } else {
        const enriched = data.map(item => ({
          ...item,
          image_url: item.image_url ? getImageUrl(item.image_url) : null
        }))
        setItems(enriched)
      }

      setLoading(false)
    }

    fetchMyItems()
  }, [router])

  const handleDelete = async (id) => {
    const confirmed = confirm('Are you sure you want to delete this item?')
    if (!confirmed) return

    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) {
      toast.error('Error deleting item', { description: error.message })
    } else {
      setItems(items.filter(item => item.id !== id))
      toast.success('Item deleted successfully')
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-start py-12 px-4 animate-fade-in">
      <Card className="w-full max-w-6xl p-6 sm:p-8 shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Items</h1>
            <p className="text-muted-foreground">Manage and edit your listed items</p>
          </div>
          <Button asChild>
            <Link href="/items/post">+ Add New Item</Link>
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-full">
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-muted/40">
              <h3 className="text-lg font-medium mb-2">You haven’t posted anything yet</h3>
              <p className="text-muted-foreground mb-4">Start by listing your first item</p>
              <Button asChild variant="outline">
                <Link href="/items/post">Post an Item</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {items.map(item => (
                <Card key={item.id} className="flex flex-col hover:shadow-md hover:scale-[1.01] transition-all">
                  <CardHeader className="p-4">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-40 object-cover rounded-md mb-3"
                      />
                    ) : (
                      <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                        No image provided
                      </div>
                    )}
                    <CardTitle className="text-lg font-semibold truncate">{item.title}</CardTitle>
                    <div className="text-primary font-bold flex items-center gap-1 mt-1">
                      <DollarSign className="w-4 h-4" />
                      {item.price?.toFixed(2)}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs mt-2 text-muted-foreground capitalize">
                      <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                        <Tag className="h-3 w-3" /> {item.category}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                        {item.condition}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-grow px-4">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {item.description || 'No description'}
                    </p>
                  </CardContent>

                  <CardFooter className="px-4 pb-4 flex justify-between gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/items/edit/${item.id}`}>
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
