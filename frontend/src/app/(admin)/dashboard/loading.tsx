
import { DashboardLayout } from '@/modules/common/components/layout';
import { Card } from '@/modules/shared/components/ui/card';
import { Skeleton } from '@/modules/shared/components/ui/skeleton';

export default function Loading() {
    return (
        <DashboardLayout title="Tổng quan" subtitle="Báo cáo hoạt động kinh doanh">
            <div className="space-y-6">
                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-700" />
                                    <Skeleton className="h-8 w-32 bg-slate-200 dark:bg-slate-700" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Inventory Health Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-700" />
                                    <Skeleton className="h-8 w-32 bg-slate-200 dark:bg-slate-700" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Charts Section Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <Card className="lg:col-span-2 p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-slate-700" />
                        </div>
                        <Skeleton className="h-[300px] w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
                    </Card>

                    {/* Mechanic Leaderboard */}
                    <Card className="lg:col-span-1 p-6 space-y-6">
                        <Skeleton className="h-6 w-40 bg-slate-200 dark:bg-slate-700" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-700" />
                                            <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-slate-700" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-slate-700" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
