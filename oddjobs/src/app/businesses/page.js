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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [showConstructionModal, setShowConstructionModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Immediately show construction modal when component mounts
    setShowConstructionModal(true)
    
    // Disable all data fetching
    setLoading(false)
    setAuthChecked(true)
  }, [])

  if (loading) {
    return (
      <div className="container py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-9 w-[250px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow h-full flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2 mb-4" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mb-1" />
              </CardContent>
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
    <div className="container py-8 animate-fade-in opacity-50 pointer-events-none">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Business Directory</h1>
        <Button asChild disabled>
          <Link href="/businesses/register" className="flex items-center gap-2">
            Register Your Business
          </Link>
        </Button>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No businesses registered</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to register your business!
          </p>
          <Button asChild variant="outline" disabled>
            <Link href="/businesses/register">Register Now</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Card 
              key={business.id} 
              className="hover:shadow-lg transition-all duration-300 h-full flex flex-col hover:scale-[1.02]"
            >
              <CardHeader>
                <CardTitle className="truncate">{business.name}</CardTitle>
                <p className="text-muted-foreground capitalize">{business.category}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="line-clamp-2 text-muted-foreground mb-4">{business.description}</p>
              </CardContent>
              <CardContent>
                <Button asChild variant="outline" className="w-full" disabled>
                  <Link href={`/businesses/${business.id}`} className="flex items-center justify-center gap-2">
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showConstructionModal} onOpenChange={setShowConstructionModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Under Construction</DialogTitle>
            <DialogDescription>
              This feature is currently under construction and unavailable. Please check back later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowConstructionModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}