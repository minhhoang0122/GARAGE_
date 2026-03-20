import { DashboardLayout } from '@/modules/common/components/layout';
import { getAssignedJobs, getAvailableMechanics } from '@/modules/service/mechanic';
import { UserPlus, Wrench } from 'lucide-react';
import { EmptyState } from '@/modules/shared/components/ui/empty-state';
import AssignPanel from './AssignPanel';

export const dynamic = 'force-dynamic';

export default async function AssignWorkPage() {
    const [jobs, mechanics] = await Promise.all([
        getAssignedJobs(),
        getAvailableMechanics(),
    ]);

    // Filter unassigned jobs (those without a mechanic)
    const unassignedJobs = jobs.filter(j => !j.claimedById);
    const assignedJobs = jobs.filter(j => j.claimedById);

    return (
        <DashboardLayout title="Chia việc" subtitle="Phân công thợ sửa chữa cho từng đơn hàng">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="relative z-10 max-w-7xl mx-auto pb-10 space-y-8">
                {/* Mechanic Overview */}
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-blue-500" />
                        Đội ngũ Kỹ thuật viên ({mechanics.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mechanics.map(m => (
                            <div key={m.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{m.hoTen}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.soViecDangLam > 2
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                        : m.soViecDangLam > 0
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                        : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                    }`}>
                                        {m.soViecDangLam} việc
                                    </span>
                                </div>
                                <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{m.chuyenMonLabel}</span>
                                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">{m.capBacLabel}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Unassigned Jobs */}
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-amber-500" />
                        Chờ phân công ({unassignedJobs.length})
                    </h2>
                    {unassignedJobs.length === 0 ? (
                        <EmptyState
                            title="Tất cả đã được phân công"
                            description="Không còn đơn hàng nào chờ chia việc."
                            icon={Wrench}
                            className="max-w-md mx-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
                        />
                    ) : (
                        <div className="space-y-4">
                            {unassignedJobs.map(job => (
                                <AssignPanel key={job.id} job={job} mechanics={mechanics} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Already Assigned */}
                {assignedJobs.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            Đã phân công ({assignedJobs.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {assignedJobs.map(job => (
                                <div key={job.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm opacity-70">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-mono font-bold text-sm text-blue-600">{job.plate}</span>
                                        <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                            Đã giao: {job.claimedByName}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">{job.vehicleBrand} {job.vehicleModel} · {job.totalItems} hạng mục</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
