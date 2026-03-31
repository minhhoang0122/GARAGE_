'use client';

import Link from 'next/link';
import { Wrench, ChevronRight, User, Calendar, Clock, Car } from 'lucide-react';
import { RepairJob } from '@/modules/mechanic/services/mechanic';
import { isWaitingForRepair, isWaitingForCustomer, isWaitingForQC } from '@/lib/status';

// Helper to determine brand color/badge
const getBrandStyle = (brand: string) => {
    // Simplified brand mapping - in real app could use logos
    const b = brand.toLowerCase();
    // Industrial neutral tags
    if (b.includes('toyota') || b.includes('honda') || b.includes('mazda')) return 'bg-slate-800 text-white border-slate-700';
    if (b.includes('mercedes') || b.includes('bmw') || b.includes('audi')) return 'bg-slate-900 text-white border-slate-800';
    if (b.includes('ford') || b.includes('chevrolet')) return 'bg-slate-700 text-white border-slate-600';
    if (b.includes('hyundai') || b.includes('kia')) return 'bg-slate-600 text-white border-slate-500';
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
};

export default function JobCard({ job }: { job: RepairJob }) {
    const progress = job.totalItems > 0
        ? Math.round((job.completedItems / job.totalItems) * 100)
        : 0;
    const isUnassigned = !job.claimedById;
    const isCompleted = progress === 100;

    // Status Logic - Using legacy-aware helpers
    const isWaiting = isWaitingForRepair(job.status); // Jobs ready to claim
    const isPendingApproval = isWaitingForCustomer(job.status); // Waiting for customer
    const isQC = isWaitingForQC(job.status); // Waiting for QC

    return (
        <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/10 transition-all duration-300 overflow-hidden flex flex-col">
            {/* Top decorative line */}
            <div className={`h-1 w-full ${isCompleted ? 'bg-emerald-500' : isQC ? 'bg-amber-500' : isUnassigned ? 'bg-blue-500' : 'bg-slate-900 dark:bg-slate-400'}`}></div>

            <div className="p-5 flex-1 flex flex-col">
                {/* Header: Plate & Brand - Industrial Redesign */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-5">
                        {/* Brand Style Logic kept same */}
                        <div className="flex flex-col items-center">
                            <div className="bg-white dark:bg-slate-800 border overflow-hidden border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 transition-all">
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">{job.plate}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">Cơ giới</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getBrandStyle(job.vehicleBrand)}`}>
                                    {job.vehicleBrand}
                                </span>
                                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-tighter truncate max-w-[100px]">{job.vehicleModel}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body: Info Grid - Kept Same */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-slate-600 dark:text-slate-300 mb-6">
                    <div className="flex items-center gap-2 col-span-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-xs truncate uppercase">{job.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium tabular-nums">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium tabular-nums">{new Date(job.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                {/* Mechanic Status - Technical Overhaul */}
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {isUnassigned ? (
                        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full border border-slate-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Chờ phân công</span>
                        </div>
                    ) : isQC ? (
                        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Chờ Nghiệm Thu</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {job.claimedByName?.charAt(0) || 'T'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase">{job.claimedByName}</span>
                                <span className="text-[10px] text-slate-500 font-medium">Kỹ thuật viên</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Action Area */}
            <div className="bg-slate-50 dark:bg-slate-950/50 px-5 py-3 group-hover:bg-slate-100 dark:group-hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4">
                {/* Progress Bar (Mini) */}
                <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-semibold text-slate-500">Tiến độ</span>
                        <span className={`text-xs font-bold ${isCompleted ? 'text-emerald-600' : 'text-slate-700'}`}>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : isQC ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Primary Action Button */}
                <Link
                    href={`/mechanic/jobs/${job.id}`}
                    className="relative flex items-center justify-center w-10 h-10 rounded-full shadow-sm transition-all duration-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500"
                    title="Xem chi tiết"
                >
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </div>
        </div >
    );
}
