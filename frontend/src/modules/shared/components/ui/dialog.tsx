'use client';

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

// Dialog with Portal for proper stacking
interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 animate-in fade-in duration-200"
                style={{ zIndex: 99999 }}
                onClick={() => onOpenChange?.(false)}
            />
            {/* Content wrapper */}
            {children}
        </div>,
        document.body
    );
};

const DialogTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            style={{ zIndex: 100000 }}
            className={cn(
                "relative w-full max-w-lg bg-white p-6 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200",
                "dark:border dark:border-slate-800 dark:bg-slate-900",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
)
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100", className)} {...props} />
    )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm text-slate-500 dark:text-slate-400", className)} {...props} />
    )
)
DialogDescription.displayName = "DialogDescription"

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}
