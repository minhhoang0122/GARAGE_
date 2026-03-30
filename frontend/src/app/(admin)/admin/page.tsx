'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/modules/common/components/layout';
import { LayoutDashboard, Users, Car, Wrench, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { identityService } from '@/modules/identity/services/identityService';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';
import { usePresence } from '@/hooks/usePresence';

import { useQuery } from '@tanstack/react-query';

export default function AdminDashboard() {
    const { data: stats = {
        waitingVehicles: 0,
        inProgressJobs: 0,
        todayRevenue: 0,
        lowStockCount: 0
    } } = useQuery({
        queryKey: ['reports', 'dashboard-stats'],
        queryFn: () => api.get('/reports/dashboard-stats'),
    });

    const { data: staff = [], isLoading } = useQuery({
        queryKey: ['admin', 'staff-dashboard'],
        queryFn: async () => {
            const data = await identityService.getStaffUsers();
            return Array.isArray(data) ? data.slice(0, 10) : [];
        },
    });

    const { isOnline } = usePresence();

    return (
        <DashboardLayout title="Dashboard" subtitle="Tổng quan hoạt động xưởng">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <StatCard
                    icon={<Car className="w-6 h-6" />}
                    value={stats.waitingVehicles.toString()}
                    label="Xe đang chờ"
                    trend="Cần tiếp nhận"
                    color="blue"
                />
                <StatCard
                    icon={<Wrench className="w-6 h-6" />}
                    value={stats.inProgressJobs.toString()}
                    label="Đang sửa chữa"
                    trend="Đang thực hiện"
                    color="green"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    value={formatCurrency(stats.todayRevenue || 0)}
                    label="Doanh thu hôm nay"
                    trend="Thực tế thu"
                    color="purple"
                />
                <StatCard
                    icon={<AlertTriangle className="w-6 h-6" />}
                    value={stats.lowStockCount.toString()}
                    label="Phụ tùng sắp hết"
                    trend="Cần đặt hàng"
                    color="orange"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Nhân viên hệ thống</h3>
                    </div>
                    <div className="p-6">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                    <th className="py-3">Nhân viên</th>
                                    <th className="py-3">Vai trò</th>
                                    <th className="py-3">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="py-4 text-center text-slate-400">Đang tải dữ liệu...</td>
                                    </tr>
                                ) : staff.length > 0 ? (
                                    staff.map((s, i) => (
                                        <StaffRow
                                            key={i}
                                            name={s.fullName}
                                            role={s.vaiTro}
                                            avatar={s.avatar}
                                            isUserOnline={isOnline(s.id)}
                                            isAccountActive={s.isActive}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="py-4 text-center text-slate-400">Không tìm thấy nhân viên nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Thao tác nhanh</h3>
                    </div>
                    <div className="p-4 space-y-2">
                        <QuickAction icon={<Users />} label="Quản lý nhân viên" href="/admin/users" />
                        <QuickAction icon={<LayoutDashboard />} label="Báo cáo doanh thu" href="/dashboard" />
                        <QuickAction icon={<Clock />} label="Cấu hình hệ thống" href="/admin/config" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Components
function StatCard({ icon, value, label, trend, color }: {
    icon: React.ReactNode;
    value: string;
    label: string;
    trend: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}) {
    const colors = {
        blue: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
        green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
                </div>
                <div className={`p-3 rounded-xl ${colors[color]} transition-colors`}>
                    {icon}
                </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">{trend}</p>
        </div>
    );
}

function getAvatarInfo(name: string) {
    if (!name) return { initials: '??', color: 'bg-slate-400' };
    
    const words = name.trim().split(/\s+/);
    let initials = '';
    if (words.length > 1) {
        initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
    } else {
        initials = words[0].substring(0, 2).toUpperCase();
    }

    const colors = [
        'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 
        'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
        'bg-indigo-500', 'bg-orange-500'
    ];
    
    // Hash function đơn giản để chọn màu cố định cho cùng một tên
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    
    return { initials, color };
}

function StaffRow({ 
    name, 
    role, 
    isUserOnline, 
    isAccountActive, 
    avatar 
}: { 
    name: string; 
    role: string; 
    isUserOnline: boolean; 
    isAccountActive: boolean; 
    avatar?: string 
}) {
    const { initials, color } = getAvatarInfo(name);
    
    return (
        <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors group/row hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
            <td className="py-3">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-[13px] font-bold text-white shadow-sm transition-transform group-hover/row:scale-110 ${!avatar ? color : ''}`}>
                            {avatar ? (
                                <img src={avatar} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        {/* Status badge on avatar */}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${isUserOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover/row:text-orange-600 transition-colors">{name || 'N/A'}</span>
                        {!isAccountActive && <span className="text-[10px] text-rose-500 font-medium">Tài khoản bị khóa</span>}
                    </div>
                </div>
            </td>
            <td className="py-3 text-slate-600 dark:text-slate-400 font-medium">{(ROLE_DISPLAY_NAMES as any)[role] || role}</td>
            <td className="py-3">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight ${isUserOnline ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isUserOnline ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                    {isUserOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
                </span>
            </td>
        </tr>
    );
}

function QuickAction({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
    return (
        <Link
            href={href}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-sm font-medium text-left"
        >
            {icon}
            {label}
        </Link>
    );
}
