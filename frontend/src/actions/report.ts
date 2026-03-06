'use server';

import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

export async function getRevenueReport(from: string, to: string) {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    if (!token) return null;

    try {
        return await api.get(`/reports/revenue?from=${from}&to=${to}`, token);
    } catch (error) {
        console.error('Fetch revenue error', error);
        return null;
    }
}

export async function getMechanicPerformance(from: string, to: string) {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    if (!token) return [];

    try {
        return await api.get(`/reports/mechanic-performance?from=${from}&to=${to}`, token);
    } catch (error) {
        console.error('Fetch mechanic performance error', error);
        return [];
    }
}

export async function getInventoryReport() {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    if (!token) return null;

    try {
        return await api.get('/reports/inventory', token);
    } catch (error) {
        console.error('Fetch inventory report error', error);
        return null;
    }
}
