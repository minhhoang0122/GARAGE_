'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Wrench, Clock, CheckCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

type Job = {
    id: number;
    plate: string;
    vehicleBrand: string;
    vehicleModel: string;
    customerName: string;
    totalItems: number;
    completedItems: number;
    claimedByName: string | null;
};

type Stats = {
    inProgressJobs: number;
    completedToday: number;
};

export default function MechanicDashboard() {
    const { data: session } = useSession();
    // @ts-ignore
    const userRole = session?.user?.role;

    const [repairJobs, setRepairJobs] = useState<Job[]>([]);
    const [inspectJobs, setInspectJobs] = useState<any[]>([]);
    const [stats, setStats] = useState<Stats>({ inProgressJobs: 0, completedToday: 0 });

    const isDiagnose = userRole === 'THO_CHAN_DOAN';
    const isRepair = userRole === 'THO_SUA_CHUA';
    const isAdmin = userRole === 'ADMIN';

    useEffect(() => {
        // @ts-ignore
        const token = session?.user?.accessToken;
        if (token) {
            if (isDiagnose || isAdmin) {
                // Always fetch fresh data for inspection queue
                api.get('/mechanic/inspect', token).then(setInspectJobs).catch(console.error);
            }
            if (isRepair || isAdmin) {
                api.getCached('/mechanic/jobs', token).then(setRepairJobs).catch(console.error);
                api.getCached('/mechanic/stats', token).then(setStats).catch(console.error);
            }
        }
    }, [session?.user, isDiagnose, isRepair, isAdmin]);

    return (
        <DashboardLayout
            title={isDiagnose ? "Thợ Chẩn Đoán" : "Thợ Sửa Chữa"}
            subtitle={isDiagnose ? "Tiếp nhận và lập đề xuất sửa chữa" : "Quản lý công việc được phân công"}
        >
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Section cho Thợ Chẩn Đoán */}
                {(isDiagnose || isAdmin) && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 transition-colors">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-50 dark:bg-amber-900/20">
                            <h2 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                                <Search className="w-5 h-5" /> Xe chờ chẩn đoán ({inspectJobs.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {inspectJobs.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">Không có xe nào đang chờ</div>
                            ) : (
                                inspectJobs.map(job => (
                                    <Link
                                        key={job.id}
                                        href={`/mechanic/inspect/${job.id}`} // Link to Inspect Page
                                        className="px-6 py-4 flex items-center gap-4 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                                            ?
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{job.plate}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                {job.vehicleBrand} {job.vehicleModel} - {job.customerName}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">Yêu cầu: {job.request}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400">
                                                Chờ khám
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Section cho Thợ Sửa Chữa (Stats + Jobs) */}
                {(isRepair || isAdmin) && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Đang thực hiện</p>
                                        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{stats.inProgressJobs}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        <Wrench className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Hoàn thành hôm nay</p>
                                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.completedToday}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                            </div>

                            <Link href="/mechanic/jobs" className="block">
                                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-sm text-white hover:from-slate-700 hover:to-slate-800 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-100">Xem danh sách việc</p>
                                            <p className="text-xl font-bold mt-1">Đi đến công việc →</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Danh sách việc đang sửa */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h2 className="font-semibold text-slate-800 dark:text-slate-100">Xe đang sửa chữa</h2>
                                <Link href="/mechanic/jobs" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Xem tất cả
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {repairJobs.slice(0, 5).map(job => {
                                    const progress = job.totalItems > 0
                                        ? Math.round((job.completedItems / job.totalItems) * 100)
                                        : 0;

                                    return (
                                        <Link
                                            key={job.id}
                                            href={`/mechanic/jobs/${job.id}`}
                                            className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                                <Wrench className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">{job.plate}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                    {job.vehicleBrand} {job.vehicleModel} - {job.customerName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {job.claimedByName ? (
                                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 block">
                                                        🔧 {job.claimedByName}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-amber-600 dark:text-amber-400 mb-1 block">
                                                        ⏳ Chưa nhận
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{progress}%</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {job.completedItems}/{job.totalItems} hạng mục
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                                {repairJobs.length === 0 && (
                                    <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <Wrench className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                                        <p>Không có xe nào đang chờ sửa</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
