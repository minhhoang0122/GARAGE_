import { api } from '@/lib/api';

export interface Product {
    id: number;
    name: string;
    code: string;
    stock: number;
    price: number;
    costPrice?: number;
    isService: boolean;
    minStock: number;
    unit?: string;
    description?: string;
    categoryId?: number;
    categoryName?: string;
}

export interface WarehouseStats {
    pendingOrders: number;
    lowStockItems: number;
    recentExports: number;
    recentImports: number;
}

export interface ExportOrder {
    id: number;
    status: string;
    plate: string;
    customerName: string;
    customerPhone?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    createdAt: string;
    itemCount: number;
    totalValue: number;
    hasExported: boolean;
    items?: any[];
}

export interface ImportNote {
    id: number;
    supplierName: string;
    note?: string;
    totalAmount: number;
    createdAt: string;
    items: any[];
}

export const mapWarehouseStats = (raw: any): WarehouseStats => ({
    pendingOrders: Number(raw.pendingOrders || raw.donChoXuat || 0),
    lowStockItems: Number(raw.lowStockItems || raw.phuTungSapHet || 0),
    recentExports: Number(raw.recentExports || raw.donDaXuat || 0),
    recentImports: Number(raw.recentImports || raw.donDaNhap || 0)
});

export const mapProduct = (raw: any): Product => ({
    id: raw.id || raw.ID,
    name: raw.name || raw.tenPhuTung || raw.TenPhuTung || '',
    code: raw.sku || raw.code || raw.maPhuTung || raw.MaPhuTung || '',
    stock: Number(raw.stockQuantity ?? raw.stock ?? raw.tonKho ?? raw.TonKho ?? 0),
    price: Number(raw.retailPrice ?? raw.price ?? raw.donGia ?? Number(raw.DonGia) ?? 0),
    costPrice: Number(raw.costPrice ?? raw.costPrice ?? raw.giaNhap ?? raw.GiaNhap ?? 0),
    isService: !!(raw.isService ?? raw.laDichVu ?? false),
    minStock: Number(raw.minStock ?? raw.tonToiThieu ?? 0),
    unit: raw.unit ?? raw.donViTinh ?? '',
    description: raw.description ?? raw.moTa ?? '',
    categoryId: raw.categoryId ?? raw.maLoai ?? null,
    categoryName: raw.categoryName ?? raw.tenLoai ?? ''
});

export const mapExportOrder = (raw: any): ExportOrder => ({
    id: raw.id || raw.ID,
    status: raw.status || raw.trangThai || raw.TrangThai || 'PENDING',
    plate: raw.plate || raw.plateNumber || raw.xeBienSo || raw.Xe?.BienSo || '',
    customerName: raw.customerName || raw.khachHang?.fullName || raw.khachHang?.hoTen || raw.KhachHang?.HoTen || '',
    customerPhone: raw.customerPhone || raw.khachHang?.phone || raw.khachHang?.soDienThoai || raw.KhachHang?.SoDienThoai || '',
    vehicleBrand: raw.vehicleBrand || raw.xe?.nhanHieu || raw.Xe?.NhanHieu || '',
    vehicleModel: raw.vehicleModel || raw.xe?.model || raw.Xe?.Model || '',
    createdAt: raw.createdAt || raw.ngayTao || raw.NgayTao || new Date().toISOString(),
    itemCount: Number(raw.itemCount || raw.soLuongItem || 0),
    totalValue: Number(raw.totalValue || raw.tongGiaTri || 0),
    hasExported: !!(raw.hasExported || raw.daXuatKho || false),
    items: raw.items || []
});

export const mapImportNote = (raw: any): ImportNote => ({
    id: raw.id || raw.ID,
    supplierName: raw.supplierName || raw.nhaCungCap?.ten || raw.NhaCungCap?.Ten || '',
    note: raw.note || raw.ghiChu || '',
    totalAmount: Number(raw.totalAmount || raw.tongTien || 0),
    createdAt: raw.createdAt || raw.ngayTao || new Date().toISOString(),
    items: (raw.items || []).map((item: any) => ({
        ...item,
        productName: item.product?.name || item.tenPhuTung || '',
        quantity: Number(item.quantity || item.soLuong || 0),
        costPrice: Number(item.costPrice || item.donGia || 0)
    }))
});

export const warehouseService = {
    // --- Stats & Inventory ---
    getStats: async (): Promise<WarehouseStats> => {
        const res = await api.get('/warehouse/stats');
        return mapWarehouseStats(res);
    },

    getInventory: async (search: string = ''): Promise<Product[]> => {
        const res = await api.get(`/warehouse/products?search=${encodeURIComponent(search)}`);
        return (res || []).map(mapProduct).filter((p: Product) => !p.isService);
    },

    getProductDetail: async (id: string | number): Promise<Product> => {
        const res = await api.get(`/warehouse/inventory/product/${id}`);
        return mapProduct(res);
    },

    getLowStockItems: async (): Promise<Product[]> => {
        const products = await api.get('/warehouse/products');
        return (products || [])
            .map(mapProduct)
            .filter((p: Product) => !p.isService && p.stock <= (p.minStock || 10))
            .slice(0, 10);
    },

    // --- Export Logic ---
    getPendingExports: async (): Promise<ExportOrder[]> => {
        const res = await api.get('/warehouse/pending');
        return (Array.isArray(res) ? res : []).map(mapExportOrder);
    },

    getExportDetail: async (orderId: string | number): Promise<ExportOrder> => {
        const res = await api.get(`/warehouse/export/${orderId}`);
        return mapExportOrder(res);
    },

    confirmExport: async (orderId: string | number) => {
        return api.post(`/warehouse/export/${orderId}`, {});
    },

    returnStock: async (orderId: number, data: { productId: number; quantity: number; reason: string }) => {
        return api.post(`/warehouse/return/${orderId}`, data);
    },

    // --- Import Logic ---
    importStock: async (data: {
        supplierName: string;
        note?: string;
        items: {
            productId: number;
            quantity: number;
            costPrice: number;
            vatRate: number;
            updateGlobalPrice?: boolean;
        }[];
    }) => {
        return api.post('/warehouse/import', data);
    },

    // --- Inventory Adjustment ---
    adjustStock: async (data: { productId: number; actualQuantity: number; reason: string }) => {
        return api.post('/inventory-check/adjust', data);
    },

    getInventoryCheckProducts: async (): Promise<any[]> => {
        return api.get('/inventory-check/products');
    },

    // --- Product Management ---
    createProduct: async (data: any) => {
        return api.post('/products', data);
    },

    // --- Batch & Movements ---
    getBatches: async (productId: string | number) => {
        return api.get(`/warehouse/inventory/${productId}/batches`);
    },

    getMovements: async (productId: string | number) => {
        return api.get(`/warehouse/inventory/${productId}/movements`);
    },

    disposeBatch: async (batchId: number) => {
        return api.post(`/warehouse/inventory/batch/${batchId}/dispose`, {});
    },

    // --- Import Detail (For printing) ---
    getImportDetail: async (importId: string | number): Promise<ImportNote> => {
        const res = await api.get(`/warehouse/import/${importId}`);
        return mapImportNote(res);
    },

    // --- Native Export (Standardized) ---
    exportStock: async (data: any) => {
        return api.post('/warehouse/export', data);
    }
};
