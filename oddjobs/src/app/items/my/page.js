// src/app/items/my/page.js
"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil, Trash2 } from 'lucide-react'

export default function MyItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
        setItems(data)
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

  if (loading) {
    return (
      <div className="container py-8 animate-fade-in">
        <Skeleton className="h-10 w-[200px] mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-full"><CardHeader><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Items</h1>
        <Button asChild>
          <Link href="/items/post">Add New Item</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">You haven’t posted any items yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <Card key={item.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="truncate">{item.title}</CardTitle>
                <p className="text-primary font-medium">${item.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {item.condition} • {item.category}
                </p>
              </CardHeader>
              <CardFooter className="mt-auto flex justify-between gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/items/edit/${item.id}`}><Pencil className="w-4 h-4 mr-1" /> Edit</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
