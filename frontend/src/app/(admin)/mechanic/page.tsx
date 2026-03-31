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

    return (
        <DashboardLayout
            title={isDiagnose ? ROLE_DISPLAY_NAMES.QUAN_LY_XUONG : ROLE_DISPLAY_NAMES.THO_SUA_CHUA}
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
                                inspectJobs.map((job: any) => (
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

                        {/* Section Xe chờ phân công (Chỉ dành cho Quản đốc) */}
                        {roles.includes('QUAN_LY_XUONG') && repairJobs.some((j: any) => !j.claimedByName) && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border-2 border-amber-200 dark:border-amber-800 overflow-hidden mb-6 transition-colors animate-pulse-subtle">
                                <div className="px-6 py-4 border-b border-amber-100 dark:border-amber-900/30 flex items-center justify-between bg-amber-50/50 dark:bg-amber-900/10">
                                    <h2 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-amber-500" /> Xe chờ phân công ({repairJobs.filter((j: any) => !j.claimedByName).length})
                                    </h2>
                                    <Link href="/mechanic/assign" className="text-sm font-bold text-amber-700 dark:text-amber-500 hover:underline flex items-center gap-1">
                                        Vào điều phối <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {repairJobs.filter((j: any) => !j.claimedByName).map((job: any) => (
                                        <Link
                                            key={job.id}
                                            href={`/mechanic/assign/${job.id}`}
                                            className="px-6 py-4 flex items-center gap-4 hover:bg-amber-50/30 dark:hover:bg-amber-900/5 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 font-bold text-sm">
                                                !
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{job.plate}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    {job.vehicleBrand} {job.vehicleModel} - {job.customerName}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500">
                                                {job.totalItems} hạng mục
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Danh sách việc đang sửa */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h2 className="font-semibold text-slate-800 dark:text-slate-100">Xe đang sửa chữa</h2>
                                <Link href="/mechanic/jobs" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Xem tất cả
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {repairJobs.slice(0, 5).map((job: any) => {
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
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{job.plate}</p>
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
