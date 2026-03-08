import type { Metadata } from 'next';
import '../globals.css';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/contexts/ToastContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ConfirmProvider } from '@/modules/shared/components/ui/ConfirmModal';
import { SessionSync } from '@/modules/common/components/layout/SessionSync';
import { Inter } from 'next/font/google';

const font = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'GarageMaster Admin - Quản lý nội bộ',
    description: 'Hệ thống quản trị Gara ô tô tập trung.',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body className={font.className}>
                <SessionProvider refetchOnWindowFocus={false}>
                    <SessionSync />
                    <ToastProvider>
                        <ThemeProvider>
                            <ConfirmProvider>
                                {children}
                            </ConfirmProvider>
                        </ThemeProvider>
                    </ToastProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
