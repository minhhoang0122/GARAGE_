'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { memo, useMemo } from 'react';
import {
    Car, LayoutDashboard, Users, BarChart3, Settings, History,
    ShoppingCart, Package, FileText, CreditCard, PackagePlus,
    PackageMinus, Boxes, ClipboardCheck, ClipboardList, LogOut,
    Wrench, ShieldCheck, Component, Tag, Wallet, UserCog
} from 'lucide-react';
import { ROLE_MENUS, ROLE_DISPLAY_NAMES, MenuGroup } from '@/config/menu';
import { VaiTroType } from '@/lib/auth';
import { api } from '@/lib/api';

// Static icon map for faster lookups
const ICON_MAP: Record<string, any> = {
    Car, LayoutDashboard, Users, BarChart3, Settings, History,
    ShoppingCart, Package, FileText, CreditCard, PackagePlus,
    PackageMinus, Boxes, ClipboardCheck, ClipboardList, LogOut, Component,
    Tag, Wallet, UserCog
};

// --- PREMIUM ICON COMPONENT ---
const PremiumIcon = memo(function PremiumIcon({ name, isActive, className }: { name: string; isActive?: boolean; className?: string }) {
    const IconComponent = ICON_MAP[name];
    if (!IconComponent) return null;

    return (
        <IconComponent
            className={`w-[18px] h-[18px] transition-all duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} ${className || ''}`}
            strokeWidth={isActive ? 2.5 : 1.75}
        />
    );
});

// Route to API endpoint mapping for prefetch
const PREFETCH_MAP: Record<string, string[]> = {
    '/sale': ['/sale/stats'],
    '/warehouse': ['/warehouse/pending', '/warehouse/products'],
    '/warehouse/inventory': ['/warehouse/products'],
    '/warehouse/export': ['/warehouse/pending'],
    '/mechanic': ['/mechanic/jobs', '/mechanic/stats'],
    '/mechanic/jobs': ['/mechanic/jobs'],
    '/admin': ['/users'],
};

// Memoized menu item with prefetch
const MenuItem = memo(function MenuItem({
    item,
    isActive,
    token,
    onNavigate
}: {
    item: { href: string; icon: string; label: string };
    isActive: boolean;
    token?: string;
    onNavigate?: () => void;
}) {
    const handleMouseEnter = () => {
        if (!token) return;
        const endpoints = PREFETCH_MAP[item.href];
        if (endpoints) {
            endpoints.forEach(endpoint => {
                api.getCached(endpoint, token).catch(() => { });
            });
        }
    };

    return (
        <li className="px-1 mb-1 relative">
            {/* Active Indicator Line */}
            {isActive && (
                <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
            )}

            <Link
                href={item.href}
                onClick={onNavigate}
                prefetch={true}
                onMouseEnter={handleMouseEnter}
                className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative select-none
                    ${isActive
                        ? 'bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-100 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'}
                `}
            >
                <PremiumIcon name={item.icon} isActive={isActive} />

                <span className={`text-[13px] tracking-tight ${isActive ? 'translate-x-0.5' : ''} transition-transform duration-200`}>
                    {item.label}
                </span>

                {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-500/20 dark:bg-indigo-400/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                    </div>
                )}
            </Link>
        </li>
    );
});

interface SidebarProps {
    className?: string;
    onNavigate?: () => void;
}

export default function Sidebar({ className, onNavigate }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const role = session?.user?.role as VaiTroType;
    // @ts-ignore
    const token = session?.user?.accessToken as string | undefined;

    const menuGroups: MenuGroup[] = useMemo(() => {
        return role ? ROLE_MENUS[role] || [] : [];
    }, [role]);

    const roleName = useMemo(() => {
        return role ? ROLE_DISPLAY_NAMES[role] : '';
    }, [role]);

    const initials = useMemo(() => {
        return session?.user?.name
            ?.split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'U';
    }, [session?.user?.name]);

    return (
        <aside className={`w-[260px] h-screen bg-slate-100 dark:bg-slate-950 flex flex-col gap-4 p-3 border-r border-slate-200 dark:border-slate-800/50 relative transition-colors duration-300 print:hidden ${className}`}>

            {/* Logo area - Detached Block - Soft Gradient */}
            <div className="px-3 py-3 rounded-xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-slate-700 shadow-[0_4px_12px_-2px_rgba(37,99,235,0.08)] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 relative group">
                        <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <Image
                            src="/logo.png"
                            alt="GARAGEMASTER Logo"
                            width={44}
                            height={44}
                            className="w-11 h-11 object-contain relative z-10 drop-shadow-[0_0_8px_rgba(37,99,235,0.3)]"
                        />
                    </div>
                    <div>
                        <h1 className="font-bold text-[15px] leading-none text-slate-900 dark:text-white tracking-tight">
                            GARAGE<span className="text-indigo-600">MASTER</span>
                        </h1>
                        <span className="text-[8px] text-slate-400 font-medium uppercase tracking-widest mt-0.5 block">Enterprise System</span>
                    </div>
                </div>
            </div>

            {/* Menu - Flexible Area */}
            <nav className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-1">
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className={groupIndex > 0 ? 'mt-6' : ''}>
                        {group.title && (
                            <div className="px-2 mb-2 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">{group.title}</span>
                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                            </div>
                        )}
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <MenuItem
                                        key={item.href}
                                        item={item}
                                        isActive={isActive}
                                        token={token}
                                        onNavigate={onNavigate}
                                    />
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* User Profile - Detached Card - Soft Gradient */}
            <div className="mt-auto shrink-0">
                <div className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-3 border border-blue-100 dark:border-slate-700 shadow-[0_4px_12px_-2px_rgba(37,99,235,0.08)] hover:shadow-lg transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-950/30 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 shrink-0 border border-blue-200/50 dark:border-blue-800/30">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold truncate text-slate-800 dark:text-slate-200" title={session?.user?.name || ''}>{session?.user?.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium truncate flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {roleName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/50">
                        <div className="flex-1">
                            {/* ThemeToggle moved to Topbar */}
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-500 transition-all"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 0px;
                    background: transparent;
                }
                .custom-scrollbar:hover::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
            `}</style>
        </aside>
    );
}
