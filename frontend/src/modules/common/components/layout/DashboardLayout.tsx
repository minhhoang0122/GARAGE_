'use client';

import { ReactNode, memo, useState, useCallback, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { usePathname, useRouter } from 'next/navigation';
import { useSSE } from '@/hooks/useSSE';
import { useQueryClient } from '@tanstack/react-query';

interface DashboardLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

// Memoize to prevent re-renders when children change
const MemoizedSidebar = memo(Sidebar);
const MemoizedTopbar = memo(Topbar);

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
 
    const queryClient = useQueryClient();
 
    // Lắng nghe sự kiện để tự động refresh dữ liệu (Real-time Sync)
    useSSE('notification', () => {
        // Refresh Server Components
        router.refresh();
        // Invalidate all TanStack Queries for Client Components
        queryClient.invalidateQueries();
    });
 
    // Close mobile menu when route changes (backup safety)
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 relative overflow-hidden">
            {/* Smooth Double-Grid Transition Layers */}
            <div
                className="grid-layer opacity-100 dark:opacity-0"
                style={{
                    backgroundImage: `linear-gradient(var(--grid-light) 1px, transparent 1px), linear-gradient(90deg, var(--grid-light) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />
            <div
                className="grid-layer opacity-0 dark:opacity-100"
                style={{
                    backgroundImage: `linear-gradient(var(--grid-dark) 1px, transparent 1px), linear-gradient(90deg, var(--grid-dark) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Desktop Sidebar (hidden on mobile) */}
            <MemoizedSidebar className="hidden lg:flex" />

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden font-sans">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                        onClick={closeMobileMenu}
                    />

                    {/* Sidebar Drawer */}
                    <div className="absolute left-0 top-0 bottom-0 w-[280px] shadow-2xl animate-in slide-in-from-left duration-300">
                        <Sidebar onNavigate={closeMobileMenu} className="w-full h-full" />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
                <MemoizedTopbar
                    title={title}
                    subtitle={subtitle}
                    onMenuClick={toggleMobileMenu}
                />
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
