'use client';

import { useMemo } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Package, PackageMinus, AlertTriangle, TrendingDown, History } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import IndustrialStatCard from '@/modules/shared/components/common/IndustrialStatCard';
import { Card } from '@/modules/shared/components/ui/card';
import { useQuery } from '@tanstack/react-query';

export default function WarehouseDashboard() {
    const { data: session } = useSession();
    // @ts-ignore
    const token = session?.user?.accessToken;

    const { data: stats = { pendingOrders: 0, lowStockItems: 0, recentExports: 0, recentImports: 0 } } = useQuery({
        queryKey: ['warehouse', 'stats'],
        queryFn: () => api.get('/warehouse/stats', token),
        enabled: !!token
    });

    const { data: pendingOrders = [] } = useQuery({
        queryKey: ['warehouse', 'pending'],
        queryFn: () => api.get('/warehouse/pending', token),
        enabled: !!token
    });

    const { data: products = [] } = useQuery({
        queryKey: ['warehouse', 'products'],
        queryFn: () => api.get('/warehouse/products', token),
        enabled: !!token
    });

    const lowStockItems = useMemo(() => 
        products.filter((p: any) => !p.isService && p.stock <= (p.minStock || 10)),
        [products]
    );

    const pendingCount = stats.pendingOrders;

    return (
        <DashboardLayout title="Kho" subtitle="Quản lý xuất nhập kho">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Stats Cards - Industrial Redesign */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Link href="/warehouse/export" className="block group">
                        <IndustrialStatCard
                            icon={<PackageMinus />}
                            value={pendingCount.toString()}
                            label="Đơn chờ xuất kho"
                            color="blue"
                        />
                    </Link>

                    <Link href="/warehouse/inventory" className="block group">
                        <IndustrialStatCard
                            icon={<AlertTriangle />}
                            value={stats.lowStockItems.toString()}
                            label="Sắp hết hàng"
                            color="yellow"
                        />
                    </Link>

                    <Link href="/warehouse/import" className="block group">
                        <IndustrialStatCard
                            icon={<Package />}
                            value={stats.recentImports.toString()}
                            label="Nhập kho hôm nay"
                            color="green"
                        />
                    </Link>

                    <Link href="/warehouse/history" className="block group">
                        <IndustrialStatCard
                            icon={<History />}
                            value={stats.recentExports.toString()}
                            label="Xuất kho hôm nay"
                            color="slate"
                        />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Đơn chờ xuất */}
                    <Card className="overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Đơn chờ xuất kho</h2>
                            <Link href="/warehouse/export" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                Xem tất cả
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {pendingOrders.filter((o: any) => !o.hasExported).slice(0, 5).map((order: any) => (
                                <Link
                                    key={order.id}
                                    href={`/warehouse/export/${order.id}`}
                                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">DH{order.id.toString().padStart(4, '0')}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{order.plate} - {order.customerName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{order.itemCount} mục</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            {pendingOrders.filter((o: any) => !o.hasExported).length === 0 && (
                                <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                    Không có đơn nào chờ xuất kho
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Cảnh báo tồn kho */}
                    <Card className="overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Cảnh báo tồn kho thấp</h2>
                            <Link href="/warehouse/inventory" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                Xem kho
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {lowStockItems.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{item.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.code}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${item.stock <= 0 ? 'text-red-600 dark:text-red-400' : item.stock <= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                            {item.stock}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                                            <TrendingDown className="w-3 h-3" />
                                            <span>Thấp</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {lowStockItems.length === 0 && (
                                <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                    Tất cả hàng hóa đều đủ tồn kho
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
