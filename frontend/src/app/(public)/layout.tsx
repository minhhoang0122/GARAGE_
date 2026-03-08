import type { Metadata } from 'next';
import '../globals.css';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/contexts/ToastContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ConfirmProvider } from '@/modules/shared/components/ui/ConfirmModal';
import { Inter } from 'next/font/google';

const font = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'GarageMaster - Đặt lịch & Dịch vụ Bảo dưỡng',
    description: 'Nền tảng đặt lịch sửa chữa và bảo dưỡng ô tô trực tuyến chuyên nghiệp.',
};

export default function PublicLayout({
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
