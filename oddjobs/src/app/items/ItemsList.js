"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/client'
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { AlertCircle, Tag, DollarSign } from 'lucide-react'
import { getItemImageUrl } from '@/lib/images'

export default function ItemsList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()



  useEffect(() => {
const fetchItems = async () => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Simplify image handling - no need for manual image checking
    const itemsWithUrls = data.map(item => ({
      ...item,
      image_url: item.image_url ? getItemImageUrl(item.image_url) : null
    }))

    setItems(itemsWithUrls)
  } catch (err) {
    toast.error('Failed to load items', { 
      description: err.message 
    })
  } finally {
    setLoading(false)
  }
}
    fetchItems()
  }, [])

  // ... rest of your component code remains the same ...


  useEffect(() => {
    if (searchParams.get('posted') === '1') {
      toast.success('Item successfully posted!')
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="h-full flex flex-col">
            <CardHeader>
              <Skeleton className="h-40 w-full rounded-md mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg bg-muted/40">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 mx-auto" />
        <h3 className="text-lg font-medium mb-2">No items available</h3>
        <p className="text-muted-foreground mb-4">Be the first to list an item!</p>
        <Button asChild variant="outline">
          <Link href="/items/post">List an Item</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-md hover:scale-[1.01] transition-all h-full flex flex-col">
<CardHeader className="p-4">
  {item.image_url ? (
    <img
      src={item.image_url}
      alt={item.title}
      className="w-full h-40 object-cover rounded-md mb-3"
      onError={(e) => {
        e.currentTarget.onerror = null
        e.currentTarget.style.display = 'none'
      }}
    />
  ) : (
    <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
      No image provided
    </div>
  )}
            <CardTitle className="text-lg font-semibold truncate">{item.title}</CardTitle>
            <div className="text-primary font-bold flex items-center gap-1 mt-1">
              <DollarSign className="w-4 h-4" />
              {item.price?.toFixed(2) || '0.00'}
            </div>
            <div className="flex flex-wrap gap-2 text-xs mt-2 text-muted-foreground capitalize">
              <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                <Tag className="h-3 w-3" /> {item.category || 'Uncategorized'}
              </span>
              <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                {item.condition || 'Unknown'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow px-4">
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {item.description || 'No description provided'}
            </p>
          </CardContent>
          <CardFooter className="px-4 pb-4">
            <Button asChild className="w-full" variant="outline">
              <Link href={`/items/${item.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
