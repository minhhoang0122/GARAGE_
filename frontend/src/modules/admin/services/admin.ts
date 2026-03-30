import { api } from '@/lib/api';

export type Product = {
    id: number;
    code: string;
    maHang: string;
    name: string;
    tenHang: string;
    description: string;
    giaBanNiemYet: number;
    giaVon: number;
    laDichVu: boolean;
    baoHanhSoThang: number;
    baoHanhKm: number;
    soLuongTon: number;
};

export const adminService = {
    getProducts: async (): Promise<Product[]> => {
        const res = await api.get('/products');
        return res.map((p: any) => ({
            id: p.id,
            code: p.sku || p.maHang,
            maHang: p.sku || p.maHang,
            name: p.name || p.tenHang,
            tenHang: p.name || p.tenHang,
            description: p.description,
            giaBanNiemYet: p.retailPrice ?? p.giaBanNiemYet ?? 0,
            giaVon: p.costPrice ?? p.giaVon ?? 0,
            laDichVu: !!(p.isService ?? p.laDichVu),
            baoHanhSoThang: p.warrantyMonths ?? p.baoHanhSoThang ?? 0,
            baoHanhKm: p.warrantyKm ?? p.baoHanhKm ?? 0,
            soLuongTon: p.stockQuantity ?? p.soLuongTon ?? 0
        }));
    },

    batchUpdateProducts: async (items: any[]) => {
        return await api.post('/products/batch-update', items);
    },

    createProduct: async (data: any) => {
        return await api.post('/products', data);
    },

    getConfigs: async (): Promise<Record<string, string>> => {
        return await api.get('/config');
    },

    updateConfigs: async (newConfigs: Record<string, string>) => {
        return await api.post('/config', newConfigs);
    }
};
