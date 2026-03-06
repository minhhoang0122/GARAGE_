import { LucideIcon, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon: Icon = PackageOpen,
    actionLabel,
    onAction,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            "relative flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl overflow-hidden group",
            "border-2 border-dashed border-slate-200 dark:border-slate-800",
            "bg-slate-50/50 dark:bg-slate-900/50",
            className
        )}>
            {/* Background Pattern - Technical Grid */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Icon Circle with quirky industrial shadow */}
            <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all duration-300">
                    <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                    {description}
                </p>
            )}

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    variant="outline"
                    className="border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-sm"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
