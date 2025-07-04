// src/components/ui/tooltip.jsx
"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils" // Optional: if you use `cn()` for conditional classes

export const TooltipProvider = TooltipPrimitive.Provider
export const TooltipRoot = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger
export const TooltipContent = TooltipPrimitive.Content

export function Tooltip({ children, content, side = "top" }) {
  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipPrimitive.Portal>
          <TooltipContent
            side={side}
            className={cn(
              "z-50 rounded-md bg-black px-2 py-1 text-xs text-white shadow-md",
              "data-[state=delayed-open]:animate-fade-in"
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-black" />
          </TooltipContent>
        </TooltipPrimitive.Portal>
      </TooltipRoot>
    </TooltipProvider>
  )
}
