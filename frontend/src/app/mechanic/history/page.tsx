'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Badge } from '@/modules/shared/components/ui/badge';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/utils';
import { History, Loader2, Car, Calendar, Wrench } from 'lucide-react';
import Link from 'next/link';

interface JobHistory {
    id: number;
    plate: string;
    customerName: string;
    status?: string;
    completedAt?: string; // For Repair
    createdAt?: string;   // For Diagnostic
    totalAmount?: number;
    vehicleBrand?: string;
    vehicleModel?: string;
}

export default function MechanicHistoryPage() {
    const { data: session } = useSession();
    const [jobs, setJobs] = useState<JobHistory[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadHistory() {
        setLoading(true);
        try {
            const user = session?.user as any;
            const role = user?.role;
            const token = user?.accessToken;
            if (!token) return;

            if (role === 'THO_CHAN_DOAN') {
                // Get history of receptions inspected (even if not finished)
                const res = await api.get('/mechanic/inspect/history', token);
                setJobs(res || []);
            } else {
                // Get completed orders for Repair Mechanic
                const res = await api.get('/mechanic/jobs/history', token);
                setJobs(res || []);
            }
        } catch (error) {
            console.error('Failed to load history', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (session) {
            loadHistory();
        }
    }, [session]);

    const isDiagnostic = (session?.user as any)?.role === 'THO_CHAN_DOAN';

    return (
        <DashboardLayout
            title={isDiagnostic ? "Lịch sử chẩn đoán" : "Lịch sử sửa chữa"}
            subtitle={isDiagnostic ? "Các xe bạn đã từng khám và chẩn đoán" : "Các công việc bạn đã hoàn thành"}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-600" />
                        <p className="mt-2 text-slate-500">Đang tải...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <History className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p>Chưa có công việc nào hoàn thành</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${isDiagnostic ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                                            {isDiagnostic ? (
                                                <History className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                            ) : (
                                                <Wrench className="w-6 h-6 text-green-600 dark:text-green-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight text-lg">{job.plate}</h3>
                                                {isDiagnostic ? (
                                                    <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-bold uppercase text-[10px] px-2 py-0.5">Đã khám</Badge>
                                                ) : (
                                                    <Badge className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 font-bold uppercase text-[10px] px-2 py-0.5">Xong</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1 font-bold">
                                                <Car className="w-4 h-4 text-slate-400" /> {job.customerName}
                                                <span className="text-slate-300 dark:text-slate-700 mx-1">•</span>
                                                <span className="font-medium">{job.vehicleBrand} {job.vehicleModel}</span>
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2 mt-1.5 font-medium">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {isDiagnostic ? (
                                                    <span>Ngày khám: {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                                ) : (
                                                    <span>Hoàn tất: {job.completedAt ? new Date(job.completedAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{isDiagnostic ? 'Mã phiếu' : 'Mã đơn'} #{job.id}</p>
                                        <Link
                                            href={isDiagnostic ? `/mechanic/inspect/${job.id}?source=history` : `/mechanic/jobs/${job.id}?source=history`}
                                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                                        >
                                            Chi tiết →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
