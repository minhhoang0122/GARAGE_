
import { Skeleton } from "@/modules/shared/components/ui/skeleton"

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between py-4">
                <Skeleton className="h-10 w-[250px] bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-[100px] bg-slate-200 dark:bg-slate-700" />
                    <Skeleton className="h-10 w-[100px] bg-slate-200 dark:bg-slate-700" />
                </div>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-800">
                <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 flex items-center gap-4">
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full bg-slate-300 dark:bg-slate-600/50" />
                    ))}
                </div>
                <div>
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            {Array.from({ length: columns }).map((_, j) => (
                                <Skeleton key={j} className="h-4 w-full bg-slate-200 dark:bg-slate-700" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Skeleton className="h-10 w-[100px] bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-10 w-[100px] bg-slate-200 dark:bg-slate-700" />
            </div>
        </div>
    )
}
