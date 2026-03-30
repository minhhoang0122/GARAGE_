import { api } from '@/lib/api';

export interface RevenueReport {
    netRevenue: number;
    totalRefund: number;
    dailyBreakdown: Record<string, number>;
    chartData: { date: string; revenue: number }[];
}

export interface MechanicPerformance {
    mechanicId: number;
    mechanicName: string;
    taskCount: number;
    revenue: number;
}

export interface InventoryReport {
    totalValue: number;
    lowStockCount: number;
}

export const reportService = {
    // Báo cáo doanh thu
    getRevenue: async (startDate: string, endDate: string): Promise<RevenueReport> => {
        const response = await api.get(`/reports/revenue?from=${startDate}&to=${endDate}`);
        
        // Transform dailyBreakdown for chart
        const dailyBreakdown = response?.dailyBreakdown || {};
        const chartData = Object.entries(dailyBreakdown)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, amount]) => ({
                date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                revenue: amount as number
            }));

        return {
            netRevenue: response?.netRevenue || 0,
            totalRefund: response?.totalRefund || 0,
            dailyBreakdown,
            chartData
        };
    },

    // Hiệu suất thợ
    getMechanicPerformance: async (startDate: string, endDate: string): Promise<MechanicPerformance[]> => {
        const response = await api.get(`/reports/mechanic-performance?from=${startDate}&to=${endDate}`);
        return (response || []).map((item: any) => ({
            mechanicId: item.mechanicId || item.NhanVienID || item.id,
            mechanicName: item.mechanicName || item.fullName || item.HoTen || 'Kỹ thuật viên',
            taskCount: item.taskCount || item.SoCongViec || 0,
            revenue: item.revenue || item.DoanhThu || 0
        }));
    },

    // Báo cáo tồn kho
    getInventoryReport: async (): Promise<InventoryReport> => {
        const response = await api.get('/reports/inventory');
        return {
            totalValue: response?.totalValue || 0,
            lowStockCount: response?.lowStockCount || 0
        };
    }
};
