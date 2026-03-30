import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customer';
import { queryKeys } from '@/lib/query-keys';

export const useCustomers = (filters: any = {}) => {
    return useQuery({
        queryKey: queryKeys.customer.list(filters),
        queryFn: () => customerService.getCustomers(filters),
    });
};

export const useCustomerDetail = (id: string | number) => {
    return useQuery({
        queryKey: queryKeys.customer.detail(id),
        queryFn: () => customerService.getCustomerDetail(id),
        enabled: !!id,
    });
};

export const useMyOrders = () => {
    return useQuery({
        queryKey: queryKeys.customer.me(),
        queryFn: () => customerService.getMyOrders(),
    });
};

export const useMyOrderDetail = (id: string | number) => {
    return useQuery({
        queryKey: [...queryKeys.customer.me(), 'order', id],
        queryFn: () => customerService.getCustomerOrderDetails(Number(id)),
        enabled: !!id,
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: customerService.createCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customer.all });
        }
    });
};

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => customerService.updateCustomer(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customer.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.customer.detail(variables.id) });
        }
    });
};

export const useApproveQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => customerService.approveQuote(Number(id)),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customer.me() });
            queryClient.invalidateQueries({ queryKey: [...queryKeys.customer.me(), 'order', id] });
        }
    });
};

export const useRejectQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string | number; reason: string }) => customerService.rejectQuote(Number(id), reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customer.me() });
            queryClient.invalidateQueries({ queryKey: [...queryKeys.customer.me(), 'order', id] });
        }
    });
};

export const useRequestRevision = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, note }: { id: string | number; note: string }) => customerService.requestRevision(Number(id), note),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customer.me() });
            queryClient.invalidateQueries({ queryKey: [...queryKeys.customer.me(), 'order', id] });
        }
    });
};

export const useCreateBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { bienSoXe: string; ghiChu?: string | null; selectedServiceIds?: any[] }) =>
            customerService.createBooking(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customer.me() });
        }
    });
};

export const useMyWarranty = () => {
    return useQuery({
        queryKey: [...queryKeys.customer.me(), 'warranty'],
        queryFn: () => customerService.getWarrantyItems(),
    });
};

export const useClaimWarranty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { orderId: number; itemIds: number[]; currentOdo?: number | null }) =>
            customerService.claimWarranty(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...queryKeys.customer.me(), 'warranty'] });
        }
    });
};

export const useRegisterCustomer = () => {
    return useMutation({
        mutationFn: customerService.register,
    });
};

export const useVerifyRegistration = () => {
    return useMutation({
        mutationFn: customerService.verifyRegistration,
    });
};
