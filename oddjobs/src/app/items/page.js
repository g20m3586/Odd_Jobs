"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setItems(data)
      } catch (error) {
        console.error('Error fetching items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  if (loading) return <div className="container py-8">Loading items...</div>

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <Button asChild>
          <Link href="/items/post">Sell an Item</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <p className="text-primary font-medium">${item.price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground capitalize">{item.condition} • {item.category}</p>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/items/${item.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}