import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/report';
import { queryKeys } from '@/lib/query-keys';

export const useRevenueReport = (startDate: string, endDate: string) => {
    return useQuery({
        queryKey: queryKeys.report.revenue({ startDate, endDate }),
        queryFn: () => reportService.getRevenue(startDate, endDate),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useMechanicPerformance = (startDate: string, endDate: string) => {
    return useQuery({
        queryKey: queryKeys.report.performance({ startDate, endDate }),
        queryFn: () => reportService.getMechanicPerformance(startDate, endDate),
        staleTime: 5 * 60 * 1000,
    });
};

export const useInventoryReport = () => {
    return useQuery({
        queryKey: queryKeys.report.inventory(),
        queryFn: reportService.getInventoryReport,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};
