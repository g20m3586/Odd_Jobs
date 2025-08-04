"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Pencil, Trash2, Tag, DollarSign, Plus, PackageOpen, Image as ImageIcon, ChevronDown, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function MyItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const router = useRouter()

  const getImageUrl = (path) => {
    if (!path) return null
    
    // Handle different path formats
    const cleanPath = path.startsWith('public/') ? path : `public/${path}`
    
    try {
      const { data } = supabase
        .storage
        .from('item-images')
        .getPublicUrl(cleanPath)
      
      return data?.publicUrl || null
    } catch (error) {
      console.error('Error generating image URL:', error)
      return null
    }
  }

  const fetchMyItems = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        toast.error('Please sign in to view your items')
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const itemsWithVerifiedImages = await Promise.all(
        data.map(async (item) => {
          const imageUrl = item.image_url ? getImageUrl(item.image_url) : null
          let imageExists = false
          
          if (imageUrl) {
            try {
              const { error } = await supabase
                .storage
                .from('item-images')
                .getPublicUrl(item.image_url)
              imageExists = !error
            } catch (e) {
              console.warn('Image check failed:', e)
            }
          }

          return {
            ...item,
            image_url: imageExists ? imageUrl : null
          }
        })
      )

      setItems(itemsWithVerifiedImages)
    } catch (error) {
      toast.error('Failed to load items', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyItems()
  }, [router])

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this item?')
    if (!confirmed) return

    setDeletingId(id)
    try {
      const itemToDelete = items.find(item => item.id === id)
      
      if (itemToDelete?.image_url) {
        const imagePath = itemToDelete.image_url.includes('item-images')
          ? itemToDelete.image_url.split('item-images/')[1]
          : itemToDelete.image_url

        await supabase
          .storage
          .from('item-images')
          .remove([imagePath])
      }

      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)

      if (error) throw error

      setItems(prev => prev.filter(item => item.id !== id))
      toast.success('Item deleted successfully')
    } catch (error) {
      toast.error('Deletion failed', {
        description: error.message
      })
    } finally {
      setDeletingId(null)
    }
  }

  const ItemSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <Skeleton className="w-full aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Listings</h1>
            <p className="text-muted-foreground mt-1">Manage your marketplace items</p>
          </div>
          <Button asChild className="shadow-sm hover:shadow-md transition-shadow">
            <Link href="/items/post" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Item
            </Link>
          </Button>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ItemSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
            <PackageOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No items listed yet</h3>
            <p className="text-muted-foreground mb-6">Get started by creating your first listing</p>
            <Button asChild variant="outline" className="border-2">
              <Link href="/items/post" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Post New Item
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
              <div 
                key={item.id}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col"
              >
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden">
                  {item.image_url ? (
                    <Image
                    src={item.image_url}
                    alt={item.title}
                    width={300}  // Required
                    height={300} // Required
                    className="w-full h-full object-cover"
                    unoptimized={true} // Bypass Next.js optimization
                    priority={false}
                  />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-xs">
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200 capitalize">
                      {item.condition || 'New'}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-grow flex flex-col">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center text-primary font-bold">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {item.price?.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0
                      })}
                    </div>
                  </div>

                  {/* Category Tag */}
                  {item.category && (
                    <div className="mt-auto mb-3">
                      <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs">
                        <Tag className="w-3 h-3" />
                        {item.category}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-4">
                    <details className="group/details">
                      <summary className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer list-none">
                        <span>Description</span>
                        <ChevronDown className="w-4 h-4 transition-transform group-open/details:rotate-180" />
                      </summary>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {item.description || 'No description provided'}
                      </p>
                    </details>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4 flex gap-3">
                  <Button 
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Link href={`/items/edit/${item.id}`} className="flex items-center gap-1">
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="flex-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {deletingId === item.id ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Deleting
                      </span>
                    ) : 'Delete'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}