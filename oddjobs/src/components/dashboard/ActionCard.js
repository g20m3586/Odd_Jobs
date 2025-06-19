"use client"
import { Button } from "@/components/ui/button"
import { icons } from 'lucide-react'

export default function ActionCard({ 
  title, 
  description, 
  href, 
  icon,
  actionText = "Get Started",
  variant = 'default' 
}) {
  const Icon = icon ? icons[icon] : null
  
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700',
    destructive: 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30',
    success: 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-900/30',
    warning: 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30'
  }

  const buttonVariant = variant === 'destructive' ? 'destructive' : 
                       variant === 'success' ? 'success' : 
                       variant === 'warning' ? 'warning' : 'default'

  return (
    <div className={`rounded-xl border p-6 ${variantStyles[variant]} transition-all hover:shadow-sm`}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`p-3 rounded-lg ${variant === 'destructive' ? 'bg-red-100 dark:bg-red-900/30' : 
            variant === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
            variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' : 
            'bg-blue-100 dark:bg-blue-900/30'}`}>
            <Icon className={`h-5 w-5 ${variant === 'destructive' ? 'text-red-600 dark:text-red-400' : 
              variant === 'success' ? 'text-green-600 dark:text-green-400' :
              variant === 'warning' ? 'text-amber-600 dark:text-amber-400' : 
              'text-blue-600 dark:text-blue-400'}`} />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
          <Button asChild variant={buttonVariant} size="sm">
            <a href={href} className="flex items-center gap-2">
              {actionText}
              {Icon && <Icon className="h-4 w-4" />}
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}