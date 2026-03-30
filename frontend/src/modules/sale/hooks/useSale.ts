import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { saleService } from '../services/sale';

export const useSaleStats = () => {
    return useQuery({
        queryKey: queryKeys.sale.stats(),
        queryFn: () => saleService.getStats(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useOrders = (filters: any = {}) => {
    return useQuery({
        queryKey: queryKeys.order.list(filters),
        queryFn: () => saleService.getOrders(filters),
        staleTime: 1000 * 60,
    });
};

export const useOrderDetail = (id: string | number) => {
    return useQuery({
        queryKey: queryKeys.order.detail(id),
        queryFn: () => saleService.getOrderDetail(id),
        enabled: !!id,
    });
};

// --- Mutations ---

export const useAddOrderItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, productId, quantity }: { orderId: number; productId: number; quantity?: number }) =>
            saleService.addItem(orderId, productId, quantity),
        onMutate: async ({ orderId, productId, quantity }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.order.detail(orderId) });
            const previousOrder = queryClient.getQueryData(queryKeys.order.detail(orderId));
            queryClient.setQueryData(queryKeys.order.detail(orderId), (old: any) => {
                if (!old) return old;
                const newItem = {
                    id: -(Date.now()),
                    productId,
                    productName: 'Hạng mục mới...',
                    quantity: quantity || 1,
                    unitPrice: 0,
                    total: 0,
                    itemStatus: 'PENDING'
                };
                return { ...old, items: [...(old.items || []), newItem] };
            });
            return { previousOrder };
        },
        onError: (err, { orderId }, context) => {
            queryClient.setQueryData(queryKeys.order.detail(orderId), context?.previousOrder);
        },
        onSettled: (_, __, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
        }
    });
};


export const useUpdateOrderItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, itemId, data }: { orderId: number; itemId: number; data: any }) =>
            saleService.updateItem(itemId, data),
        onMutate: async ({ orderId, itemId, data }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: queryKeys.order.detail(orderId) });

            // Snapshot the previous value
            const previousOrder = queryClient.getQueryData(queryKeys.order.detail(orderId));

            // Optimistically update to the new value
            queryClient.setQueryData(queryKeys.order.detail(orderId), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items?.map((item: any) => 
                        item.id === itemId ? { ...item, ...data, total: (data.quantity ?? item.quantity) * (item.unitPrice) * (1 - (data.discountPercent ?? item.discountPercent) / 100) } : item
                    )
                };
            });

            // Return a context object with the snapshotted value
            return { previousOrder };
        },
        onError: (err, { orderId }, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousOrder) {
                queryClient.setQueryData(queryKeys.order.detail(orderId), context.previousOrder);
            }
        },
        onSettled: (_, __, { orderId }) => {
            // Always refetch after error or success to guarantee server sync
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
        }
    });
};

export const useRemoveOrderItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, itemId }: { orderId: number; itemId: number }) =>
            saleService.removeItem(itemId),
        onMutate: async ({ orderId, itemId }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.order.detail(orderId) });
            const previousOrder = queryClient.getQueryData(queryKeys.order.detail(orderId));
            queryClient.setQueryData(queryKeys.order.detail(orderId), (old: any) => {
                if (!old) return old;
                return { ...old, items: old.items?.filter((i: any) => i.id !== itemId) };
            });
            return { previousOrder };
        },
        onError: (err, { orderId }, context) => {
            queryClient.setQueryData(queryKeys.order.detail(orderId), context?.previousOrder);
        },
        onSettled: (_, __, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
        }
    });
};


export const useSubmitQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: number) => saleService.submitQuote(orderId),
        onSuccess: (_, orderId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
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
        }
    });
};

export const useCancelOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, reason }: { orderId: number; reason: string }) =>
            saleService.cancel(orderId, reason),
        onSuccess: (_, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
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

// Customer Actions Hooks
export const useApproveQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => saleService.approveQuote(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(id) });
        }
    });
};

export const useRejectQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string | number; reason: string }) => saleService.rejectQuote(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(id) });
        }
    });
};

export const useRequestRevision = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, note }: { id: string | number; note: string }) => saleService.requestRevision(id, note),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(id) });
        }
    });
};

export const useUpdateItemStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, status, token }: { itemId: number; status: string; token?: string; orderId?: number }) =>
            saleService.updateItemStatus(itemId, status, token),
        onMutate: async ({ itemId, status, orderId }) => {
            if (!orderId) return;
            await queryClient.cancelQueries({ queryKey: queryKeys.order.detail(orderId) });
            const previousOrder = queryClient.getQueryData(queryKeys.order.detail(orderId));
            queryClient.setQueryData(queryKeys.order.detail(orderId), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items?.map((i: any) => i.id === itemId ? { ...i, itemStatus: status } : i)
                };
            });
            return { previousOrder };
        },
        onError: (err, { orderId }, context) => {
            if (orderId) queryClient.setQueryData(queryKeys.order.detail(orderId), context?.previousOrder);
        },
        onSettled: (_, __, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            if (orderId) queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
        }
    });
};


export const useCloseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: number) => saleService.close(orderId),
        onSuccess: (_, orderId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
        }
    });
};

export const useSubmitReplenishmentQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: number) => saleService.submitReplenishmentQuote(orderId),
        onSuccess: (_, orderId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
        }
    });
};

export const useSearchProducts = (keyword: string) => {
    return useQuery({
        queryKey: ['products', 'search', keyword],
        queryFn: () => saleService.searchProducts(keyword),
        enabled: true
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saleService.createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.list({ allProducts: true }) });
        }
    });
};

export const useUpdateOrderTotals = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: { discount?: number, vatPercent?: number } }) =>
            saleService.updateOrderTotals(orderId, data),
        onSuccess: (_, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(orderId) });
        }
    });
};

export const useCreateOrderFromReception = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saleService.createOrderFromReception,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.order.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.reception.all });
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
        }
    });
};
