import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const baseEnvUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

// Đảm bảo BASE_URL không có /api ở cuối
export const BASE_URL = baseEnvUrl.endsWith('/api') 
    ? baseEnvUrl.substring(0, baseEnvUrl.length - 4) 
    : (baseEnvUrl.endsWith('/') ? baseEnvUrl.slice(0, -1) : baseEnvUrl);

// API_URL có /api để dùng cho các lời gọi hàm thủ công
export const API_URL = `${BASE_URL}/api`;

// Cache for public data or speed (Alternative to TanStack Query where needed)
const memoryCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Create Axios Instance
// Dùng BASE_URL để phối hợp mượt mà với generated APIs (vốn đã có sẵn /api)
export const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Session Caching to prevent spamming /api/auth/session
let cachedSession: any = null;
let lastFetchTime = 0;
const SESSION_CACHE_TTL = 10000; // 10 seconds

const getFastSession = async () => {
    const now = Date.now();
    if (cachedSession && (now - lastFetchTime < SESSION_CACHE_TTL)) {
        return cachedSession;
    }
    
    // Fetch new session
    try {
        cachedSession = await getSession();
        lastFetchTime = Date.now();
        return cachedSession;
    } catch (error) {
        console.error('Failed to get session:', error);
        return null;
    }
};

// Request Interceptor: Auto-attach Token
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // If a token is already manually attached (backward compatibility), use it
        if (config.headers.Authorization) {
            return config;
        }

        // Otherwise, try to get token from session (Client-side only)
        if (typeof window !== 'undefined') {
            try {
                const session = await getFastSession();
                const token = session?.user?.accessToken;
                if (token) {
                    if (config.headers) {
                        config.headers.set('Authorization', `Bearer ${token}`);
                    }
                }
            } catch (error) {
                console.error('API Request Interceptor Error:', error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Centralized Error Handling
// CRITICAL: Normalize responses to maintain {success: true, ...} format
// that the entire frontend depends on (legacy AIP wrapper compatibility).
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        const data = response.data;
        const method = response.config.method?.toUpperCase();

        // For mutating methods (POST/PUT/PATCH/DELETE):
        // If backend returns empty/null/string, wrap in {success: true}
        // If backend returns object without .success, inject success: true
        if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            if (data === null || data === undefined || data === '' || typeof data === 'string') {
                return { success: true, message: data || 'OK' };
            }
            if (typeof data === 'object' && !Array.isArray(data) && data.success === undefined) {
                return { ...data, success: true };
            }
        }

        // For GET or responses that already have success field, pass through
        return data;
    },
    async (error) => {
        if (error.response) {
            const { status, data } = error.response;

            // Auto Logout on 401
            if (status === 401 && typeof window !== 'undefined') {
                await signOut({ callbackUrl: '/login?error=SessionExpired' });
                return Promise.reject({ success: false, message: 'Phiên đăng nhập hết hạn' });
            }

            // Handling 403
            if (status === 403) {
                return Promise.reject({ success: false, message: 'Bạn không có quyền thực hiện hành động này' });
            }

            if (status === 404) {
                return Promise.reject({ success: false, message: 'Không tìm thấy dữ liệu (404)' });
            }

            // Return error data from server, ensure {success: false} format
            if (data && typeof data === 'object') {
                return Promise.reject({ success: false, ...data });
            }
            return Promise.reject({ success: false, message: data || `Lỗi ${status}` });
        } else if (error.request) {
            return Promise.reject({ success: false, message: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.' });
        }
        return Promise.reject({ success: false, message: error.message || 'Lỗi không xác định' });
    }
);

export const api = {
    /**
     * Helper to ensure path always starts with /api if not already there
     */
    _p(path: string) {
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`;
    },

    /**
     * GET method with optional manual token override
     */
    async get(path: string, token?: string, signal?: AbortSignal): Promise<any> {
        const config: any = { signal };
        if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
        }
        return axiosInstance.get(this._p(path), config) as any;
    },

    async post(path: string, data?: any, token?: string): Promise<any> {
        const config: any = {};
        if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
        }
        return axiosInstance.post(this._p(path), data, config) as any;
    },

    async put(path: string, data?: any, token?: string): Promise<any> {
        const config: any = {};
        if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
        }
        return axiosInstance.put(this._p(path), data, config) as any;
    },

    async patch(path: string, data?: any, token?: string): Promise<any> {
        const config: any = {};
        if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
        }
        return axiosInstance.patch(this._p(path), data, config) as any;
    },

    async delete(path: string, token?: string): Promise<any> {
        const config: any = {};
        if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
        }
        return axiosInstance.delete(this._p(path), config) as any;
    },

    /**
     * Legacy caching support (Used in some public pages)
     * Supports SWR pattern via optional callback
     */
    async getCached(path: string, token?: string, ttlOrCallback?: number | ((data: any) => void)) {
        const ttl = typeof ttlOrCallback === 'number' ? ttlOrCallback : CACHE_TTL;
        const onFreshData = typeof ttlOrCallback === 'function' ? ttlOrCallback : null;

        const now = Date.now();
        const cached = memoryCache.get(path);

        // If we have valid cache, return it immediately but trigger revalidate if callback exists
        if (cached && now < cached.expiry) {
            if (onFreshData) {
                // Background revalidation
                this.get(path, token).then(freshData => {
                    memoryCache.set(path, { data: freshData, expiry: Date.now() + ttl });
                    onFreshData(freshData);
                }).catch(() => { });
            }
            return cached.data;
        }

        const data = await this.get(path, token);
        memoryCache.set(path, { data, expiry: now + ttl });
        return data;
    },

    invalidateCache(pathOrPrefix?: string) {
        if (pathOrPrefix) {
            for (const key of memoryCache.keys()) {
                if (key.startsWith(pathOrPrefix)) {
                    memoryCache.delete(key);
                }
            }
        } else {
            memoryCache.clear();
        }
    },

    /**
     * Prefetch multiple endpoints for better UX
     */
    prefetch(paths: string[], token: string) {
        paths.forEach(path => this.getCached(path, token).catch(() => { }));
    },

    /**
     * Manual cache update for optimistic UI
     * Returns the old data to allow for manual rollback
     */
    optimisticUpdate<T>(path: string, updater: (oldData: T) => T): T | null {
        const cached = memoryCache.get(path);
        if (cached) {
            const oldData = cached.data;
            const newData = updater(oldData);
            memoryCache.set(path, { ...cached, data: newData });
            return oldData;
        }
        return null;
    },

    // Auth helpers
    async login(username: string, password: string): Promise<any> {
        return axiosInstance.post(this._p('/auth/login'), { username, password }) as any;
    },

    /**
     * Upload helper for FormData (images, etc)
     */
    async upload(path: string, formData: FormData): Promise<any> {
        return axiosInstance.post(this._p(path), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }) as any;
    }
};
