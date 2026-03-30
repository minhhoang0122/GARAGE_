import { api } from '@/lib/api';

export interface Reception {
    id: number;
    code: string;
    plate: string;
    customerName: string;
    customerPhone: string;
    advisorName: string;
    status: string;
    createdAt: string;
    vehicleBrand: string;
    vehicleModel: string;
    odometer?: number;
    notes?: string;
    
    // Standardized UI fields
    images?: string[];
    orderId?: number;
    orderStatus?: string;
    
    // UI compatibility fields (Legacy)
    tenKhach?: string;
    sdtKhach?: string;
    diaChiKhach?: string;
    ngayGio?: string;
    bienSo?: string;
    nhanHieu?: string;
    model?: string;
    odo?: number;
    mucXang?: number;
    tinhTrangVoXe?: string;
    yeuCauSoBo?: string;
    hinhAnh?: string;
    DonHangSuaChua?: {
        ID?: number;
        TrangThai?: string;
    };
}

export const mapReception = (raw: any): Reception => {
    const imagesRaw = raw.hinhAnh || raw.HinhAnh || '';
    const images = typeof imagesRaw === 'string' ? imagesRaw.split(',').filter(Boolean) : (Array.isArray(imagesRaw) ? imagesRaw : []);
    const order = raw.DonHangSuaChua || raw.donHangSuaChua || undefined;

    return {
        id: raw.id || raw.ID || 0,
        code: raw.MaPhieu || raw.code || '',
        plate: raw.xeBienSo || raw.BienSo || raw.XeBienSo || raw.plate || '',
        customerName: raw.customerName || raw.KhachHang?.fullName || raw.KhachHangName || raw.KhachHang?.HoTen || '',
        customerPhone: raw.customerPhone || raw.KhachHang?.phone || raw.KhachHangPhone || raw.KhachHang?.SoDienThoai || '',
        advisorName: raw.advisorName || raw.CoVan?.fullName || raw.CoVanDichVuName || raw.CoVan?.HoTen || '',
        status: raw.status || raw.trangThai || raw.TrangThai || 'NEW',
        createdAt: raw.createdAt || raw.ngayGio || raw.NgayTao || new Date().toISOString(),
        vehicleBrand: raw.vehicleBrand || raw.XeNhanHieu || raw.xe?.nhanHieu || raw.Xe?.NhanHieu || '',
        vehicleModel: raw.vehicleModel || raw.XeModel || raw.xe?.model || raw.Xe?.Model || '',
        odometer: raw.odo || raw.SoKm || 0,
        notes: raw.yeuCauSoBo || raw.GhiChu || '',
        
        // New Standardized Fields
        images,
        orderId: order?.ID || order?.id,
        orderStatus: order?.TrangThai || order?.status,

        // UI Mappings (Legacy support)
        tenKhach: raw.tenKhach || raw.customerName || raw.KhachHang?.fullName || raw.KhachHangName || raw.KhachHang?.HoTen || '',
        sdtKhach: raw.sdtKhach || raw.customerPhone || raw.KhachHang?.phone || raw.KhachHangPhone || raw.KhachHang?.SoDienThoai || '',
        diaChiKhach: raw.diaChiKhach || raw.KhachHang?.address || raw.KhachHang?.DiaChi || '',
        ngayGio: raw.ngayGio || raw.NgayTao || raw.createdAt || new Date().toISOString(),
        bienSo: raw.xeBienSo || raw.BienSo || raw.XeBienSo || '',
        nhanHieu: raw.xe?.nhanHieu || raw.Xe?.NhanHieu || '',
        model: raw.xe?.model || raw.Xe?.Model || '',
        odo: raw.odo || raw.SoKm || 0,
        mucXang: raw.mucXang || 0,
        tinhTrangVoXe: raw.tinhTrangVoXe || raw.TinhTrangVo || 'Bình thường',
        yeuCauSoBo: raw.yeuCauSoBo || raw.YeuCauKhach || '',
        hinhAnh: imagesRaw,
        DonHangSuaChua: order
    };
};

export const receptionService = {
    getReceptions: async (filters: any = {}, token?: string): Promise<Reception[]> => {
        const params = new URLSearchParams(filters).toString();
        const res = await api.get(`/reception?${params}`, token);
        return (Array.isArray(res) ? res : []).map(mapReception);
    },

    getReceptionDetail: async (id: string | number, token?: string): Promise<Reception> => {
        const res = await api.get(`/reception/${id}`, token);
        return mapReception(res);
    },

    createReception: async (data: any) => {
        return api.post('/reception', data);
    },

    updateReception: async (id: number, data: any) => {
        return api.patch(`/reception/${id}`, data);
    },

    updateStatus: async (id: number, status: string) => {
        return api.patch(`/reception/${id}/status`, { status });
    },

    searchVehicle: async (plate: string) => {
        return api.get(`/reception/vehicle?plate=${encodeURIComponent(plate)}`);
    },

    getTimeline: async (receptionId: number): Promise<any[]> => {
        return api.get(`/reception/${receptionId}/timeline`);
    },

    addTimelineNote: async (receptionId: number, content: string, isInternal: boolean = false) => {
        return api.post(`/reception/${receptionId}/timeline/note`, { content, isInternal });
    }
};
