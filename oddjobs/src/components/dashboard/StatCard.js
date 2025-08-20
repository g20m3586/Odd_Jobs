"use client"
import { icons } from 'lucide-react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

export default function StatCard({ 
  title, 
  value, 
  subtitle,
  icon, 
  trend = "neutral",
  trendValue = null,
  variant = 'default',
  className = '',
  size = 'default' // Add size prop for responsive control
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

  // Size-based styling
  const sizeStyles = {
    sm: {
      container: 'p-4 sm:p-5',
      iconContainer: 'p-1.5 sm:p-2',
      icon: 'h-3 w-3 sm:h-4 sm:w-4',
      title: 'text-xs sm:text-sm',
      value: 'text-xl sm:text-2xl font-semibold',
      subtitle: 'text-xs',
      trend: 'text-xs'
    },
    default: {
      container: 'p-5 sm:p-6',
      iconContainer: 'p-2 sm:p-2',
      icon: 'h-4 w-4',
      title: 'text-sm font-medium',
      value: 'text-2xl sm:text-3xl font-semibold',
      subtitle: 'text-sm',
      trend: 'text-sm'
    }
  }

  const styles = sizeStyles[size] || sizeStyles.default

  return (
    <div className={`
      rounded-xl border
      ${variantStyles[variant]}
      ${styles.container}
      ${className}
      transition-all hover:shadow-sm
      min-h-[120px] sm:min-h-[140px]
    `}>
      <div className="flex flex-row items-center justify-between gap-2">
        <h3 className={`${styles.title} text-gray-500 dark:text-gray-400 truncate`}>
          {title}
        </h3>
        {Icon && (
          <div className={`
            rounded-lg ${styles.iconContainer} flex-shrink-0
            ${variant === 'destructive' ? 'bg-red-100 dark:bg-red-900/30' : 
              variant === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
              variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' : 
              'bg-gray-100 dark:bg-gray-700'}
          `}>
            <Icon className={`
              ${styles.icon}
              ${variant === 'destructive' ? 'text-red-600 dark:text-red-400' : 
                variant === 'success' ? 'text-green-600 dark:text-green-400' :
                variant === 'warning' ? 'text-amber-600 dark:text-amber-400' : 
                'text-gray-600 dark:text-gray-300'}
            `} />
          </div>
        )}
      </div>
      
      <div className="mt-3 sm:mt-4">
        <div className="flex items-end gap-2 flex-wrap">
          <p className={`${styles.value} truncate`}>
            {value}
          </p>
          {subtitle && (
            <p className={`${styles.subtitle} text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 truncate`}>
              {subtitle}
            </p>
          )}
        </div>

        {trend !== "neutral" && trendValue !== null && (
          <div className={`flex items-center mt-1 sm:mt-2 ${styles.trend} ${trendStyles[trend]}`}>
            <TrendIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  )
}