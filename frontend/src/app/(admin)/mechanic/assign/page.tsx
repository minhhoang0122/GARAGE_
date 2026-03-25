import { DashboardLayout } from '@/modules/common/components/layout';
import { getAssignedJobs, getAvailableMechanics } from '@/modules/service/mechanic';
import { Wrench, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { EmptyState } from '@/modules/shared/components/ui/empty-state';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import ClaimJobButton from '../jobs/[id]/ClaimJobButton';

export const dynamic = 'force-dynamic';

export default async function AssignOverviewPage() {
    const [jobs, mechanics, session] = await Promise.all([
        getAssignedJobs(),
        getAvailableMechanics(),
        auth(),
    ]);

    const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
    const activeJobs = jobs;

    // Tách: đơn chưa nhận vs đơn đã nhận
    const unclaimedJobs = activeJobs.filter(j => !j.claimedById);
    const claimedJobs = activeJobs.filter(j => j.claimedById);

    return (
        <DashboardLayout title="Điều phối" subtitle="Nhận việc, phân công kỹ thuật viên">
            <div className="relative z-10 max-w-6xl mx-auto pb-10 space-y-8">

                {/* Đơn chờ nhận */}
                {unclaimedJobs.length > 0 && (
                    <div>
                        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Đơn chờ nhận ({unclaimedJobs.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {unclaimedJobs.map(job => (
                                <div key={job.id} className="bg-white dark:bg-slate-800 rounded-xl border-2 border-amber-200 dark:border-amber-800 p-5 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                                    <div className="mb-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-mono font-bold text-xl text-slate-800 dark:text-white tracking-wider">
                                                {job.plate}
                                            </h3>
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                Chờ nhận
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            {job.vehicleBrand} {job.vehicleModel}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                            {job.totalItems} hạng mục
                                        </p>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                                        <ClaimJobButton orderId={job.id} claimedByName={null} isClaimedByMe={false} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Đơn đã nhận → sẵn sàng phân công */}
                <div>
                    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-blue-500" />
                        {unclaimedJobs.length > 0 ? 'Đã nhận — Sẵn sàng phân công' : 'Danh sách điều phối'} ({claimedJobs.length})
                    </h2>
                    {claimedJobs.length === 0 ? (
                        <EmptyState
                            title="Chưa có đơn nào được nhận"
                            description={unclaimedJobs.length > 0 ? "Nhận đơn ở trên để bắt đầu phân công." : "Chưa có xe nào cần điều phối."}
                            icon={Wrench}
                            className="max-w-md mx-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {claimedJobs.map(job => {
                                const isMyJob = job.claimedById === currentUserId;
                                return (
                                    <div key={job.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${
                                            job.status === 'DANG_SUA' ? 'bg-blue-500' : 'bg-emerald-500'
                                        }`}></div>
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-mono font-bold text-xl text-slate-800 dark:text-white tracking-wider">
                                                    {job.plate}
                                                </h3>
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                                    job.status === 'DANG_SUA'
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                }`}>
                                                    {job.status === 'DANG_SUA' ? 'Đang sửa' : 'Đã nhận'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {job.vehicleBrand} {job.vehicleModel}
                                            </p>

                                            {/* Quản đốc phụ trách */}
                                            {job.claimedByName && (
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                    {isMyJob ? 'Bạn phụ trách' : job.claimedByName}
                                                </p>
                                            )}

                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-3">
                                                {job.totalItems} hạng mục
                                                {job.completedItems > 0 && <span className="ml-2 text-emerald-600">({job.completedItems} xong)</span>}
                                            </p>
                                        </div>

                                        {/* Điều hướng phù hợp với trạng thái */}
                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            {job.status === 'DANG_SUA' && (
                                                <Link
                                                    href={`/mechanic/jobs/${job.id}`}
                                                    className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 text-xs font-bold uppercase tracking-tight transition-colors"
                                                >
                                                    Xem chi tiết
                                                </Link>
                                            )}
                                            <Link
                                                href={`/mechanic/assign/${job.id}`}
                                                className={`inline-flex items-center gap-2 ${
                                                    job.status === 'DANG_SUA'
                                                    ? 'text-blue-600 hover:text-blue-700 text-sm font-bold'
                                                    : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                                                }`}
                                            >
                                                {job.status === 'DANG_SUA' ? 'Điều chỉnh nhân sự' : 'Vào phân công'} <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
