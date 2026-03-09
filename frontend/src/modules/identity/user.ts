'use server';

import { api } from '@/lib/api';
import { auth } from '@/lib/auth'; // Ensure this matches your actual auth import
import { revalidatePath } from 'next/cache';

export async function getUsers() {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    try {
        return await api.get('/users', token);
    } catch (error: any) {
        console.error('FAILED TO FETCH USERS:', error.message);
        return [];
    }
}

export async function createUser(data: any) {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    try {
        await api.post('/users', data, token);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateUser(id: number, data: any) {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    try {
        await api.put(`/users/${id}`, data, token);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleUserActive(id: number) {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    try {
        await api.post(`/users/${id}/toggle-active`, {}, token);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
