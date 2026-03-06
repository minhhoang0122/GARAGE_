import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

// Types
export type PaymentMethod = 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'HON_HOP';

export type PaymentSummary = {
    orderId: number;
    plate: string;
    customerName: string;
    customerPhone: string;
    grandTotal: number;
    amountPaid: number;
    debt: number;
    paymentMethod: PaymentMethod | null;
    paymentDate: Date | null;
    status: string;
    items: {
        id: number;
        name: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        total: number;
        isService: boolean;
    }[];
};

// 1. Get Payment Summary
export async function getPaymentSummary(orderId: number): Promise<PaymentSummary | null> {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return null;

        const res = await api.get(`/payment/${orderId}`, token);
        return res;
    } catch (e) {
        return null;
    }
}

// 2. Process Payment
export async function processPayment(
    orderId: number,
    amount: number,
    method: PaymentMethod
): Promise<{ success: boolean; error?: string; isCompleted?: boolean; debt?: number }> {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;

        if (!session?.user || !token) {
            return { success: false, error: 'Chưa đăng nhập' };
        }

        await api.post(`/payment/${orderId}/process`, { amount, method }, token);

        revalidatePath(`/sale/orders/${orderId}`);
        revalidatePath('/sale');

        // Check if fully paid? The API returns void but logic handles status.
        // Frontend might need to know if completed.
        // We can refetch or just assume success updates status.
        return {
            success: true,
            // isCompleted: ... // logic hidden, let UI refetch status
        };
    } catch (error: any) {
        return { success: false, error: error.message || 'Lỗi xử lý thanh toán' };
    }
}

// 3. Get Orders Waiting for Payment
// Need Backend API for this list.
// RepairOrderRepository.findOrdersAwaitingPayment() exists.
// Need to expose it?
// We can use the generic Job endpoint for Payment role?
// Or add `/api/payment/pending`.
// Current Controller doesn't have it.
// I will add it to Controller momentarily.
// For now, let's stub it or use a separate call if I add it.
export async function getOrdersWaitingPayment() {
    // Calling a new endpoint I should add.
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return [];
        // Pending endpoint...
        // Let's assume I add it.
        // const res = await api.get('/payment/pending', token);
        // return res;
        return [];
    } catch (e) { return []; }
}

function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

