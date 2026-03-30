import { api } from '@/lib/api';

export interface User {
    id: number;
    username: string;
    fullName: string;
    phone?: string;
    vaiTro: string;
    isActive: boolean;
    avatar?: string;
    lastLogin?: string;
    userType?: 'STAFF' | 'CUSTOMER';
}

export const identityService = {
    getUsers: async (): Promise<User[]> => {
        return api.get('/users');
    },

    getStaffUsers: async (): Promise<User[]> => {
        return api.get('/users/staff');
    },

    getCustomerAccounts: async (): Promise<User[]> => {
        return api.get('/users/customers');
    },

    createUser: async (data: any) => {
        return api.post('/users', data);
    },

    updateUser: async (id: number, data: any) => {
        return api.put(`/users/${id}`, data);
    },

    toggleUserActive: async (id: number) => {
        return api.post(`/users/${id}/toggle-active`, {});
    },

    getCurrentUser: async (): Promise<User> => {
        return api.get('/users/me');
    }
};
