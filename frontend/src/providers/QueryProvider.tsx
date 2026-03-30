'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * QueryProvider - Trái tim của hệ thống quản lý trạng thái mới (TanStack Query)
 * Quản lý QueryClient tập trung cho toàn bộ ứng dụng Admin.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
    // Sử dụng useState để đảm bảo QueryClient chỉ được tạo 1 lần duy nhất trong vòng đời Client
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Thời gian dữ liệu được coi là "tươi" (fresh) - 1 phút
                staleTime: 60 * 1000,
                // Không tự động fetch lại khi nhấn vào cửa sổ (tránh lãng phí tài nguyên)
                refetchOnWindowFocus: false,
                // Thử lại tối đa 1 lần nếu request lỗi
                retry: 1,
            },
            mutations: {
                onError: (error: any) => {
                    const { toast } = require('sonner');
                    toast.error(error.message || 'Thao tác thất bại. Vui lòng thử lại.');
                }
            }
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools chỉ xuất hiện trong môi trường Development */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
