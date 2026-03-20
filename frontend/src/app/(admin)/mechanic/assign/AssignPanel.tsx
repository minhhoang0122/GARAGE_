'use client';

import { useState } from 'react';
import { assignJob, type JobSummary, type MechanicInfo } from '@/modules/service/mechanic';
import { Car, ChevronDown, Loader2, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AssignPanel({ job, mechanics }: { job: JobSummary; mechanics: MechanicInfo[] }) {
    const [selectedMechanic, setSelectedMechanic] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    async function handleAssign() {
        if (!selectedMechanic) return;
        setLoading(true);
        setError('');
        const result = await assignJob(job.id, selectedMechanic);
        if (result.success) {
            router.refresh();
        } else {
            setError(result.error || 'Có lỗi xảy ra');
        }
        setLoading(false);
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Job Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                        <Car className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{job.plate}</span>
                            <span className="text-xs text-slate-500">{job.vehicleBrand} {job.vehicleModel}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {job.customerName} · {job.totalItems} hạng mục · {job.completedItems} đã xong
                        </p>
                    </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Assignment Panel */}
            {isOpen && (
                <div className="border-t border-slate-100 dark:border-slate-700 p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 font-medium">Chọn Kỹ thuật viên:</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        {mechanics.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMechanic(m.id)}
                                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                                    selectedMechanic === m.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500'
                                        : 'border-slate-200 dark:border-slate-600 hover:border-blue-300'
                                }`}
                            >
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{m.hoTen}</p>
                                    <div className="flex gap-1.5 mt-1">
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">{m.chuyenMonLabel}</span>
                                        <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">{m.capBacLabel}</span>
                                    </div>
                                </div>
                                <span className={`text-xs font-medium ${
                                    m.soViecDangLam > 2 ? 'text-red-500' : m.soViecDangLam > 0 ? 'text-amber-500' : 'text-green-500'
                                }`}>
                                    {m.soViecDangLam} việc
                                </span>
                            </button>
                        ))}
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 mb-3">{error}</p>
                    )}

                    <button
                        onClick={handleAssign}
                        disabled={!selectedMechanic || loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <UserCheck className="h-4 w-4" />
                        )}
                        {loading ? 'Đang giao việc...' : 'Giao việc'}
                    </button>
                </div>
            )}
        </div>
    );
}
