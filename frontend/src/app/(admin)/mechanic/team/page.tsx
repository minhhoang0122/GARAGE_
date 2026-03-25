import { DashboardLayout } from '@/modules/common/components/layout';
import { getAvailableMechanics } from '@/modules/service/mechanic';
import { Users, Wrench, Award, Briefcase } from 'lucide-react';

export default async function TeamPage() {
    const mechanics = await getAvailableMechanics();

    const totalMechanics = mechanics.length;
    const busyCount = mechanics.filter((m: any) => m.soViecDangLam > 0).length;
    const freeCount = totalMechanics - busyCount;

    return (
        <DashboardLayout title="Đội thợ" subtitle="Quản lý và theo dõi đội ngũ Kỹ thuật viên">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalMechanics}</p>
                                <p className="text-xs text-slate-500">Tổng KTV</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                <Wrench className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-600">{busyCount}</p>
                                <p className="text-xs text-slate-500">Đang có việc</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-600">{freeCount}</p>
                                <p className="text-xs text-slate-500">Sẵn sàng</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mechanic List */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="font-semibold text-slate-800 dark:text-white">Danh sách Kỹ thuật viên</h2>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {mechanics.map((m: any) => (
                            <div key={m.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                        m.soViecDangLam > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}>
                                        {m.hoTen?.charAt(m.hoTen.lastIndexOf(' ') + 1) || '?'}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-white">{m.hoTen}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {m.chuyenMonLabel && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                    {m.chuyenMonLabel}
                                                </span>
                                            )}
                                            {m.capBacLabel && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                    {m.capBacLabel}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Workload */}
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                        m.soViecDangLam === 0
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                            : m.soViecDangLam >= 3
                                                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                    }`}>
                                        {m.soViecDangLam === 0 ? 'Rảnh' : `${m.soViecDangLam} đơn`}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {mechanics.length === 0 && (
                            <div className="px-6 py-12 text-center text-slate-400">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>Chưa có kỹ thuật viên nào trong hệ thống</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
