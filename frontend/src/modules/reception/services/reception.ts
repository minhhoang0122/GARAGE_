import { api } from '@/lib/api';
import { normalizePersonnel, formatFullName } from '@/lib/utils';

export interface Reception {
    id: number;
    code: string;
    plate: string;
    customerName: string;
    customerPhone: string;
    advisorId?: number;
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
    thoChanDoanId?: number;
    thoChanDoanName?: string;
    advisorAvatar?: string;
    foremanAvatar?: string;
    
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

    // Chuẩn hóa nhân sự - Thử nghiệm nhiều key khác nhau từ API
    const advisor = normalizePersonnel(
        raw.CoVan || 
        raw.advisor || 
        raw.CoVanDichVu || 
        raw.NguoiTiepNhan || 
        raw.Staff || 
        raw.User || 
        raw.staff
    );
    
    // Quản đốc - Thử từ raw hoặc từ đơn hàng liên quan
    const foreman = normalizePersonnel(
        raw.thoChanDoan || 
        raw.ThoChanDoan || 
        raw.Foreman || 
        raw.foreman || 
        order?.ThoChanDoan || 
        order?.thoChanDoan ||
        order?.Foreman
    );

    const customerRawName = 
        raw.customerName || 
        raw.khachHangName || 
        raw.KhachHangName || 
        (raw.KhachHang ? `${raw.KhachHang.LastName || ''} ${raw.KhachHang.FirstName || ''}`.trim() : '') || 
        raw.KhachHang?.HoTen || 
        raw.TenKhachHang || 
        raw.KhachHang_Name || 
        raw.fullName || 
        '';

    return {
        id: raw.id || raw.ID || 0,
        code: raw.MaPhieu || raw.code || '',
        plate: raw.plate || raw.Xe?.BienSo || raw.xeBienSo || raw.BienSo || raw.XeBienSo || '',
        customerName: formatFullName(customerRawName),
        customerPhone: raw.customerPhone || raw.khachHangPhone || raw.KhachHang?.Phone || raw.KhachHang?.SoDienThoai || '',
        advisorId: raw.receptionistId || advisor.id || raw.advisorId || raw.CoVanDichVuID || raw.CoVanID || order?.CoVanDichVuID || 0,
        advisorName: raw.receptionistName || advisor.name || raw.advisorName || raw.CoVanDichVuName || 'Chưa phân phối',
        status: raw.status || (order ? order.Status : 'RECEIVED') || 'RECEIVED',
        createdAt: raw.createdAt || raw.CreatedAt || raw.ngayGio || raw.NgayTao || new Date().toISOString(),
        vehicleBrand: raw.xeNhanHieu || raw.vehicleBrand || raw.Xe?.HangXe || raw.XeNhanHieu || raw.xe?.nhanHieu || '',
        vehicleModel: raw.xeModel || raw.vehicleModel || raw.Xe?.MauXe || raw.XeModel || raw.xe?.model || '',
        odometer: raw.odo || raw.SoKm || 0,
        notes: raw.yeuCauSoBo || raw.GhiChu || '',
        
        // New Standardized Fields
        images,
        orderId: raw.orderId || order?.ID || order?.id,
        orderStatus: raw.trangThai || order?.Status || order?.TrangThai || order?.status || 'RECEIVED',
        thoChanDoanId: foreman.id || raw.thoChanDoanId || raw.ThoChanDoanID || order?.ThoChanDoanID,
        thoChanDoanName: foreman.name || raw.thoChanDoanName || '',
        advisorAvatar: raw.receptionistAvatar || advisor.avatar,
        foremanAvatar: foreman.avatar,

        // UI Mappings (Legacy support)
        tenKhach: formatFullName(customerRawName),
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
