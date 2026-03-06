'use server';

import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createTransaction(data: {
    orderId: number;
    amount: number;
    type: string;
    method: string;
    note?: string;
    referenceCode?: string;
}) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        await api.post('/transactions', data, token);
        revalidatePath(`/sale/orders/${data.orderId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Lỗi tạo giao dịch' };
    }
}

export async function getTransactions(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        const res = await api.get(`/transactions/order/${orderId}`, token);
        return res;
    } catch (error) {
        return [];
    }
}
