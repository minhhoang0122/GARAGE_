import * as React from "react"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative overflow-auto custom-scrollbar", className)}
    {...props}
  >
    {children}
    <style jsx>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #334155;
      }
    `}</style>
  </div>
))
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
