import { api } from '@/lib/api';

export interface Customer {
    id: number;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    taxCode?: string;
    note?: string;
    totalOrders?: number;
    totalSpent?: number;
    lastVisit?: string;
}

export const mapCustomer = (raw: any): Customer => ({
    id: raw.id || raw.ID,
    fullName: raw.fullName || raw.name || raw.hoTen || raw.HoTen || '',
    phone: raw.phone || raw.phoneNumber || raw.soDienThoai || raw.SoDienThoai || '',
    email: raw.email || raw.Email || '',
    address: raw.address || raw.DiaChi || raw.diaChi || '',
    taxCode: raw.taxCode || raw.MaSoThue || raw.maSoThue || '',
    note: raw.note || raw.GhiChu || raw.ghiChu || '',
    totalOrders: raw.totalOrders || raw.TongDonHang || raw.tongDonHang || 0,
    totalSpent: Number(raw.totalSpent || raw.TongChiTieu || raw.tongChiTieu || 0),
    lastVisit: raw.lastVisit || raw.NgayGheThamCuoi || raw.ngayGheThamCuoi || raw.updatedAt || null
});

export const customerService = {
    // Admin APIs
    getCustomers: async (filters: any = {}): Promise<Customer[]> => {
        const params = new URLSearchParams(filters).toString();
        const res = await api.get(`/sale/customers?${params}`);
        return (Array.isArray(res) ? res : []).map(mapCustomer);
    },

    getCustomerDetail: async (id: string | number): Promise<Customer> => {
        const res = await api.get(`/sale/customers/${id}`);
        return mapCustomer(res);
    },

    createCustomer: async (data: any) => {
        return api.post('/sale/customers', data);
    },

    updateCustomer: async (id: number, data: any) => {
        return api.patch(`/sale/customers/${id}`, data);
    },

    // Customer-facing APIs
    getMyOrders: async () => {
        return api.get('/customer/orders');
    },

    getCustomerOrderDetails: async (orderId: number) => {
        return api.get(`/customer/orders/${orderId}`);
    },

    approveQuote: async (orderId: number) => {
        return api.post(`/customer/orders/${orderId}/approve`, {});
    },

    rejectQuote: async (orderId: number, reason: string) => {
        return api.post(`/customer/orders/${orderId}/reject`, { reason });
    },

    requestRevision: async (orderId: number, note: string) => {
        return api.post(`/customer/orders/${orderId}/request-revision`, { note });
    },
    createBooking: async (data: { bienSoXe: string; ghiChu?: string | null; selectedServiceIds?: any[] }) => {
        return api.post('/customer/booking', {
            ...data,
            modelXe: null,
            ngayHen: null,
        });
    },
    getWarrantyItems: async () => {
        return api.get('/customer/warranty');
    },
    claimWarranty: async (data: { orderId: number; itemIds: number[]; currentOdo?: number | null }) => {
        return api.post('/customer/warranty-claim', data);
    },
    register: async (data: any) => {
        return api.post('/public/customer/register', data);
    },
    verifyRegistration: async (data: { email: string; code: string }) => {
        return api.post('/public/customer/verify-registration', data);
    }
};
