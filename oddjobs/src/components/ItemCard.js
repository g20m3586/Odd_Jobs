import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DollarSign, Tag, PackageOpen } from 'lucide-react';
import { getItemImageUrl } from '@/lib/itemUtils';

export default function ItemCard({ item, isOwner = false, onDelete }) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden">
        {item.image_url ? (
          <Image
            src={getItemImageUrl(item.image_url)}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <PackageOpen className="w-8 h-8 text-gray-400" />
          </div>
        )}
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
              minimumFractionDigits: 2
            })}
          </div>
        </div>

        {item.category && (
          <div className="mt-auto mb-3">
            <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs">
              <Tag className="w-3 h-3" />
              {item.category}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex gap-3">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/items/${item.id}`} className="flex items-center gap-1">
            View Details
          </Link>
        </Button>
        
        {isOwner && (
          <>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/items/edit/${item.id}`} className="flex items-center gap-1">
                Edit
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDelete(item.id)}
              className="flex-1"
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}