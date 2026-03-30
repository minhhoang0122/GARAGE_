import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin';
import { useToast } from '@/contexts/ToastContext';

export function useAdminProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: adminService.getProducts,
        staleTime: 5 * 60 * 1000,
    });
}

export function useBatchUpdateProducts() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: adminService.batchUpdateProducts,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            showToast('success', 'Cập nhật giá thành công!');
        },
        onError: (error: any) => {
            showToast('error', 'Lỗi: ' + (error.message || 'Không thể lưu'));
        }
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: adminService.createProduct,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            const type = variables.laDichVu ? 'Dịch vụ' : 'Phụ tùng';
            showToast('success', `Thêm ${type} mới thành công!`);
        },
        onError: (error: any) => {
            showToast('error', 'Lỗi: ' + (error.message || 'Không thể tạo mới'));
        }
    });
}

export function useAdminConfigs() {
    return useQuery({
        queryKey: ['config'],
        queryFn: adminService.getConfigs,
    });
}

export function useUpdateConfigs() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: adminService.updateConfigs,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['config'] });
            showToast('success', 'Đã lưu cấu hình hệ thống');
        },
        onError: (error: any) => {
            showToast('error', 'Lỗi: ' + (error.message || 'Không thể lưu cấu hình'));
        }
    });
}
