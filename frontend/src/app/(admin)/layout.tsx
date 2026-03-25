import type { Metadata } from 'next';
import '../globals.css';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/contexts/ToastContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ConfirmProvider } from '@/modules/shared/components/ui/ConfirmModal';
import { SessionSync } from '@/modules/common/components/layout/SessionSync';
import { SSEProvider } from '@/modules/common/contexts/SSEContext';
import { Inter } from 'next/font/google';

const font = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'GarageMaster Admin - Quản lý nội bộ',
    description: 'Hệ thống quản trị Gara ô tô tập trung.',
};

import QueryProvider from '@/providers/QueryProvider';

import { SSEGlobalListener } from '@/modules/common/components/layout/SSEGlobalListener';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body className={font.className}>
                <SessionProvider refetchOnWindowFocus={false}>
                    <QueryProvider>
                        <SessionSync />
                        <ToastProvider>
                            <ThemeProvider>
                                <ConfirmProvider>
                                    <SSEProvider>
                                        <SSEGlobalListener />
                                        {children}
                                    </SSEProvider>
                                </ConfirmProvider>
                            </ThemeProvider>
                        </ToastProvider>
                    </QueryProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
