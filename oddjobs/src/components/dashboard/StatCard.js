"use client"
import { icons } from 'lucide-react'

export default function StatCard({ 
  title, 
  value, 
  icon, 
  variant = 'default',
  className = '' 
}) {
  const Icon = icon ? icons[icon] : null
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border dark:border-gray-700',
    destructive: 'bg-destructive/10 border-destructive text-destructive dark:bg-destructive/20',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800'
  }

  return (
    <div className={`
      rounded-lg p-4 shadow-sm border
      ${variantStyles[variant]}
      ${className}
    `}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">
          {title}
        </h3>
        {Icon && (
          <Icon className={`h-4 w-4 ${
            variant === 'destructive' ? 'text-destructive' : 
            variant === 'success' ? 'text-emerald-500' :
            variant === 'warning' ? 'text-amber-500' : 
            'text-muted-foreground'
          }`} />
        )}
      </div>
      <p className={`
        text-2xl font-semibold mt-1
        ${variant === 'destructive' ? 'text-destructive' : 
          variant === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
          variant === 'warning' ? 'text-amber-600 dark:text-amber-400' : 
          'text-gray-900 dark:text-white'}
      `}>
        {value}
      </p>
    </div>
  )
}