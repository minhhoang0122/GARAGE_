'use client';

import { DashboardLayout } from '@/modules/common/components/layout';
import { mechanicService } from '@/modules/mechanic/services/mechanic';
import { Wrench, Loader2 } from 'lucide-react';
import { EmptyState } from '@/modules/shared/components/ui/empty-state';
import JobCard from './JobCard';
import { RealtimeRefresh } from '@/modules/common/components/layout/RealtimeRefresh';
import { useQuery } from '@tanstack/react-query';
import { useRealtimeUpdate } from '@/hooks/useRealtimeUpdate';


export default function JobsListPage() {
    const { data: jobs = [], isLoading } = useQuery({
        queryKey: ['mechanic-repair-jobs'],
        queryFn: () => mechanicService.getRepairJobs(),
    });

    useRealtimeUpdate(['mechanic-repair-jobs']);
    useRealtimeUpdate(['mechanic', 'stats']);


    return (
        <DashboardLayout title="Danh sách việc" subtitle="Các xe được phân công sửa chữa">
            {/* Tự động làm mới khi có việc mới được phân công */}
            <RealtimeRefresh events={['notification', 'order_updated']} />
            
            {/* Background Pattern for depth */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="relative z-10 max-w-7xl mx-auto pb-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                        <p className="text-slate-500 font-medium">Đang tải danh sách công việc...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <EmptyState
                            title="Tạm thời rảnh rỗi"
                            description="Hiện chưa có xe nào được điều phối cho bạn. Hãy nghỉ ngơi hoặc kiểm tra lại sau."
                            icon={Wrench}
                            className="max-w-md mx-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job: any) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout >
    );
}
