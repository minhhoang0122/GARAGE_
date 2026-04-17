'use client';

import { DashboardLayout } from '@/modules/common/components/layout';
import { mechanicService } from '@/modules/mechanic/services/mechanic';
import Link from 'next/link';
import { ClipboardCheck, ChevronRight, Car, Loader2, User, Clock, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Badge } from '@/modules/shared/components/ui/badge';

export default function InspectListPage() {
    const { data: receptions = [], isLoading } = useQuery({
        queryKey: ['mechanic-inspect-jobs'],
        queryFn: () => mechanicService.getInspectJobs(),
    });

    // Real-time counter (Refresh every minute)
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <DashboardLayout title="Danh mục Kỹ thuật" subtitle="Danh sách xe chờ chẩn đoán và đề xuất hạng mục">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Xe chờ khám</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Kiểm tra xe và lập danh sách hạng mục cần sửa/thay thế
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
                            <p>Đang tải danh sách...</p>
                        </div>
                    ) : receptions.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                            <p>Không có xe nào chờ khám</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {receptions.map((reception: any) => {
                                const waitTimeMs = now.getTime() - new Date(reception.date || reception.createdAt).getTime();
                                const waitTimeMin = Math.floor(waitTimeMs / (1000 * 60));
                                const isUrgent = waitTimeMin > 60;

                                return (
                                    <Link
                                        key={reception.id}
                                        href={`/mechanic/inspect/${reception.id}`}
                                        className="px-6 py-5 flex items-center gap-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-l-4 border-transparent hover:border-blue-500 border-b border-slate-100 dark:border-slate-800 last:border-0"
                                    >
                                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                                            {reception.imageUrl ? (
                                                <img src={reception.imageUrl.split(',')[0]} alt="Xe" className="w-full h-full object-cover" />
                                            ) : (
                                                <Car className="w-7 h-7 text-slate-400" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-lg font-black text-slate-900 dark:text-white tracking-widest leading-none">{reception.plate}</span>
                                                    {isUrgent && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold rounded-full animate-pulse">
                                                            CHỜ LÂU (&gt;1H)
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                                    {reception.brand || reception.vehicleBrand} {reception.model || reception.vehicleModel}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-blue-400" /> <span className="font-medium text-slate-500">Cố vấn:</span> <span className="text-slate-700 dark:text-slate-300 font-bold">{reception.receptionistName || 'Chưa rõ'}</span>
                                                </p>
                                            </div>
                                            
                                            <div className="flex flex-col justify-center gap-1.5 text-sm">
                                                <div className="flex items-center gap-2.5 text-slate-500">
                                                    <Clock className="w-4 h-4 text-blue-500" />
                                                    <span className="font-medium">Chờ: <strong className={isUrgent ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}>{waitTimeMin} phút</strong></span>
                                                </div>
                                                <div className="flex items-center gap-2.5 text-slate-500">
                                                    <RefreshCw className="w-4 h-4 text-amber-500" />
                                                    <span className="font-medium">ODO: <strong className="text-slate-800 dark:text-slate-200">{reception.odo?.toLocaleString() || 0} km</strong></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                            <div className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/20 dark:shadow-none hover:scale-105 active:scale-95 uppercase">
                                                Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded leading-none">
                                                {new Date(reception.date || reception.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
