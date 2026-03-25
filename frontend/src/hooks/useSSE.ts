'use client';

import { useEffect, useRef } from 'react';
import { useSSEContext } from '@/modules/common/contexts/SSEContext';

type SSECallback = (data: any) => void;

/**
 * Hook để lắng nghe sự kiện Real-time từ Server qua SSE.
 * Sử dụng SSEContext để chia sẻ một kết nối duy nhất cho toàn ứng dụng.
 */
export function useSSE(eventName: string, onMessage: SSECallback) {
    const { addListener, removeListener } = useSSEContext();
    const callbackRef = useRef(onMessage);

    // Update ref when onMessage changes to avoid unnecessary re-subscriptions
    useEffect(() => {
        callbackRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const handler = (data: any) => callbackRef.current(data);
        
        addListener(eventName, handler);
        return () => removeListener(eventName, handler);
    }, [eventName, addListener, removeListener]);
}
