'use client';

import { DashboardLayout } from '@/modules/common/components/layout';

export default function SaleLoading() {
    return (
        <DashboardLayout title="Bán hàng">
            <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tables Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                            </div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {[...Array(4)].map((_, j) => (
                                    <div key={j} className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                                        </div>
                                        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
