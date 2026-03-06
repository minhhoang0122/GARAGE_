'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';

interface UseCachedDataOptions {
    /** Refresh data in background even if cached */
    revalidate?: boolean;
    /** Callback when fresh data arrives (for UI update) */
    onFreshData?: (data: any) => void;
}

/**
 * Hook for instant data loading with caching
 * Returns cached data immediately, then updates with fresh data
 */
export function useCachedData<T>(
    path: string | null,
    options: UseCachedDataOptions = {}
) {
    const { data: session } = useSession();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const token = (session?.user as any)?.accessToken;

    const load = useCallback(async () => {
        if (!path || !token) return;

        setLoading(true);
        setError(null);

        try {
            const result = await api.getCached(path, token, (freshData) => {
                // Update with fresh data when it arrives
                if (mountedRef.current) {
                    setData(freshData);
                    options.onFreshData?.(freshData);
                }
            });

            if (mountedRef.current) {
                setData(result);
            }
        } catch (err: any) {
            if (mountedRef.current) {
                setError(err.message);
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [path, token, options.onFreshData]);

    useEffect(() => {
        mountedRef.current = true;
        load();
        return () => { mountedRef.current = false; };
    }, [load]);

    const refresh = useCallback(() => {
        api.invalidateCache(path || undefined);
        load();
    }, [path, load]);

    return { data, loading, error, refresh };
}

/**
 * Prefetch data for routes user is likely to navigate to
 */
export function usePrefetch() {
    const { data: session } = useSession();
    const token = (session?.user as any)?.accessToken;

    return useCallback((paths: string[]) => {
        if (token) {
            api.prefetch(paths, token);
        }
    }, [token]);
}

/**
 * Hook for optimistic updates
 * Updates UI immediately, then syncs with server
 */
export function useOptimisticMutation<T>(path: string) {
    const { data: session } = useSession();
    const token = (session?.user as any)?.accessToken;

    const mutate = useCallback(async (
        apiCall: () => Promise<any>,
        optimisticUpdater: (oldData: T) => T,
        onSuccess?: () => void,
        onError?: (err: Error) => void
    ) => {
        // Optimistically update cache
        const rollback = api.optimisticUpdate(path, optimisticUpdater);

        try {
            await apiCall();
            onSuccess?.();
        } catch (err: any) {
            // Rollback on error
            if (rollback !== null) {
                api.optimisticUpdate(path, () => rollback);
            }
            onError?.(err);
        }
    }, [path, token]);

    return { mutate };
}
