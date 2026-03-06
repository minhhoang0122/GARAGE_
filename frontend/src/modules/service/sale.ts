'use server';

import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createCustomer(formData: {
    hoTen: string;
    soDienThoai: string;
    email?: string;
    diaChi?: string;
}) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return { success: false, error: 'Chưa đăng nhập' };

        await api.post('/sale/customers', formData, token);
        revalidatePath('/sale/customers');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || 'Lỗi khi tạo khách hàng' };
    }
}
