import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { financeService } from '../services/finance';

export const useFinanceStats = () => {
    return useQuery({
        queryKey: queryKeys.finance.transactions.stats(),
        queryFn: () => financeService.getStats(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useTransactions = () => {
    return useQuery({
        queryKey: queryKeys.finance.transactions.lists(),
        queryFn: financeService.getRecentTransactions,
        staleTime: 1000 * 60, // 1 minute
    });
};

export const useDebts = () => {
    return useQuery({
        queryKey: queryKeys.finance.debts.lists(),
        queryFn: financeService.getDebts,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const usePaymentSummary = (orderId: number) => {
    return useQuery({
        queryKey: queryKeys.finance.transactions.detail(orderId),
        queryFn: () => financeService.getPaymentSummary(orderId),
        enabled: !!orderId,
    });
};

export const usePaymentsByOrder = (orderId: number) => {
    return useQuery({
        queryKey: queryKeys.finance.transactions.all(),
        queryFn: () => financeService.getPaymentsByOrder(orderId),
        enabled: !!orderId,
    });
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: financeService.createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.finance.transactions.all() });
        }
    });
};

export const useProcessPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: any }) =>
            financeService.processPayment(orderId, data),
        onMutate: async ({ orderId }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.order.detail(orderId) });
            const previousOrder = queryClient.getQueryData(queryKeys.order.detail(orderId));
            
            // Optimistically set order status to something reflecting payment progress
            queryClient.setQueryData(queryKeys.order.detail(orderId), (old: any) => {
                if (!old) return old;
                return { ...old, status: 'CHO_GIAO_XE' }; // Typical status after payment
            });
            
            return { previousOrder };
        },
        onError: (err, { orderId }, context) => {
            queryClient.setQueryData(queryKeys.order.detail(orderId), context?.previousOrder);
        },
        onSettled: (_, __, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.finance.transactions.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.finance.transactions.detail(orderId) });
        }
    });
};

