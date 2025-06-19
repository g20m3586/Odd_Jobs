"use client"
import { icons } from 'lucide-react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

export default function StatCard({ 
  title, 
  value, 
  subtitle,
  icon, 
  trend = "neutral",
  variant = 'default',
  className = '' 
}) {
  const Icon = icon ? icons[icon] : null
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus
  
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700',
    destructive: 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400',
    success: 'bg-green-50 border-green-100 text-green-600 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400',
    warning: 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400'
  }

  const trendStyles = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-500 dark:text-gray-400'
  }

  return (
    <div className={`
      rounded-xl p-6 border
      ${variantStyles[variant]}
      ${className}
      transition-all hover:shadow-sm
    `}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        {Icon && (
          <div className={`p-2 rounded-lg ${variant === 'destructive' ? 'bg-red-100 dark:bg-red-900/30' : 
            variant === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
            variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' : 
            'bg-gray-100 dark:bg-gray-700'}`}>
            <Icon className={`h-4 w-4 ${variant === 'destructive' ? 'text-red-600 dark:text-red-400' : 
              variant === 'success' ? 'text-green-600 dark:text-green-400' :
              variant === 'warning' ? 'text-amber-600 dark:text-amber-400' : 
              'text-gray-600 dark:text-gray-300'}`} />
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex items-end gap-2">
          <p className="text-3xl font-semibold">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {subtitle}
            </p>
          )}
        </div>

        {trend !== "neutral" && (
          <div className={`flex items-center mt-2 text-sm ${trendStyles[trend]}`}>
            <TrendIcon className="h-4 w-4 mr-1" />
            <span>{trend === "up" ? "12.5%" : "2.3%"}</span>
          </div>
        )}
      </div>
    </div>
  )
}