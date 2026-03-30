import { api } from '@/lib/api';

export interface TransactionStats {
    currentBalance: number;
    totalRevenueThisMonth: number;
    totalRefundThisMonth: number;
}

export interface Transaction {
    id: number;
    amount: number;
    type: 'DEPOSIT' | 'PAYMENT' | 'REFUND';
    method: 'CASH' | 'TRANSFER' | 'CARD';
    referenceCode: string;
    note: string;
    createdAt: string;
    createdBy: string;
}

export interface Debtor {
    customerId: number;
    customerName: string;
    phoneNumber: string;
    totalDebt: number;
    orderCount: number;
}

export type PaymentMethod = 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'HON_HOP';

export interface PaymentSummary {
    orderId: number;
    plate: string;
    customerName: string;
    customerPhone: string;
    grandTotal: number;
    amountPaid: number;
    debt: number;
    paymentMethod: PaymentMethod | null;
    paymentDate: string | null;
    status: string;
    items: any[];
}

export const mapTransactionStats = (raw: any): TransactionStats => ({
    currentBalance: Number(raw.currentBalance ?? raw.soDuHienTai ?? 0),
    totalRevenueThisMonth: Number(raw.totalRevenueThisMonth ?? raw.tongThuThangNay ?? 0),
    totalRefundThisMonth: Number(raw.totalRefundThisMonth ?? raw.tongChiThangNay ?? 0)
});

export const mapTransaction = (raw: any): Transaction => ({
    id: raw.id || raw.ID,
    amount: Number(raw.amount ?? raw.soTien ?? 0),
    type: raw.type || raw.loaiGiaoDich || 'PAYMENT',
    method: raw.method || raw.phuongThuc || 'CASH',
    referenceCode: raw.referenceCode || raw.maThamChieu || '',
    note: raw.note || raw.ghiChu || '',
    createdAt: raw.createdAt || raw.ngayTao || new Date().toISOString(),
    createdBy: raw.createdBy || raw.nguoiTao || ''
});

export const mapDebtor = (raw: any): Debtor => ({
    customerId: raw.customerId || raw.maKhachHang || 0,
    customerName: raw.customerName || raw.fullName || raw.hoTen || raw.HoTen || '',
    phoneNumber: raw.phoneNumber || raw.phone || raw.soDienThoai || '',
    totalDebt: Number(raw.totalDebt ?? raw.tongNo ?? 0),
    orderCount: Number(raw.orderCount ?? raw.soDonHang ?? 0)
});

export const mapPaymentSummary = (raw: any): PaymentSummary => ({
    orderId: raw.orderId || raw.id || raw.ID || 0,
    plate: raw.plate || raw.plateNumber || raw.xeBienSo || '',
    customerName: raw.customerName || raw.customer?.fullName || raw.hoTen || raw.HoTen || '',
    customerPhone: raw.customerPhone || raw.customer?.phone || raw.soDienThoai || '',
    grandTotal: Number(raw.grandTotal ?? raw.totalAmount ?? raw.tongCong ?? 0),
    amountPaid: Number(raw.paidAmount ?? raw.amountPaid ?? raw.daThanhToan ?? 0),
    debt: Number(raw.debt ?? raw.remainingAmount ?? raw.conNo ?? 0),
    paymentMethod: raw.paymentMethod || raw.method || raw.phuongThucThanhToan || null,
    paymentDate: raw.paymentDate || raw.paidAt || raw.ngayThanhToan || null,
    status: raw.status || raw.trangThai || 'PENDING',
    items: raw.items || []
});

export const financeService = {
    getStats: async (token?: string): Promise<TransactionStats> => {
        const res = await api.get('/transactions/stats', token);
        return mapTransactionStats(res);
    },

    getRecentTransactions: async (): Promise<Transaction[]> => {
        const res = await api.get('/transactions/recent');
        return (Array.isArray(res) ? res : []).map(mapTransaction);
    },

    getDebts: async (): Promise<Debtor[]> => {
        const res = await api.get('/debts');
        return (Array.isArray(res) ? res : []).map(mapDebtor);
    },

    getPaymentsByOrder: async (orderId: number, token?: string): Promise<Transaction[]> => {
        const res = await api.get(`/transactions/order/${orderId}`, token);
        return (Array.isArray(res) ? res : []).map(mapTransaction);
    },

    getPaymentSummary: async (orderId: number): Promise<PaymentSummary> => {
        const res = await api.get(`/payment/${orderId}`);
        return mapPaymentSummary(res);
    },

    createTransaction: async (data: any) => {
        return api.post('/transactions', data);
    },

    processPayment: async (orderId: number, data: { amount: number; method: PaymentMethod }) => {
        return api.post(`/payment/${orderId}/process`, data);
    }
};
