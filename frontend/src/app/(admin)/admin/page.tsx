'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/modules/common/components/layout';
import { LayoutDashboard, Users, Car, Wrench, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { getUsers } from '@/modules/identity/user';
import { ROLE_DISPLAY_NAMES } from '@/config/menu';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [staff, setStaff] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        waitingVehicles: 0,
        inProgressJobs: 0,
        todayRevenue: 0,
        lowStockCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // @ts-ignore
        const token = session?.user?.accessToken;
        if (token) {
            api.get('/reports/dashboard-stats', token)
                .then(setStats)
                .catch((err: any) => console.warn('Dashboard stats unavailable:', err.message));
            getUsers().then((data: any) => {
                if (Array.isArray(data)) setStaff(data.slice(0, 10));
                setIsLoading(false);
            });
        }
    }, [session?.user]);

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
                                <tr className="text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                                            name={s.hoTen}
                                            role={s.vaiTro}
                                            status={s.trangThaiHoatDong ? 'online' : 'offline'}
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

function StaffRow({ name, role, status }: { name: string; role: string; status: 'online' | 'offline' }) {
    return (
        <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
            <td className="py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium dark:text-slate-200">
                        {name ? name.split(' ').map((n: string) => n[0]).slice(-2).join('') : '??'}
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{name || 'N/A'}</span>
                </div>
            </td>
            <td className="py-3 text-slate-600 dark:text-slate-400">{(ROLE_DISPLAY_NAMES as any)[role] || role}</td>
            <td className="py-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${status === 'online' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {status === 'online' ? 'Hoạt động' : 'Bị khóa'}
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
