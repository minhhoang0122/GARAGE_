import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleService, SaleStats, OrderDetail } from '../services/sale';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';

export const useSaleStats = () => {
    return useQuery<SaleStats>({
        queryKey: queryKeys.sale.stats(),
        queryFn: () => saleService.getStats(),
        staleTime: 30000,
    });
};

export const useOrders = (filters: any = {}) => {
    return useQuery<OrderDetail[]>({
        queryKey: queryKeys.order.list(filters),
        queryFn: () => saleService.getOrders(filters),
    });
};

export const useOrderDetail = (id: string | number) => {
    return useQuery<OrderDetail>({
        queryKey: queryKeys.order.detail(id),
        queryFn: () => saleService.getOrderDetail(id),
        enabled: !!id,
        staleTime: 10000,
    });
};

export const useSearchProducts = (keyword: string = '') => {
    return useQuery<any[]>({
        queryKey: queryKeys.sale.products(keyword),
        queryFn: () => saleService.searchProducts(keyword),
    });
};

// --- Mutations ---

export const useCancelOrder = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation<any, any, { orderId: number; reason: string }>({
        mutationFn: ({ orderId, reason }: { orderId: number; reason: string }) => 
            saleService.cancel(orderId, reason),
        ...options,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sale.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(variables.orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            if (options?.onSuccess) options.onSuccess(data, variables, context);
            else toast.success('Đã hủy đơn hàng');
        },
        onError: (error: any, variables, context) => {
            if (options?.onError) options.onError(error, variables, context);
            else toast.error(`Hủy đơn hàng thất bại: ${error.message}`);
        }
    });
};

export const useAddOrderItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, productId, quantity }: { orderId: number; productId: number; quantity: number }) =>
            saleService.addItem(orderId, productId, quantity),
        onSuccess: (_, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sale.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.sale.products() });
        }
    });
};

export const useUpdateOrderItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, data }: { orderId: number; itemId: number; data: { quantity?: number; discountPercent?: number; version?: number; oldPartAction?: string; technicianId?: number | null } }) =>
            saleService.updateItem(itemId, data as any),
        onSuccess: (_, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sale.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.sale.products() });
        }
    });
};

export const useRemoveOrderItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, version }: { orderId: number; itemId: number; version?: number }) =>
            saleService.removeItem(itemId, version),
        onSuccess: (_, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sale.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.sale.products() });
        }
    });
};


export const useUpdateItemStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, status, token }: { orderId: number; itemId: number; status: string; token?: string }) =>
            saleService.updateItemStatus(itemId, status, token),
        onSuccess: (_, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
        }
    });
};

export const useFinalizeOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: number) => saleService.finalize(orderId),
        onSuccess: (_, orderId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            toast.success('Đã hoàn tất lệnh sửa chữa');
        }
    });
};

export const useClaimOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: number) => saleService.claim(orderId),
        onSuccess: (_, orderId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
        }
    });
};

export const useUpdateOrderTotals = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, discount, vatPercent, version }: { orderId: number; discount?: number; vatPercent?: number; version?: number }) => 
            saleService.updateOrderTotals(orderId, { discount, vatPercent, version }),
        onSuccess: (_, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
        }
    });
};

export const useCreateWarranty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, itemIds, odo }: { orderId: number; itemIds: number[]; odo: number }) => 
            saleService.createWarranty(orderId, itemIds, odo),
        onSuccess: (_, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            toast.success('Đã tạo đơn bảo hành thành công');
        },
        onError: (error: any) => {
            toast.error(`Tạo đơn bảo hành thất bại: ${error.message}`);
        }
    });
};

export const useRequestDiagnosis = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => saleService.requestDiagnosis(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sale.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            toast.success('Đã gửi yêu cầu chẩn đoán cho kỹ thuật viên');
        },
    });
};

export const useSubmitQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: number) => saleService.submitQuote(orderId),
        onSuccess: (_, orderId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            toast.success('Báo giá đã được gửi cho khách hàng');
        },
        onError: (error: any) => {
            toast.error(`Gửi báo giá thất bại: ${error.message}`);
        }
    });
};

export const useApproveQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: number) => saleService.approveQuote(orderId),
        onSuccess: (_, orderId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            toast.success('Đã phê duyệt báo giá và chốt đơn hàng');
        },
        onError: (error: any) => {
            toast.error(`Phê duyệt thất bại: ${error.message}`);
        }
    });
};

export const useCreateOrderFromReception = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (receptionId: number) => saleService.createOrderFromReception(receptionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sale.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
        }
    });
};
