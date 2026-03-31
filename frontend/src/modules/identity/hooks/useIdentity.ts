import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { identityService } from '../services/identityService';

export const useUsers = () => {
    return useQuery({
        queryKey: queryKeys.identity.users.lists('all'),
        queryFn: identityService.getUsers,
    });
};

export const useStaffUsers = () => {
    return useQuery({
        queryKey: queryKeys.identity.users.lists('staff'),
        queryFn: identityService.getStaffUsers,
    });
};

export const useCustomerAccounts = () => {
    return useQuery({
        queryKey: queryKeys.identity.users.lists('customers'),
        queryFn: identityService.getCustomerAccounts,
    });
};

export const useCurrentUser = () => {
    return useQuery({
        queryKey: queryKeys.identity.users.detail('me'),
        queryFn: identityService.getCurrentUser,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: identityService.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.identity.users.all() });
            queryClient.invalidateQueries({ queryKey: ['staff'] });
            queryClient.invalidateQueries({ queryKey: ['receptions'] });
            queryClient.invalidateQueries({ queryKey: ['reception'] });
            queryClient.invalidateQueries({ queryKey: ['repair-orders'] });
        }
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => identityService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.identity.users.all() });
            queryClient.invalidateQueries({ queryKey: ['staff'] });
            queryClient.invalidateQueries({ queryKey: ['receptions'] });
            queryClient.invalidateQueries({ queryKey: ['reception'] });
            queryClient.invalidateQueries({ queryKey: ['repair-orders'] });
        }
    });
};

export const useToggleUserActive = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: identityService.toggleUserActive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.identity.users.all() });
        }
    });
};
