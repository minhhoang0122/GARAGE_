import { DashboardLayout } from '@/modules/common/components/layout';
import { getAssignedJobs } from '@/modules/service/mechanic';
import { Wrench } from 'lucide-react';
import { EmptyState } from '@/modules/shared/components/ui/empty-state';
import JobCard from './JobCard';

export const dynamic = 'force-dynamic';

export default async function JobsListPage() {
    const jobs = await getAssignedJobs();

    return (
        <DashboardLayout title="Danh sách việc" subtitle="Các xe được phân công sửa chữa">
            {/* Background Pattern for depth */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="relative z-10 max-w-7xl mx-auto pb-10">
                {jobs.length === 0 ? (
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
                        {jobs.map(job => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout >
    );
}
