import { Suspense } from 'react'
import ItemsList from './ItemsList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ItemsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Discover or list items near you</p>
        </div>
        <Button asChild>
          <Link href="/items/post">+ List an Item</Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading items...</div>}>
        <ItemsList />
      </Suspense>
    </div>
  )
}
