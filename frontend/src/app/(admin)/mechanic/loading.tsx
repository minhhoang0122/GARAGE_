'use client';

import { DashboardLayout } from '@/modules/common/components/layout';

export default function MechanicLoading() {
    return (
        <DashboardLayout title="Thợ máy" subtitle="Đang tải...">
            <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 mb-2" />
                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-12" />
                        </div>
                    ))}
                </div>

                {/* Job Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="h-32 bg-slate-200 dark:bg-slate-800" />
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                </div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40" />
                                <div className="flex gap-2 pt-2">
                                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded flex-1" />
                                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
