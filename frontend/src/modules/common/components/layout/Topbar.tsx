'use client';

import { Menu, Home, ChevronRight } from 'lucide-react';
import { Button } from '@/modules/shared/components/ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

interface TopbarProps {
    title?: string;
    subtitle?: string;
    onMenuClick: () => void;
}

export default function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const formatPathLabel = (path: string) => {
        const map: Record<string, string> = {
            sale: 'Bán hàng',
            warehouse: 'Kho',
            admin: 'Quản trị',
            users: 'Người dùng',
            products: 'Sản phẩm',
            orders: 'Đơn hàng',
            customers: 'Khách hàng',
            reception: 'Tiếp nhận',
            inventory: 'Tồn kho',
            dashboard: 'Tổng quan',
            mechanic: 'Kỹ thuật',
            tasks: 'Công việc',
            quotes: 'Báo giá',
        };
        return map[path] || path;
    };

    // Map path to breadcrumbs
    const getBreadcrumbs = () => {
        const paths = pathname.split('/').filter(Boolean);
        return paths.map((path, index) => {
            const href = `/${paths.slice(0, index + 1).join('/')}`;
            const isLast = index === paths.length - 1;
            const label = formatPathLabel(path);

            return (
                <div key={path} className="flex items-center">
                    <ChevronRight className="w-3 h-3 text-slate-400 mx-1 flex-shrink-0" />
                    {isLast ? (
                        <span className="font-medium text-slate-800 dark:text-slate-200 capitalize text-xs whitespace-nowrap">
                            {label}
                        </span>
                    ) : (
                        <Link href={href} className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors capitalize text-xs whitespace-nowrap">
                            {label}
                        </Link>
                    )}
                </div>
            );
        });
    };

    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-all duration-200">
            <div className="flex h-14 md:h-16 items-center justify-between px-4 lg:px-8 gap-4">
                {/* Left Section: Mobile Menu & Breadcrumbs/Title */}
                <div className="flex items-center gap-3 flex-1 min-w-0 transition-opacity duration-300">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 -ml-2 h-9 w-9"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="flex flex-col min-w-0 justify-center">
                        {/* Streamlined Breadcrumbs - Lavender/Pink Gradient Bar */}
                        <div className="flex items-center gap-1.5 w-fit mb-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-900/40 dark:to-pink-900/40 border border-purple-200 dark:border-purple-800/50 shadow-sm">
                            <Link href="/" className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0 pb-px">
                                <Home className="w-3.5 h-3.5" />
                            </Link>
                            {getBreadcrumbs()}
                        </div>

                        {/* Clean Title Layout */}
                        <div className="flex items-baseline gap-3 min-w-0">
                            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug truncate pb-0.5">
                                {title || 'Dashboard'}
                            </h1>
                            {subtitle && (
                                <p className="hidden xl:block text-xs text-slate-500 dark:text-slate-400 font-medium truncate leading-snug border-l border-slate-300 dark:border-slate-700 pl-3 pt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 pl-2">
                    <ThemeToggle />
                    <NotificationBell />

                    <div className="pl-1">
                        <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-slate-500/10 cursor-pointer hover:shadow-lg hover:shadow-slate-500/30 transition-all active:scale-95 border-2 border-white dark:border-slate-900 select-none">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
