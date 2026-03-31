'use client';

import { DashboardLayout } from '@/modules/common/components/layout';
import { mechanicService } from '@/modules/mechanic/services/mechanic';
import { Users, Wrench, Award, Briefcase, Loader2, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import BaseAvatar from '@/modules/shared/components/common/BaseAvatar';
import { AdvancedDataTable } from '@/modules/shared/components/ui/AdvancedDataTable';
import { Button } from '@/modules/shared/components/ui/button';

export default function TeamPage() {
    const { data: mechanics = [], isLoading, refetch } = useQuery({
        queryKey: ['mechanic-team'],
        queryFn: () => mechanicService.getAvailableMechanics(),
    });

    const totalMechanics = mechanics.length;
    const busyCount = mechanics.filter((m: any) => m.soViecDangLam > 0).length;
    const freeCount = totalMechanics - busyCount;

    const columns = [
        {
            header: 'Kỹ thuật viên',
            accessorKey: 'fullName',
            render: (value: any, m: any) => (
                <div className="flex items-center gap-4">
                    <BaseAvatar 
                        name={m.fullName} 
                        size="md"
                        online={m.soViecDangLam === 0}
                    />
                    <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{m.fullName}</p>
                        <p className="text-[10px] font-medium text-slate-400">ID: #{m.id}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Chuyên môn / Cấp bậc',
            accessorKey: 'chuyenMonLabel',
            className: 'hidden md:table-cell',
            render: (value: any, m: any) => (
                <div className="flex items-center gap-2">
                    {m.chuyenMonLabel && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 font-bold">
                            {m.chuyenMonLabel}
                        </span>
                    )}
                    {m.capBacLabel && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                            {m.capBacLabel}
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Khối lượng CV',
            accessorKey: 'soViecDangLam',
            className: 'text-center',
            render: (soViec: number) => (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${
                    soViec === 0
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : soViec >= 3
                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                }`}>
                    {soViec === 0 ? 'Sẵn sàng' : `${soViec} đơn đang làm`}
                </span>
            )
        }
    ];

    return (
        <DashboardLayout title="Đội thợ" subtitle="Quản lý và theo dõi đội ngũ Kỹ thuật viên">
            <div className="max-w-5xl mx-auto space-y-6">

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                        <p className="text-slate-500 font-medium">Đang tải danh sách đội thợ...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Danh sách kỹ thuật viên</h2>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => refetch()} 
                                    className="h-9 px-4 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold gap-2"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                                    <span>Làm mới</span>
                                </Button>
                            </div>

                            <AdvancedDataTable
                                data={mechanics}
                                columns={columns}
                                isLoading={isLoading}
                                searchPlaceholder="Tìm theo tên hoặc chuyên môn..."
                                emptyState={{
                                    title: 'Trống',
                                    description: 'Chưa có kỹ thuật viên nào trong hệ thống.'
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
