'use client';

import { DashboardLayout } from '@/modules/common/components/layout';

export default function WarehouseLoading() {
    return (
        <DashboardLayout title="Kho" subtitle="Đang tải...">
            <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-12" />
                                </div>
                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table Skeleton */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-40" />
                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="px-6 py-4 flex items-center gap-4">
                                <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800" />
                                <div className="flex-1 grid grid-cols-4 gap-4">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
