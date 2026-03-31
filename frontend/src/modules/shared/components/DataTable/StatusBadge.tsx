import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusType = "success" | "warning" | "error" | "info" | "default" | "pending" | "processing"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: StatusType
  label: string
  dot?: boolean
}

const statusStyles: Record<StatusType, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  warning: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  error: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  info: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  pending: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  default: "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-800",
}

const dotStyles: Record<StatusType, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-rose-500",
  info: "bg-blue-500",
  pending: "bg-slate-400",
  processing: "bg-indigo-500",
  default: "bg-slate-400",
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, type = "default", label, dot = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
          statusStyles[type],
          className
        )}
        {...props}
      >
        {dot && (
          <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full animate-pulse", dotStyles[type])} />
        )}
        {label}
      </div>
    )
  }
)

StatusBadge.displayName = "StatusBadge"

export { StatusBadge }
