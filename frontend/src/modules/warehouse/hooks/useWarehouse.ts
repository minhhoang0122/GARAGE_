import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService } from '../services/warehouse';
import { queryKeys } from '@/lib/query-keys';

export const useWarehouseStats = () => {
    return useQuery({
        queryKey: ['warehouse', 'stats'],
        queryFn: () => warehouseService.getStats()
    });
};

export const useInventory = (search: string = '') => {
    return useQuery({
        queryKey: queryKeys.warehouse.inventory.list(search),
        queryFn: () => warehouseService.getInventory(search)
    });
};

export const usePendingExports = () => {
    return useQuery({
        queryKey: ['warehouse', 'pending-exports'],
        queryFn: () => warehouseService.getPendingExports()
    });
};

export const useExportDetail = (orderId: string | number) => {
    return useQuery({
        queryKey: ['warehouse', 'export', orderId],
        queryFn: () => warehouseService.getExportDetail(orderId),
        enabled: !!orderId
    });
};

export const useConfirmExport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: warehouseService.confirmExport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouse', 'stats'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.warehouse.inventory.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse', 'pending-exports'] });
        }
    });
};

export const useWarehouseImport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => warehouseService.importStock(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.warehouse.inventory.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse', 'stats'] });
        }
    });
};

export const useInventoryCheck = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: warehouseService.adjustStock,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.warehouse.inventory.all() });
        }
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: warehouseService.createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.warehouse.inventory.all() });
        }
    });
};

export const useReturnStock = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: { productId: number; quantity: number; reason: string } }) => 
            warehouseService.returnStock(orderId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['warehouse', 'stats'] });
            queryClient.invalidateQueries({ queryKey: ['warehouse', 'pending-exports'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.warehouse.inventory.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse', 'export', variables.orderId] });
        }
    });
};

export const useProductDetail = (productId: string | number) => {
    return useQuery({
        queryKey: queryKeys.warehouse.inventory.detail(productId),
        queryFn: () => warehouseService.getProductDetail(productId),
        enabled: !!productId
    });
};

export const useBatches = (productId: string | number) => {
    return useQuery({
        queryKey: ['warehouse', 'batches', productId],
        queryFn: () => warehouseService.getBatches(productId),
        enabled: !!productId
    });
};

export const useMovements = (productId: string | number) => {
    return useQuery({
        queryKey: ['warehouse', 'movements', productId],
        queryFn: () => warehouseService.getMovements(productId),
        enabled: !!productId
    });
};

export const useDisposeBatch = (productId: string | number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (batchId: number) => warehouseService.disposeBatch(batchId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.warehouse.inventory.detail(productId) });
            queryClient.invalidateQueries({ queryKey: ['warehouse', 'batches', productId] });
            queryClient.invalidateQueries({ queryKey: ['warehouse', 'movements', productId] });
        }
    });
};
