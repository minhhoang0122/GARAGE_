'use client';

import { DashboardLayout } from '@/modules/common/components/layout';
import RevenueChart from '@/modules/admin/components/RevenueChart';
import { Users, DollarSign, TrendingUp, Calendar, Package, AlertTriangle } from 'lucide-react';
import IndustrialStatCard from '@/modules/shared/components/common/IndustrialStatCard';
import { Card } from '@/modules/shared/components/ui/card';
import { RealtimeRefresh } from '@/modules/common/components/layout/RealtimeRefresh';
import { useRevenueReport, useMechanicPerformance, useInventoryReport } from '@/modules/report/hooks/useReport';

export default function DashboardPage() {
    // Default to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Fetch Data using Hooks
    const { data: revenueData, isLoading: isRevLoading } = useRevenueReport(firstDay, lastDay);
    const { data: mechanicData = [], isLoading: isMechLoading } = useMechanicPerformance(firstDay, lastDay);
    const { data: inventoryData, isLoading: isInvLoading } = useInventoryReport();

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    if (isRevLoading || isMechLoading || isInvLoading) {
        return (
            <DashboardLayout title="Tổng quan" subtitle="Đang tải dữ liệu...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Tổng quan" subtitle="Báo cáo hoạt động kinh doanh">
            <RealtimeRefresh events={['payment_updated', 'reception_created', 'order_updated', 'inventory_updated']} />
            
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <IndustrialStatCard
                        icon={<DollarSign />}
                        value={formatCurrency(revenueData?.netRevenue || 0)}
                        label="Doanh thu tháng này"
                        color="blue"
                    />
                    <IndustrialStatCard
                        icon={<TrendingUp />}
                        value={formatCurrency(revenueData?.totalRefund || 0)}
                        label="Tổng hoàn tiền"
                        color="red"
                    />
                    <IndustrialStatCard
                        icon={<Users />}
                        value={mechanicData[0]?.mechanicName || 'Chưa có'}
                        label="Thợ xuất sắc nhất"
                        color="green"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <IndustrialStatCard
                        icon={<Package />}
                        value={formatCurrency(inventoryData?.totalValue || 0)}
                        label="Giá trị tồn kho"
                        color="slate"
                    />
                    <IndustrialStatCard
                        icon={<AlertTriangle />}
                        value={`${inventoryData?.lowStockCount || 0} SP`}
                        label="Cảnh báo sắp hết"
                        color={(inventoryData?.lowStockCount || 0) > 0 ? "red" : "green"}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                Biểu đồ doanh thu
                            </h3>
                        </div>
                        <RevenueChart data={revenueData?.chartData || []} />
                    </Card>

                    <Card className="lg:col-span-1 p-6">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Top Thợ (Theo doanh thu)</h3>
                        <div className="space-y-4">
                            {mechanicData.map((m, index: number) => (
                                <div key={m.mechanicId} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                            index === 1 ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                                                index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{m.mechanicName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{m.taskCount} công việc</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-blue-400 text-sm">
                                        {formatCurrency(m.revenue)}
                                    </span>
                                </div>
                            ))}
                            {mechanicData.length === 0 && (
                                <p className="text-center text-slate-400 py-4 text-sm">Chưa có dữ liệu</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
