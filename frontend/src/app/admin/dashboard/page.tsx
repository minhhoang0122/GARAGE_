import { DashboardLayout } from '@/modules/common/components/layout';
import { getRevenueReport, getMechanicPerformance, getInventoryReport } from '@/actions/report';
import RevenueChart from '@/modules/admin/components/RevenueChart';
import { Users, DollarSign, TrendingUp, Calendar, Package, AlertTriangle } from 'lucide-react';
import IndustrialStatCard from '@/modules/shared/components/common/IndustrialStatCard';
import { Card } from '@/modules/shared/components/ui/card';

export default async function DashboardPage() {
    // Default to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Fetch Data
    // Fetch Data in Parallel
    const [revenueDataRaw, mechanicData, inventoryData] = await Promise.all([
        getRevenueReport(firstDay, lastDay),
        getMechanicPerformance(firstDay, lastDay),
        getInventoryReport()
    ]);

    // Transform Revenue Data for Chart
    const revenueChartData = revenueDataRaw?.dailyBreakdown
        ? Object.entries(revenueDataRaw.dailyBreakdown)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, amount]) => ({
                date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                revenue: amount
            }))
        : [];

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <DashboardLayout title="Tổng quan" subtitle="Báo cáo hoạt động kinh doanh">
            <div className="space-y-6">
                {/* Stats Cards Row 1 (Financials) - Industrial Redesign */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <IndustrialStatCard
                        icon={<DollarSign />}
                        value={formatCurrency(revenueDataRaw?.netRevenue || 0)}
                        label="Doanh thu tháng này"
                        color="blue"
                    />
                    <IndustrialStatCard
                        icon={<TrendingUp />}
                        value={formatCurrency(revenueDataRaw?.totalRefund || 0)}
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

                {/* Inventory Health Section - Industrial Redesign */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        color={inventoryData?.lowStockCount > 0 ? "red" : "green"}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <Card className="lg:col-span-2 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                Biểu đồ doanh thu
                            </h3>
                        </div>
                        <RevenueChart data={revenueChartData} />
                    </Card>

                    {/* Mechanic Leaderboard */}
                    <Card className="lg:col-span-1 p-6">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Top Thợ (Theo doanh thu)</h3>
                        <div className="space-y-4">
                            {mechanicData.map((m: any, index: number) => (
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
