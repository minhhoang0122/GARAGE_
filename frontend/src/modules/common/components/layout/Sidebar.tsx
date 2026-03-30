'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { ReactNode, memo, useState, useCallback, useEffect, useMemo } from 'react';
import {
    Car, LayoutDashboard, Users, BarChart3, Settings, History,
    ShoppingCart, Package, FileText, CreditCard, PackagePlus,
    PackageMinus, Boxes, ClipboardCheck, ClipboardList, LogOut,
    Wrench, ShieldCheck, Component, Tag, Wallet, UserCog
} from 'lucide-react';
import { ROLE_MENUS, ROLE_DISPLAY_NAMES, MenuGroup } from '@/config/menu';
import { VaiTroType } from '@/lib/auth';
import { api } from '@/lib/api';
import { usePresence } from '@/hooks/usePresence';
import { User as UserIcon } from 'lucide-react';
import BaseAvatar from '@/modules/shared/components/common/BaseAvatar';

// Static icon map for faster lookups
const ICON_MAP: Record<string, any> = {
    Car, LayoutDashboard, Users, BarChart3, Settings, History,
    ShoppingCart, Package, FileText, CreditCard, PackagePlus,
    PackageMinus, Boxes, ClipboardCheck, ClipboardList, LogOut, Component,
    Tag, Wallet, UserCog, Wrench, ShieldCheck
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
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative select-none
                    ${isActive
                        ? 'bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-100 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'}
                `}
            >
                <PremiumIcon name={item.icon} isActive={isActive} />

                <span className={`text-[13px] tracking-tight ${isActive ? 'translate-x-0.5' : ''} transition-transform duration-300`}>
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
    const searchParams = useSearchParams();
    const source = searchParams.get('source');
    const { data: session } = useSession();
    const { onlineUsers, allStaff } = usePresence();

    // Group staff by online status
    const groupedStaff = useMemo(() => {
        const currentUserId = (session?.user as any)?.id;
        // onlineUsers is a Map<number, any>, .has() works on keys (userIds)
        const online = allStaff.filter(u => onlineUsers.has(Number(u.id)) && Number(u.id) !== currentUserId);
        const offline = allStaff.filter(u => !onlineUsers.has(Number(u.id)) && Number(u.id) !== currentUserId);
        return { online, offline };
    }, [allStaff, onlineUsers, session?.user]);

    const roles = (session?.user as any)?.roles || [];
    const [activeRole, setActiveRole] = useState<string | null>(null);

    // Xác định role thực tế ngay trong quá trình render để tránh flicker
    const currentRole = useMemo(() => {
        if (activeRole) return activeRole;
        if (roles.length === 0) return null;
        
        const savedRole = typeof window !== 'undefined' ? localStorage.getItem('active_role') : null;
        if (savedRole && roles.includes(savedRole)) return savedRole;
        
        const priority = ['ADMIN', 'SALE', 'KHO', 'QUAN_LY_XUONG', 'THO_SUA_CHUA'];
        return priority.find(r => roles.includes(r)) || roles[0];
    }, [activeRole, roles]);

    // Đồng bộ ngược lại state để các component khác (như Workspace Switcher) có giá trị chuẩn
    useEffect(() => {
        if (currentRole && !activeRole) {
            setActiveRole(currentRole);
        }
    }, [currentRole, activeRole]);

    const handleRoleChange = (role: string) => {
        setActiveRole(role);
        localStorage.setItem('active_role', role);
    };

    const token = (session?.user as any)?.accessToken as string | undefined;

    const menuGroups: MenuGroup[] = useMemo(() => {
        return currentRole ? ROLE_MENUS[currentRole] || [] : [];
    }, [currentRole]);

    // Tìm mục menu active nhất (Longest Prefix Match)
    const activeItemHref = useMemo(() => {
        const allItems = menuGroups.flatMap(g => g.items);
        
        // Nếu có source=history, ưu tiên tìm mục menu có href chứa 'history'
        if (source === 'history') {
            const historyItem = allItems.find(item => item.href.includes('history'));
            if (historyItem) return historyItem.href;
        }

        const matches = allItems
            .filter(item => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')))
            .sort((a, b) => b.href.length - a.href.length);
        
        return matches[0]?.href || null;
    }, [menuGroups, pathname, source]);

    const roleDisplayName = useMemo(() => {
        return activeRole ? ROLE_DISPLAY_NAMES[activeRole] : '';
    }, [activeRole]);

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
                            priority
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

            {/* Workspace Switcher - Only shows if user has multiple roles */}
            {roles.length > 1 && (
                <div className="px-1 shrink-0">
                    <div className="relative group">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider ml-2 mb-1 block">Không gian làm việc</label>
                        <select
                            value={activeRole || ''}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-[13px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                        >
                            {roles.map((r: string) => (
                                <option key={r} value={r}>
                                    {ROLE_DISPLAY_NAMES[r] || r}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 bottom-2.5 pointer-events-none text-slate-400">
                            <Component className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            )}

            {/* Menu - Fixed Area */}
            <nav className="relative z-10 flex-none px-1">
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className={groupIndex > 0 ? 'mt-6' : ''}>
                        {group.title && (
                            <div className="px-2 mb-2 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">{group.title}</span>
                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                            </div>
                        )}
                        <ul className="space-y-0.5">
                            {group.items.map((item) => (
                                <MenuItem
                                    key={item.href}
                                    item={item}
                                    isActive={activeItemHref === item.href}
                                    token={token}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* --- TEAM SECTION (Minimalist Contrast Card) --- */}
            {currentRole !== 'ADMIN' && (
                <div className="mt-4 mx-1 px-3 py-4 rounded-2xl bg-slate-200/40 dark:bg-slate-900/40 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        ĐỘI NGŨ
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-semibold">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400/80 bg-emerald-50 dark:bg-emerald-400/10 px-1.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-400/20">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            {groupedStaff.online.length} online
                        </span>
                        <span className="text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded-full">
                            {groupedStaff.offline.length} offline
                        </span>
                    </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-hidden hover:scrollbar-visible custom-scrollbar">
                    {/* --- ONLINE SECTION --- */}
                    {groupedStaff.online.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-[9px] font-bold text-slate-400 dark:text-slate-600 px-1 tracking-wider uppercase mb-3 text-left">
                                ONLINE
                            </div>
                            {groupedStaff.online.map((staff) => (
                                <div 
                                    key={staff.id} 
                                    className="flex items-center gap-3 group/member p-1.5 rounded-xl transition-all cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-500/10 active:bg-emerald-100 dark:active:bg-emerald-500/20"
                                >
                                    <BaseAvatar
                                        id={staff.id}
                                        src={staff.avatar}
                                        name={staff.fullName}
                                        online={true}
                                        size="sm"
                                        className="group-hover/member:scale-105 transition-transform"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-medium text-slate-800 dark:text-slate-100 truncate group-hover/member:text-emerald-700 dark:group-hover/member:text-emerald-400 transition-colors">
                                            {staff.fullName}
                                        </span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                                            {(ROLE_DISPLAY_NAMES as any)[staff.vaiTro] || staff.vaiTro || 'Nhân viên'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- OFFLINE SECTION --- */}
                    {groupedStaff.offline.length > 0 && (
                        <div className="space-y-2 pt-2 mt-4">
                            <div className="text-[9px] font-bold text-slate-400 dark:text-slate-600/60 px-1 tracking-wider uppercase mb-3 text-left">
                                OFFLINE
                            </div>
                            {groupedStaff.offline.map((staff) => (
                                <div 
                                    key={staff.id} 
                                    className="flex items-center gap-3 group/member p-1.5 rounded-xl opacity-100 transition-all cursor-default"
                                >
                                    <BaseAvatar
                                        id={staff.id}
                                        src={staff.avatar}
                                        name={staff.fullName}
                                        online={false}
                                        size="sm"
                                        className="transition-all"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                                            {staff.fullName}
                                        </span>
                                        <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-medium">
                                            {(ROLE_DISPLAY_NAMES as any)[staff.vaiTro] || staff.vaiTro || 'Nhân viên'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {allStaff.length === 0 && (
                        <div className="px-1 py-6 text-center">
                            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium italic">
                                Chưa có dữ liệu nhân sự
                            </p>
                        </div>
                    )}
                </div>
            </div>
            )}

            {/* Logout Button - Minimalist Footer */}
            <div className="mt-auto px-4 py-8">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-all font-bold text-[13px] border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20 shadow-sm hover:shadow-md"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất hệ thống</span>
                </button>
            </div>

            <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar,
            .custom-sidebar-scroll::-webkit-scrollbar {
                width: 0px;
                background: transparent;
            }
            .custom-scrollbar:hover::-webkit-scrollbar,
            .group\/scroll:hover .custom-sidebar-scroll::-webkit-scrollbar {
                width: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-track,
            .custom-sidebar-scroll::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb,
            .custom-sidebar-scroll::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 10px;
            }
            .dark .custom-sidebar-scroll::-webkit-scrollbar-thumb {
                background: #334155;
            }
        `}</style>
        </aside>
    );
}
