import { api } from '@/lib/api';
import { normalizePersonnel, formatFullName } from '@/lib/utils';
import { mapReception, Reception } from '../../reception/services/reception';

export interface OrderDetailItem {
    id: number;
    productId: number;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    total: number;
    itemStatus: string;
    isService: boolean;
    stock: number;
    version: number;
    unit?: string;
    proposedByName: string;
    proposedByRole: string;
    warrantyMonths: number;
    warrantyKm: number;
}

export interface OrderDetail {
    id: number;
    MaDonHang: string;
    createdAt: string;
    plate: string;
    plateNumber: string;
    vehicleBrand: string;
    vehicleModel: string;
    customerName: string;
    customerPhone: string;
    saleName: string;
    status: string;
    paymentStatus: string;
    grandTotal: number;
    totalAmount: number;
    total: number;
    discount: number;
    finalAmount: number;
    paidAmount: number;
    depositAmount: number;
    amountPaid: number;
    debt: number;
    odo: number;
    receptionOdo: number;
    subTime: string;
    items: OrderDetailItem[];
    totalParts: number;
    totalLabor: number;
    totalDiscount: number;
    vat: number;
    vatPercent: number;
    imageUrl: string[];
    thoChanDoanId?: number;
    thoChanDoanName?: string;
    saleAvatar?: string;
    foremanAvatar?: string;
    nguoiPhuTrachId?: number;
    receptionId?: number;
}

export interface SaleStats {
    countWaiting: number;
    countPendingQuotes: number;
    countPendingPayment: number;
    countWarranty: number;
    waitingVehicles: Reception[];
    recentOrders: OrderDetail[];
}

export const mapOrder = (raw: any): OrderDetail => {
    const total = Number(raw.grandTotal || raw.tongCong || raw.TongTien || 0);
    const discount = Number(raw.discount || raw.chietKhauTong || 0);
    const final = total - discount;

    // Chuẩn hóa nhân sự - Tìm kiếm linh hoạt trong nhiều trường tiềm năng
    const sale = normalizePersonnel(
        raw.nguoiPhuTrach || 
        raw.Sale || 
        raw.sale || 
        raw.NguoiPhuTrach || 
        raw.NhanVien || 
        raw.staff || 
        raw.User
    );
    
    const foreman = normalizePersonnel(
        raw.thoChanDoan || 
        raw.ThoChanDoan || 
        raw.Foreman || 
        raw.foreman || 
        raw.KyThuat || 
        raw.phieuTiepNhan?.thoChanDoan
    );

    const customerRawName = raw.customerName || raw.phieuTiepNhan?.xe?.khachHang?.fullName || raw.KhachHang?.fullName || raw.phieuTiepNhan?.xe?.khachHang?.hoTen || raw.KhachHang?.HoTen || '';

    return {
        id: raw.id || raw.ID || 0,
        MaDonHang: raw.id ? `DH${String(raw.id).padStart(5, '0')}` : (raw.MaDonHang || ''), 
        createdAt: raw.createdAt || raw.ngayTao || raw.NgayTao || new Date().toISOString(),
        plate: raw.plateNumber || raw.plate || raw.phieuTiepNhan?.xeBienSo || raw.Xe?.BienSo || '',
        plateNumber: raw.plateNumber || raw.plate || raw.phieuTiepNhan?.xeBienSo || raw.Xe?.BienSo || '',
        vehicleBrand: raw.vehicleBrand || raw.carBrand || raw.phieuTiepNhan?.xe?.nhanHieu || raw.Xe?.NhanHieu || '',
        vehicleModel: raw.vehicleModel || raw.carModel || raw.phieuTiepNhan?.xe?.model || raw.Xe?.Model || '',
        customerName: formatFullName(customerRawName),
        customerPhone: raw.customerPhone || raw.phieuTiepNhan?.xe?.khachHang?.phone || raw.KhachHang?.phone || raw.phieuTiepNhan?.xe?.khachHang?.soDienThoai || raw.KhachHang?.SoDienThoai || '',
        saleName: raw.advisorName || sale.name || raw.saleName || 'Chưa phân phối',
        status: raw.status || raw.trangThai || raw.TrangThai || 'TIEP_NHAN',
        paymentStatus: raw.paymentStatus || raw.TrangThaiThanhToan || (Number(raw.soTienDaTra || 0) >= total ? 'PAID' : 'UNPAID'),
        grandTotal: total,
        totalAmount: total,
        total: total,
        discount: discount,
        finalAmount: final,
        paidAmount: Number(raw.paidAmount || raw.soTienDaTra || raw.DaThanhToan || 0),
        amountPaid: Number(raw.paidAmount || raw.soTienDaTra || raw.DaThanhToan || 0),
        depositAmount: Number(raw.depositAmount || raw.tienCoc || raw.TamUng || 0),
        debt: Number(raw.debt || raw.congNo || raw.ConNo || 0),
        odo: raw.odo || raw.phieuTiepNhan?.odo || raw.SoKm || 0,
        receptionOdo: raw.receptionOdo || raw.phieuTiepNhan?.odo || raw.SoKmTiepNhan || 0,
        subTime: raw.createdAt || raw.ngayTao || raw.subTime || raw.NgayTao || new Date().toISOString(),
        items: (raw.items || raw.chiTietDonHang || []).map((i: any) => ({
            id: i.id || i.ID,
            productId: i.productId || i.phuTungId || i.dichVuId || i.PhuTungID || i.DichVuID,
            productCode: i.productCode || i.sku || i.phuTung?.maPhuTung || i.dichVu?.maDichVu || '',
            productName: i.productName || i.name || i.phuTung?.tenPhuTung || i.dichVu?.tenDichVu || '',
            quantity: i.quantity || i.soLuong || 0,
            unitPrice: i.unitPrice || i.donGia || 0,
            discountPercent: i.discountPercent || i.phanTramGiamGia || 0,
            total: i.total || i.thanhTien || 0,
            itemStatus: i.itemStatus || i.trangThai || 'PENDING',
            isService: !!(i.isService || i.type === 'SERVICE' || i.dichVuId || i.DichVuID || i.is_service),
            stock: i.stock || i.stockQuantity || i.phuTung?.soLuongTon || 0,
            version: i.version || i.Version || 1,
            unit: i.unit || i.dvt || (!!(i.isService || i.type === 'SERVICE' || i.dichVuId || i.DichVuID) ? 'Lần' : 'Bộ'),
            proposedByName: i.proposedByName || i.nguoiDeXuat?.fullName || i.nguoiDeXuat?.hoTen || '',
            proposedByRole: i.proposedByRole || i.nguoiDeXuat?.chucVu || '',
            warrantyMonths: i.warrantyMonths || 0,
            warrantyKm: i.warrantyKm || 0
        })),
        totalParts: Number(raw.totalParts || raw.tongTienHang || raw.TongTienPhuTung || 0),
        totalLabor: Number(raw.totalLabor || raw.tongTienCong || raw.TongTienCong || 0),
        totalDiscount: Number(raw.totalDiscount || raw.chietKhauTong || raw.TongGiamGia || 0),
        vat: Number(raw.vat || raw.thueVAT || raw.TienThue || 0),
        vatPercent: Number(raw.vatPercent || raw.vatPhanTram || raw.PhanTramThue || 0),
        imageUrl: raw.imageUrl || raw.hinhAnh || raw.HinhAnh || [],
        thoChanDoanId: raw.foremanId || foreman.id || raw.thoChanDoanId || raw.ThoChanDoanID,
        thoChanDoanName: raw.foremanName || foreman.name || raw.thoChanDoanName || '',
        saleAvatar: raw.advisorAvatar || sale.avatar,
        foremanAvatar: raw.foremanAvatar || foreman.avatar,
        nguoiPhuTrachId: raw.advisorId || sale.id || raw.nguoiPhuTrachId || raw.NguoiPhuTrachID,
        receptionId: raw.receptionId || raw.phieuTiepNhan?.id
    };
};

export const saleService = {
    getStats: async (token?: string): Promise<SaleStats> => {
        try {
            const res = await api.get('/sale/stats', token);
            return {
                countWaiting: Number(res.countWaiting || 0),
                countPendingQuotes: Number(res.countPendingQuotes || 0),
                countPendingPayment: Number(res.countPendingPayment || 0),
                countWarranty: Number(res.countWarranty || 0),
                waitingVehicles: (res.waitingVehicles || []).map(mapReception),
                recentOrders: (res.recentOrders || []).map(mapOrder)
            };
        } catch (error) {
            console.error("Failed to fetch sale stats:", error);
            return {
                countWaiting: 0,
                countPendingQuotes: 0,
                countPendingPayment: 0,
                countWarranty: 0,
                waitingVehicles: [],
                recentOrders: []
            };
        }
    },

    getOrders: async (filters: any = {}, token?: string): Promise<OrderDetail[]> => {
        const params = new URLSearchParams(filters).toString();
        const res = await api.get(`/sale/orders?${params}`, token);
        return (Array.isArray(res) ? res : []).map(mapOrder);
    },

    getOrderDetail: async (id: string | number, token?: string): Promise<OrderDetail> => {
        const res = await api.get(`/sale/orders/${id}`, token);
        return mapOrder(res);
    },

    addItem: async (orderId: number, productId: number, quantity: number = 1) => {
        return api.post(`/sale/orders/${orderId}/items`, { productId, quantity });
    },

    updateItem: async (itemId: number, data: { quantity?: number; discountPercent?: number; version?: number }) => {
        return api.patch(`/sale/items/${itemId}`, data);
    },

    removeItem: async (itemId: number) => {
        return api.delete(`/sale/items/${itemId}`);
    },

    submitQuote: async (orderId: number) => {
        return api.post(`/sale/orders/${orderId}/submit`);
    },

    finalize: async (orderId: number) => {
        return api.post(`/sale/orders/${orderId}/finalize`);
    },

    cancel: async (orderId: number, reason: string) => {
        return api.post(`/sale/orders/${orderId}/cancel`, { reason });
    },

    claim: async (orderId: number) => {
        return api.post(`/sale/orders/${orderId}/claim`);
    },

    approveQuote: async (id: string | number) => {
        return api.post(`/customer/orders/${id}/approve`);
    },

    rejectQuote: async (id: string | number, reason: string) => {
        return api.post(`/customer/orders/${id}/reject`, { reason });
    },

    requestRevision: async (id: string | number, note: string) => {
        return api.post(`/customer/orders/${id}/request-revision`, { note });
    },

    updateItemStatus: async (itemId: number, status: string, token?: string) => {
        return api.patch(`/sale/items/${itemId}/status`, { status }, token);
    },

    close: async (orderId: number) => {
        return api.post(`/sale/orders/${orderId}/close`);
    },

    submitReplenishmentQuote: async (orderId: number) => {
        return api.post(`/sale/orders/${orderId}/submit-replenishment`);
    },

    searchProducts: async (keyword: string): Promise<any[]> => {
        const res = await api.get(`/sale/products?search=${encodeURIComponent(keyword)}`);
        return (Array.isArray(res) ? res : []).map((p: any) => ({
            id: p.id || p.ID,
            code: p.sku || p.code || p.MaHang || '',
            name: p.name || p.TenHang || '',
            price: Number(p.retailPrice ?? p.price ?? p.GiaBanNiemYet ?? 0),
            costPrice: Number(p.costPrice ?? p.costPrice ?? p.GiaVon ?? 0),
            isService: !!(p.isService ?? p.is_service ?? p.LaDichVu),
            stock: Number(p.stockQuantity ?? p.stock ?? p.SoLuongTon ?? 0)
        }));
    },

    createProduct: async (data: any) => {
        return api.post('/products', data);
    },

    updateOrderTotals: async (orderId: number, data: { discount?: number, vatPercent?: number }) => {
        return api.patch(`/sale/orders/${orderId}/totals`, data);
    },

    createOrderFromReception: async (receptionId: number) => {
        return api.post('/sale/orders', { receptionId });
    },

    createWarranty: async (orderId: number, itemIds: number[], odo: number) => {
        return api.post(`/sale/orders/${orderId}/warranty`, { itemIds, odo });
    }
};
