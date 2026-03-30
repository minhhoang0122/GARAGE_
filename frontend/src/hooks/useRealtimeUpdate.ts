'use client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * useRealtimeUpdate
 * Custom hook to invalidate React Query caches when a 'sse-update' event is received.
 * 
 * @param queryKey The React Query key array to invalidate
 * @param options Optional filtering options
 */
export const useRealtimeUpdate = (
    queryKey: readonly any[], 
    options?: { 
        filter?: (data: any) => boolean;
        refId?: number | string;
        onUpdate?: (data: any) => void;
    }
) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const handleUpdate = (event: any) => {
            const data = event.detail;
            
            // Custom filter check
            if (options?.filter && !options.filter(data)) return;
            
            // Ref ID check (common pattern for orders/receptions)
            if (options?.refId && data.refId !== undefined && String(data.refId) !== String(options.refId)) {
                return;
            }

            console.log('[Realtime] Invaliding Query:', queryKey, 'due to:', data.type || data.sseType || 'unknown event');
            queryClient.invalidateQueries({ queryKey });
            
            if (options?.onUpdate) {
                options.onUpdate(data);
            }
        };

        window.addEventListener('sse-update', handleUpdate);
        
        return () => {
            window.removeEventListener('sse-update', handleUpdate);
        };
    }, [queryClient, queryKey, options?.refId, options?.filter, options?.onUpdate]);
};

