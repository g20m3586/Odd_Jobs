"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Tag, DollarSign } from 'lucide-react'

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const getImageUrl = (filename) => {
    if (!filename) return null
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/public/${filename}`
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        
        const processedItems = data?.map(item => ({
          ...item,
          image_url: item.image_url ? getImageUrl(item.image_url) : null
        })) || []
        
        setItems(processedItems)
      } catch (error) {
        console.error('Fetch error:', error)
        toast.error('Failed to load items', { 
          description: error.message 
        })
      } finally {
        setLoading(false)
      }
    }

    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          toast.error('Please sign in to view marketplace', {
            action: {
              label: 'Sign In',
              onClick: () => router.push('/auth/login')
            },
          })
          router.push('/auth/login')
          return
        }
        setAuthChecked(true)
        fetchData()
      } catch (err) {
        console.error('Auth check error:', err)
        toast.error('Authentication error')
      }
    }

    if (!authChecked) checkAuth()
    else fetchData()
  }, [authChecked, router])

  useEffect(() => {
    if (searchParams.get('posted') === '1') {
      toast.success('Item posted successfully!')
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="container py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-9 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
      </div>
    )
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Browse shared or sellable items</p>
        </div>
        <Button asChild>
          <Link href="/items/post">Sell an Item</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center border rounded-lg">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No items available</h3>
          <p className="text-muted-foreground mb-4">Be the first to list an item!</p>
          <Button asChild variant="outline">
            <Link href="/items/post">List an Item</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-lg hover:scale-[1.01] transition-all h-full flex flex-col">
              <CardHeader className="p-4">
                {item.image_url ? (
                  <img
                    src={`{item.image_url}`}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-md mb-3"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = '/placeholder-item.jpg'
                    }}
                  />
                ) : (
                  <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                    No image
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
                    {item.condition || 'Unknown condition'}
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
      )}
    </div>
  )
}