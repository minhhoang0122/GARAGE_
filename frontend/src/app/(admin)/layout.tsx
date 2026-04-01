import type { Metadata } from 'next';
import '../globals.css';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/contexts/ToastContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ConfirmProvider } from '@/modules/shared/components/ui/ConfirmModal';
import { SSEProvider } from '@/modules/common/contexts/RealtimeContext';
import { Inter } from 'next/font/google';

const font = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'GarageMaster Admin - Quản lý nội bộ',
    description: 'Hệ thống quản trị Gara ô tô tập trung.',
};

import QueryProvider from '@/providers/QueryProvider';
import { Toaster } from 'sonner';
import { SSEGlobalListener } from '@/modules/common/components/layout/SSEGlobalListener';
import { LayoutProvider } from '@/modules/common/contexts/LayoutContext';
import { DashboardShell } from '@/modules/common/components/layout/DashboardLayout';

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
                        <ToastProvider>
                            <ThemeProvider>
                                <ConfirmProvider>
                                    <SSEProvider>
                                        <Toaster position="top-right" richColors closeButton />
                                        <SSEGlobalListener />
                                        <LayoutProvider>
                                            <DashboardShell>
                                                {children}
                                            </DashboardShell>
                                        </LayoutProvider>
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
