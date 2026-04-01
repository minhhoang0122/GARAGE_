'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSSEContext } from '@/modules/common/contexts/RealtimeContext';

interface RealtimeRefreshProps {
    events: string[];
}

/**
 * Component này dùng để tự động refresh Server Component khi nhận sự kiện SSE cụ thể.
 * Gắn vào các trang Server Component như Dashboard, Quotes List, Mechanic Jobs...
 */
export function RealtimeRefresh({ events }: RealtimeRefreshProps) {
    const router = useRouter();
    const { addListener, removeListener } = useSSEContext();

    useEffect(() => {
        const handleRefresh = () => {
            console.log('[SSE] Triggering page refresh for events:', events);
            router.refresh();
        };

        events.forEach(event => {
            addListener(event, handleRefresh);
        });

        return () => {
            events.forEach(event => {
                removeListener(event, handleRefresh);
            });
        };
    }, [addListener, removeListener, router, events]);

    return null;
}
