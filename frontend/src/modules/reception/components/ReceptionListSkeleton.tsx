import { Skeleton } from '@/modules/shared/components/ui/skeleton';

export function ReceptionListSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Skeleton className="h-10 w-full max-w-md rounded-lg" />
                <Skeleton className="h-10 w-40 rounded-lg" />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <th key={i} className="px-6 py-4">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4">
                                    <Skeleton className="w-12 h-12 rounded-lg" />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Skeleton className="h-5 w-24" />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Skeleton className="h-8 w-8 rounded" />
                                        <Skeleton className="h-8 w-20 rounded" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
