"use client"

import { forwardRef } from "react"
import { tv } from "tailwind-variants"
import { cn } from "@/lib/utils" // Optional: your own `classnames` helper

const switchVariants = tv({
  base: "peer inline-block h-6 w-11 rounded-full bg-gray-300 transition duration-200 ease-in-out",
  variants: {
    checked: {
      true: "bg-primary",
      false: "bg-gray-300"
    },
  }
})

export const Switch = forwardRef(({ className, checked, ...props }, ref) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        ref={ref}
        checked={checked}
        {...props}
      />
      <div
        className={cn(
          switchVariants({ checked }),
          "after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all",
          "peer-checked:after:translate-x-full peer-checked:bg-primary"
        )}
      />
    </label>
  )
})

Switch.displayName = "Switch"
