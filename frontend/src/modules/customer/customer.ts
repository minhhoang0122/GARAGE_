'use server';

import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Get all orders for the logged-in customer
export async function getMyOrders() {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return [];

        return await api.get('/customer/orders', token);
    } catch (e) {
        console.error('Error fetching customer orders:', e);
        return [];
    }
}

// Get order details
export async function getCustomerOrderDetails(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return null;

        return await api.get(`/customer/orders/${orderId}`, token);
    } catch (e) {
        console.error('Error fetching order details:', e);
        return null;
    }
}

// Approve quote
export async function approveQuote(orderId: number) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return { success: false, error: 'Chưa đăng nhập' };

        await api.post(`/customer/orders/${orderId}/approve`, {}, token);
        revalidatePath('/customer/orders');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Reject quote
export async function rejectQuote(orderId: number, reason: string) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return { success: false, error: 'Chưa đăng nhập' };

        await api.post(`/customer/orders/${orderId}/reject`, { reason }, token);
        revalidatePath('/customer/orders');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Request quote revision
export async function requestRevision(orderId: number, note: string) {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return { success: false, error: 'Chưa đăng nhập' };

        await api.post(`/customer/orders/${orderId}/request-revision`, { note }, token);
        revalidatePath('/customer/orders');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
