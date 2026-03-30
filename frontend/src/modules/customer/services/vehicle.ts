import { api } from '@/lib/api';

export interface Vehicle {
    id: number;
    plate: string;
    brand: string;
    model: string;
    vin?: string;
    engineNumber?: string;
    color?: string;
    year?: number;
    customerId: number;
    customerName?: string;
}

export const mapVehicle = (raw: any): Vehicle => ({
    id: raw.id || raw.ID,
    plate: raw.plateNumber || raw.plate || raw.BienSo || '',
    brand: raw.brand || raw.NhanHieu || '',
    model: raw.model || raw.Model || '',
    vin: raw.vin || raw.SoKhung || '',
    engineNumber: raw.engineNumber || raw.SoMay || '',
    color: raw.color || raw.MauXe || '',
    year: raw.year || raw.NamSanXuat || 0,
    customerId: raw.customerId || raw.KhachHangId || (raw.KhachHang?.id) || 0,
    customerName: raw.customerName || raw.KhachHang?.fullName || raw.KhachHang?.HoTen || ''
});

export const vehicleService = {
    getVehicles: async (filters: any = {}): Promise<Vehicle[]> => {
        const params = new URLSearchParams(filters).toString();
        const res = await api.get(`/vehicles?${params}`);
        return (Array.isArray(res) ? res : []).map(mapVehicle);
    },

    getVehicleDetail: async (id: string | number): Promise<Vehicle> => {
        const res = await api.get(`/vehicles/${id}`);
        return mapVehicle(res);
    },

    searchVehicle: async (plate: string) => {
        return api.get(`/reception/vehicle?plate=${plate}`);
    },

    createVehicle: async (data: any) => {
        return api.post('/vehicles', data);
    },

    updateVehicle: async (id: number, data: any) => {
        return api.patch(`/vehicles/${id}`, data);
    }
};
