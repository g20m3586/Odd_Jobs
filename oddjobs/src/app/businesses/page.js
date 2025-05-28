"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setBusinesses(data)
      } catch (error) {
        console.error('Error fetching businesses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  if (loading) return <div className="container py-8">Loading businesses...</div>

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Business Directory</h1>
        <Button asChild>
          <Link href="/businesses/register">Register Your Business</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <Card key={business.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{business.name}</CardTitle>
              <p className="text-muted-foreground capitalize">{business.category}</p>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-muted-foreground mb-4">{business.description}</p>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/businesses/${business.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}