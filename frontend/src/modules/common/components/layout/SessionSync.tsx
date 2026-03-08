'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export function SessionSync() {
    const { data: session, update } = useSession();
    const lastCheckRef = useRef<number>(0);

    useEffect(() => {
        if (!session?.user || !(session.user as any).accessToken) return;

        const checkSession = async () => {
            try {
                // Tránh gọi quá dày đặc (throttle 30 giây)
                if (Date.now() - lastCheckRef.current < 30000) return;
                lastCheckRef.current = Date.now();

                const freshData = await api.get('/auth/me', (session.user as any).accessToken);

                const currentRoles = (session.user as any).roles || [];
                const freshRoles = freshData.roles || [];

                const sortedCurrent = [...currentRoles].sort();
                const sortedFresh = [...freshRoles].sort();

                const rolesChanged = JSON.stringify(sortedCurrent) !== JSON.stringify(sortedFresh);

                if (rolesChanged) {
                    console.log('Phát hiện quyền hạn thay đổi, đang đồng bộ Session...');
                    await update({
                        roles: freshData.roles,
                        permissions: freshData.permissions
                    });
                    lastCheckRef.current = Date.now(); // reset timer
                }
            } catch (error) {
                console.error('Session sync error:', error);
            }
        };

        // Kích hoạt check khi user quay lại tab trình duyệt
        const onFocus = () => checkSession();
        window.addEventListener('focus', onFocus);

        // Hoặc kiểm tra định kỳ mỗi 2 phút
        const interval = setInterval(checkSession, 120000);

        return () => {
            window.removeEventListener('focus', onFocus);
            clearInterval(interval);
        };
    }, [session, update]);

    return null; // Component chạy ngầm, không render cái gì cả
}
