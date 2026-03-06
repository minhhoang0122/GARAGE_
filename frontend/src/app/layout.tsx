import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/contexts/ToastContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ConfirmProvider } from '@/modules/shared/components/ui/ConfirmModal';

export const metadata: Metadata = {
    title: 'GARAGEMASTER - Hệ thống quản lý Gara',
    description: 'Hệ thống quản lý Gara ô tô toàn diện',
    icons: {
        icon: '/favicon.png?v=5',
        apple: '/favicon.png?v=5',
    },
};

import { Inter } from 'next/font/google';

const font = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body className={font.className}>
                <SessionProvider refetchOnWindowFocus={false}>
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
