import * as React from "react"
import { cn } from "@/lib/utils"

// Simplified Button without cva or radix-slot
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            default: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-md transition-all active:scale-[0.98]",
            destructive: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-900/50 dark:hover:bg-red-900 dark:text-red-200 shadow-sm",
            outline: "border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 dark:border-slate-700 dark:bg-transparent dark:hover:bg-slate-800 dark:text-slate-200",
            secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
            ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-100",
            link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-100 decoration-slate-300 hover:decoration-slate-900",
        }

        const sizes = {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-9 w-9",
        }

        const classes = cn(
            baseStyles,
            variants[variant] || variants.default,
            sizes[size] || sizes.default,
            className
        )

        return (
            <button
                className={classes}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

// Mock buttonVariants function if consumed
const buttonVariants = ({ variant, size, className }: any) => {
    // Minimal mock
    return "button-mock-variant"
}

export { Button, buttonVariants }
