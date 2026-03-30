'use client';

import { DashboardLayout } from '@/modules/common/components/layout';
import { mechanicService } from '@/modules/mechanic/services/mechanic';
import Link from 'next/link';
import { ClipboardCheck, ChevronRight, Car, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function InspectListPage() {
    const { data: receptions = [], isLoading } = useQuery({
        queryKey: ['mechanic-inspect-jobs'],
        queryFn: () => mechanicService.getInspectJobs(),
    });

    return (
        <DashboardLayout title="Khám xe" subtitle="Danh sách xe chờ kiểm tra và đề xuất sửa chữa">
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
                            {receptions.map((reception: any) => (
                                <Link
                                    key={reception.id}
                                    href={`/mechanic/inspect/${reception.id}`}
                                    className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center overflow-hidden border border-amber-200 dark:border-amber-800">
                                        {reception.imageUrl ? (
                                            <img src={reception.imageUrl.split(',')[0]} alt="Xe" className="w-full h-full object-cover" />
                                        ) : (
                                            <Car className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{reception.plate}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                            {reception.vehicleBrand} {reception.vehicleModel} - {reception.customerName}
                                        </p>
                                        {reception.request && (
                                            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 truncate">
                                                Yêu cầu: {reception.request}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(reception.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600 mt-2" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
