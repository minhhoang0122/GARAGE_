'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Wrench, Clock, CheckCircle, Search, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { usePermission } from '@/hooks/usePermission';

import { useQuery } from '@tanstack/react-query';

import { useInspectJobs, useRepairJobs, useMechanicStats } from '@/modules/mechanic/hooks/useMechanic';
import { useRealtimeUpdate } from '@/hooks/useRealtimeUpdate';
import { queryKeys } from '@/lib/query-keys';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';
import { Badge } from '@/modules/shared/components/ui/badge';

export default function MechanicDashboard() {
    const { hasPermission, isAdmin, roles } = usePermission();

    const isDiagnose = hasPermission('CREATE_PROPOSAL');
    const isRepair = hasPermission('CLAIM_REPAIR_JOB');

    // NEW HOOKS
    const { data: inspectJobs = [] } = useInspectJobs(isDiagnose || isAdmin);
    const { data: repairJobs = [] } = useRepairJobs(isRepair || isAdmin);
    const { data: stats = { inProgressJobs: 0, completedToday: 0 } } = useMechanicStats(isRepair || isAdmin);

    // Realtime Sync
    useRealtimeUpdate(queryKeys.mechanic.jobs());
    useRealtimeUpdate(queryKeys.mechanic.inspect());
    useRealtimeUpdate(queryKeys.mechanic.stats());

    // Real-time counter (Refresh every minute)
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000); // 1 minute
        return () => clearInterval(timer);
    }, []);

    return (
        <DashboardLayout
            title={isDiagnose ? ROLE_DISPLAY_NAMES.QUAN_LY_XUONG : ROLE_DISPLAY_NAMES.THO_SUA_CHUA}
            subtitle={isDiagnose ? "Điều phối và giám sát xưởng" : "Quản lý công việc được phân công"}
        >
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Section cho Thợ Chẩn Đoán */}
                {(isDiagnose || isAdmin) && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 transition-colors">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-50 dark:bg-amber-900/20">
                            <h2 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                                <Search className="w-5 h-5" /> Xe chờ chẩn đoán ({inspectJobs.length})
                            </h2>
                            <Link href="/mechanic/inspect" className="text-sm font-bold text-amber-700 dark:text-amber-500 hover:underline">
                                Xem danh sách kỹ thuật →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:gap-px bg-slate-100 dark:bg-slate-800">
                            {inspectJobs.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 col-span-full">Không có xe nào đang chờ</div>
                            ) : (
                                inspectJobs.map((job: any) => {
                                    const waitTime = Math.floor((now.getTime() - new Date(job.date || job.createdAt).getTime()) / (1000 * 60));
                                    return (
                                        <Link
                                            key={job.id}
                                            href={`/mechanic/inspect/${job.id}`}
                                            className="bg-white dark:bg-slate-900 p-4 flex flex-col gap-2 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">{job.plate}</span>
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[10px] uppercase font-black px-1.5 py-0 border-transparent shadow-sm ${
                                                        waitTime > 60 
                                                            ? 'bg-red-500 text-white animate-pulse' 
                                                            : waitTime > 30 
                                                                ? 'bg-amber-500 text-white' 
                                                                : 'bg-emerald-500 text-white'
                                                    }`}
                                                >
                                                    {waitTime < 60 ? `${waitTime}P` : `${Math.floor(waitTime / 60)}H ${waitTime % 60}P`}
                                                </Badge>
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-[11px] font-bold">
                                                <span className="text-slate-500 uppercase">{job.brand} {job.model}</span>
                                                <span className="text-slate-400 tabular-nums">#{job.odo?.toLocaleString()} KM</span>
                                            </div>

                                            <div className="mt-auto pt-2 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-slate-400 uppercase font-black leading-none">Cố vấn</span>
                                                    <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold">{job.receptionistName}</span>
                                                </div>
                                                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-amber-500 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Section cho Thợ Sửa Chữa (Stats + Jobs) */}
                {(isRepair || isAdmin) && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Đang thực hiện</p>
                                        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{stats.inProgressJobs}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                        <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Xong hôm nay</p>
                                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.completedToday}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                            </div>

                            <Link href="/mechanic/jobs" className="block group">
                                <div className="bg-slate-900 p-6 rounded-xl shadow-sm text-white hover:bg-slate-800 transition-all border border-slate-800 hover:border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-400 font-medium tracking-tight">Khu vực kỹ thuật</p>
                                            <p className="text-xl font-bold mt-1 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                                                Vào việc ngay <ArrowRight className="w-5 h-5" />
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Section Xe chờ phân công (Chỉ dành cho Quản đốc) */}
                        {roles?.includes('QUAN_LY_XUONG') && repairJobs.some((j: any) => !j.claimedByName) && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border-2 border-amber-400/30 dark:border-amber-800 overflow-hidden mb-6 transition-colors">
                                <div className="px-6 py-4 border-b border-amber-100 dark:border-amber-900/30 flex items-center justify-between bg-amber-50/30 dark:bg-amber-900/10">
                                    <div className="flex flex-col">
                                        <h2 className="font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-amber-500 animate-bounce-slow" /> Cần điều phối thợ ({repairJobs.filter((j: any) => !j.claimedByName).length})
                                        </h2>
                                        <p className="text-[10px] text-amber-600 font-medium uppercase tracking-widest mt-0.5">Xe đã chốt đề xuất hạng mục</p>
                                    </div>
                                    <Link href="/mechanic/assign" className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black shadow-lg shadow-amber-200 dark:shadow-none transition-all flex items-center gap-2">
                                        PHÂN CÔNG <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800">
                                    {repairJobs.filter((j: any) => !j.claimedByName).map((job: any) => (
                                        <Link
                                            key={job.id}
                                            href={`/mechanic/assign/${job.id}`}
                                            className="p-4 flex flex-col gap-1 hover:bg-amber-50/20 dark:hover:bg-amber-900/5 transition-colors"
                                        >
                                            <p className="font-black text-lg text-slate-800 dark:text-slate-100 tabular-nums">{job.plate}</p>
                                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                {job.totalItems} HẠNG MỤC
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Danh sách việc đang sửa */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h2 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Xưởng đang thực thi</h2>
                                <Link href="/mechanic/jobs" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                    TẤT CẢ XE
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {repairJobs.slice(0, 10).map((job: any) => {
                                    const progress = job.totalItems > 0
                                        ? Math.round((job.completedItems / job.totalItems) * 100)
                                        : 0;

                                    return (
                                        <Link
                                            key={job.id}
                                            href={`/mechanic/jobs/${job.id}`}
                                            className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">{job.plate}</p>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                                                        {job.vehicleBrand}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-slate-400 font-bold">{job.completedItems}/{job.totalItems} Hạng mục</span>
                                                    {job.claimedByName && (
                                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800 rounded bg-emerald-50 dark:bg-emerald-900/10">
                                                            P/T: {job.claimedByName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">{progress}%</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                                {repairJobs.length === 0 && (
                                    <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <Wrench className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                                        <p className="font-medium">Xưởng đang trống việc</p>
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
