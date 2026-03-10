
export const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:8081/api';

// In-memory cache for instant access (faster than sessionStorage)
const memoryCache = new Map<string, { data: any; timestamp: number }>();

// Persistent cache using sessionStorage (survives navigation)
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const STALE_TTL = 5 * 60 * 1000; // 5 minutes (serve stale while revalidating)

// Pending requests to prevent duplicate fetches
const pendingRequests = new Map<string, Promise<any>>();

function getCache(key: string): { data: any; timestamp: number; isStale: boolean } | null {
    // Check memory cache first (fastest)
    const memCached = memoryCache.get(key);
    if (memCached) {
        const age = Date.now() - memCached.timestamp;
        return { ...memCached, isStale: age > CACHE_TTL };
    }

    // Fallback to sessionStorage
    if (typeof window === 'undefined') return null;
    try {
        const item = sessionStorage.getItem(`api_cache:${key}`);
        if (item) {
            const parsed = JSON.parse(item);
            const age = Date.now() - parsed.timestamp;
            // Also populate memory cache
            memoryCache.set(key, parsed);
            return { ...parsed, isStale: age > CACHE_TTL };
        }
    } catch { }
    return null;
}

function setCache(key: string, data: any) {
    const entry = { data, timestamp: Date.now() };

    // Set in memory (instant access)
    memoryCache.set(key, entry);

    // Persist to sessionStorage
    if (typeof window !== 'undefined') {
        try {
            sessionStorage.setItem(`api_cache:${key}`, JSON.stringify(entry));
        } catch { }
    }
}

async function handleResponseError(res: Response) {
    if (res.status === 401 || res.status === 403) {
        if (typeof window !== 'undefined') {
            const { signOut } = await import('next-auth/react');
            signOut({ callbackUrl: '/login?error=' + (res.status === 403 ? 'AccountLocked' : 'SessionExpired') });
        }
        throw new Error(res.status === 401 ? 'Phiên đăng nhập hết hạn' : 'Tài khoản đã bị khóa');
    }
    if (res.status === 404) throw new Error('Không tìm thấy dữ liệu');
    if (res.status === 500) {
        const errorData = await res.json().catch(() => ({}));
        console.error('SERVER 500 ERROR:', errorData);
        throw new Error(errorData.error || 'Lỗi máy chủ (500)');
    }
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Lỗi API (${res.status})`);
}

export const api = {
    /**
     * Get data with instant cache return + background revalidation
     * Always returns immediately if cached (even if stale)
     */
    async getCached(path: string, token?: string, onUpdate?: (data: any) => void): Promise<any> {
        const cached = getCache(path);
        const now = Date.now();

        // If we have cached data (even stale), return it immediately
        if (cached) {
            // If fresh enough, just return
            if (!cached.isStale) {
                return cached.data;
            }

            // If stale but within STALE_TTL, return cached + revalidate in background
            if (now - cached.timestamp < STALE_TTL) {
                // Fire background revalidation
                this.get(path, token)
                    .then(fresh => {
                        setCache(path, fresh);
                        // Notify caller if they want to update UI with fresh data
                        if (onUpdate) onUpdate(fresh);
                    })
                    .catch(() => { });
                return cached.data;
            }
        }

        // No cache or too old - must fetch fresh
        return this._dedupedGet(path, token);
    },

    /**
     * Prefetch data in background (use for anticipated navigation)
     */
    prefetch(paths: string[], token?: string) {
        paths.forEach(path => {
            const cached = getCache(path);
            if (!cached || cached.isStale) {
                this.get(path, token)
                    .then(data => setCache(path, data))
                    .catch(() => { });
            }
        });
    },

    /**
     * Deduplicated GET - prevents duplicate requests for same path
     */
    async _dedupedGet(path: string, token?: string): Promise<any> {
        // If there's already a pending request for this path, wait for it
        if (pendingRequests.has(path)) {
            return pendingRequests.get(path);
        }

        // Create new request
        const request = this.get(path, token)
            .then(data => {
                setCache(path, data);
                pendingRequests.delete(path);
                return data;
            })
            .catch(err => {
                pendingRequests.delete(path);
                throw err;
            });

        pendingRequests.set(path, request);
        return request;
    },

    // Invalidate cache for a path or prefix (call after mutations)
    invalidateCache(pathOrPrefix?: string) {
        if (pathOrPrefix) {
            // 1. Clear from memoryCache (using startsWith for prefix matching)
            for (const key of memoryCache.keys()) {
                if (key.startsWith(pathOrPrefix)) {
                    memoryCache.delete(key);
                }
            }

            // 2. Clear from sessionStorage
            if (typeof window !== 'undefined') {
                try {
                    Object.keys(sessionStorage).forEach(key => {
                        if (key.startsWith(`api_cache:${pathOrPrefix}`)) {
                            sessionStorage.removeItem(key);
                        }
                    });
                } catch (e) {
                    console.error('Error invalidating sessionStorage:', e);
                }
            }
        } else {
            // Clear all
            memoryCache.clear();
            if (typeof window !== 'undefined') {
                try {
                    Object.keys(sessionStorage)
                        .filter(k => k.startsWith('api_cache:'))
                        .forEach(k => sessionStorage.removeItem(k));
                } catch (e) { }
            }
        }
    },

    // Optimistic update - update cache immediately before API call
    optimisticUpdate(path: string, updater: (old: any) => any) {
        const cached = getCache(path);
        if (cached) {
            const updated = updater(cached.data);
            setCache(path, updated);
            return updated;
        }
        return null;
    },

    async login(username: string, password: string) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Login failed' }));
            throw new Error(error.error || 'Đăng nhập thất bại');
        }

        return res.json();
    },

    async get(path: string, token?: string) {
        const headers: any = {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip, deflate'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}${path}`, {
            headers,
            cache: 'no-store', // Disable Next.js fetch caching
        });

        if (!res.ok) {
            await handleResponseError(res);
        }

        return res.json();
    },

    async post(path: string, data: any, token: string) {
        const res = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            await handleResponseError(res);
        }

        return res.json();
    },

    async put(path: string, data: any, token: string) {
        const res = await fetch(`${API_URL}${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            await handleResponseError(res);
        }

        const text = await res.text();
        return text ? JSON.parse(text) : {};
    },

    async patch(path: string, data: any, token: string) {
        const res = await fetch(`${API_URL}${path}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            await handleResponseError(res);
        }

        const text = await res.text();
        return text ? JSON.parse(text) : {};
    },

    async upload(path: string, formData: FormData, token: string) {
        const res = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // DO NOT set Content-Type for FormData, browser will do it with boundary
            },
            body: formData,
        });

        if (!res.ok) {
            await handleResponseError(res);
        }

        return res.json();
    },

    async delete(path: string, token: string) {
        const res = await fetch(`${API_URL}${path}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) {
            await handleResponseError(res);
        }

        const text = await res.text();
        return text ? JSON.parse(text) : {};
    }
};

