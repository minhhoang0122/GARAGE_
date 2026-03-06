'use server';


import { auth } from '@/lib/auth';



import { api } from '@/lib/api';

export type SearchResult = {
    found: boolean;
    type?: 'ORDER' | 'VEHICLE';
    id?: number;
    plate?: string;
    message?: string;
};

export async function globalSearch(query: string): Promise<SearchResult> {
    try {
        const session = await auth();
        const token = (session?.user as any)?.accessToken;
        if (!token) return { found: false, message: 'Unauthorized' };

        // Call Java Backend
        const res = await api.get(`/common/search?query=${encodeURIComponent(query)}`, token);
        return res;
    } catch (error) {
        return { found: false, message: 'Lỗi tìm kiếm' };
    }
}
