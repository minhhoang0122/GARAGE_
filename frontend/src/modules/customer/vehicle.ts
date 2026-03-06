'use server';


import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export type VehicleSearchResult = {
    exists: boolean;
    vehicle?: any;
    customer?: any;
    history?: any[];
    activeWarrantyCount: number;
};

// Tìm kiếm xe theo biển số
export async function searchVehicle(plate: string): Promise<VehicleSearchResult> {
    if (!plate || plate.length < 3) return { exists: false, activeWarrantyCount: 0 };

    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        // This is a public search mostly, but we use token if available for security context
        // Or if backend requires auth for search. Assuming it does.
        if (!token) return { exists: false, activeWarrantyCount: 0 };

        const res = await api.get(`/reception/vehicle?plate=${plate}`, token);
        return res;
    } catch (e) {
        return { exists: false, activeWarrantyCount: 0 };
    }
}

export type ReceptionFormData = {
    // Thông tin xe (dùng cho cả xe mới và cũ)
    bienSo: string;
    odo: number;

    // Thông tin xe mới (chỉ dùng khi xe chưa tồn tại)
    loaiXe?: string;
    nhanHieu?: string;
    model?: string;
    soKhung?: string;
    soMay?: string;

    // Thông tin khách hàng (chỉ dùng khi xe chưa tồn tại)
    tenKhach?: string;
    sdtKhach?: string;
    diaChiKhach?: string;
    emailKhach?: string;

    // Thông tin tiếp nhận
    mucXang: number;
    tinhTrangVo: string;
    yeuCauKhach: string;
    hinhAnh?: string; // JSON string
};

// Tạo phiếu tiếp nhận (và tạo xe/khách nếu mới)
export async function createReception(data: ReceptionFormData) {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;

    if (!session?.user || !token) {
        return { success: false, error: 'Unauthorized' }; // Don't throw to avoid crash UI
    }

    try {
        const res = await api.post('/reception', data, token);

        // Revalidate dashboard sale
        revalidatePath('/sale');
        revalidatePath('/sale/reception');

        return { success: true, receptionId: res.receptionId, orderId: res.orderId };
    } catch (error: any) {
        console.error('Create reception error:', error);
        return { success: false, error: error.message };
    }
}
