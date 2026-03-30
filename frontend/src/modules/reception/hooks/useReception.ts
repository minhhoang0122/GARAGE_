import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receptionService } from '../services/reception';
import { queryKeys } from '@/lib/query-keys';

export const useReceptions = (filters: any = {}) => {
    return useQuery({
        queryKey: queryKeys.reception.list(filters),
        queryFn: () => receptionService.getReceptions(filters),
    });
};

export const useReceptionDetail = (id: string | number) => {
    return useQuery({
        queryKey: queryKeys.reception.detail(id),
        queryFn: () => receptionService.getReceptionDetail(id),
        enabled: !!id,
    });
};

export const useCreateReception = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: receptionService.createReception,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.reception.all });
        }
    });
};

export const useUpdateReceptionStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => receptionService.updateStatus(id, status),
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.reception.detail(id) });
            const previousReception = queryClient.getQueryData(queryKeys.reception.detail(id));
            queryClient.setQueryData(queryKeys.reception.detail(id), (old: any) => {
                if (!old) return old;
                return { ...old, status };
            });
            // Also update list if possible
            queryClient.setQueryData(queryKeys.reception.all, (old: any[]) => {
                if (!old) return old;
                return old.map(r => r.id === id ? { ...r, status } : r);
            });
            return { previousReception };
        },
        onError: (err, { id }, context) => {
            queryClient.setQueryData(queryKeys.reception.detail(id), context?.previousReception);
        },
        onSettled: (_, __, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.reception.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.reception.detail(id) });
        }
    });
};


export const useSearchVehicle = (plate: string) => {
    return useQuery({
        queryKey: [...queryKeys.reception.all, 'search', plate],
        queryFn: () => receptionService.searchVehicle(plate),
        enabled: plate.length >= 2,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
};

export const useUpdateReception = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            receptionService.updateReception(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.reception.detail(id) });
            const previousReception = queryClient.getQueryData(queryKeys.reception.detail(id));
            queryClient.setQueryData(queryKeys.reception.detail(id), (old: any) => {
                if (!old) return old;
                return { ...old, ...data };
            });
            return { previousReception };
        },
        onError: (err, { id }, context) => {
            queryClient.setQueryData(queryKeys.reception.detail(id), context?.previousReception);
        },
        onSettled: (_, __, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.reception.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.reception.detail(id) });
        }
    });
};

