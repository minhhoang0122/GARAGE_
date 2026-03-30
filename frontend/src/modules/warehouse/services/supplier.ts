import { api } from '@/lib/api';
import { Supplier, CreateSupplierDto } from '../types/supplier';

export const supplierService = {
    getAll: async (): Promise<Supplier[]> => {
        return api.get('/suppliers');
    },

    getActive: async (): Promise<Supplier[]> => {
        return api.get('/suppliers/active');
    },

    getById: async (id: number): Promise<Supplier> => {
        return api.get(`/suppliers/${id}`);
    },

    create: async (data: CreateSupplierDto): Promise<Supplier> => {
        return api.post('/suppliers', data);
    },

    update: async (id: number, data: Partial<CreateSupplierDto>): Promise<Supplier> => {
        return api.put(`/suppliers/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        return api.delete(`/suppliers/${id}`);
    }
};
