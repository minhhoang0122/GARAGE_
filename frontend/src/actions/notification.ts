'use server';

import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// 1. Get Unread Notifications
export async function getUnreadNotifications() {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    if (!token) return [];

    try {
        const notifications = await api.get(`/notifications?t=${Date.now()}`, token);
        // Backend already filters unread only
        return (notifications || []).map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            type: n.type,
            link: n.link,
            createdAt: n.createdAt
        }));
    } catch (e) {
        console.error('getUnreadNotifications error:', e);
        return [];
    }
}

// 3. Mark As Read
export async function markAsRead(notificationId: number) {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    if (!token) return { success: false };

    try {
        await api.put(`/notifications/${notificationId}/read`, {}, token);
        api.invalidateCache('/notifications');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// 4. Mark All As Read
export async function markAllAsRead() {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    if (!token) return { success: false };

    try {
        await api.put('/notifications/read-all', {}, token);
        api.invalidateCache('/notifications');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
