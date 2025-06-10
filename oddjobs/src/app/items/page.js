"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, AlertCircle } from 'lucide-react'

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setItems(data || [])
      } catch (error) {
        console.error('Error fetching items:', error)
        toast.error('Failed to load items', {
          description: error.message
        })
      } finally {
        setLoading(false)
      }
    }

    const checkAuth = async () => {
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
    }

    if (!authChecked) checkAuth()
    else fetchData()
  }, [authChecked, router])

  if (loading) {
    return (
      <div className="container py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-9 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow h-full flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
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
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <Button asChild>
          <Link href="/items/post" className="flex items-center gap-2">
            Sell an Item
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No items available</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to list an item!
          </p>
          <Button asChild variant="outline">
            <Link href="/items/post">List an Item</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card 
              key={item.id} 
              className="hover:shadow-lg transition-all duration-300 h-full flex flex-col hover:scale-[1.02]"
            >
              <CardHeader>
                <CardTitle className="truncate">{item.title}</CardTitle>
                <p className="text-primary font-medium">${item.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {item.condition} • {item.category}
                </p>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/items/${item.id}`} className="flex items-center justify-center gap-2">
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}