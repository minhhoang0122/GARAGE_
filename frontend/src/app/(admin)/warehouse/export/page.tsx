'use client';

import { DashboardLayout } from '@/modules/common/components/layout';
import { usePendingExports } from '@/modules/warehouse/hooks/useWarehouse';
import Link from 'next/link';
import { getStatusBadge } from '@/lib/status';
import { Package, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { useRealtimeUpdate } from '@/hooks/useRealtimeUpdate';
import { queryKeys } from '@/lib/query-keys';


export default function ExportListPage() {
    const { data: orders = [], isLoading, isError } = usePendingExports();

    useRealtimeUpdate(queryKeys.warehouse.all);


    return (
        <DashboardLayout title="Xuất Kho" subtitle="Danh sách đơn hàng cần xuất vật tư">
            <div className="max-w-5xl mx-auto">


                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Đơn hàng chờ xuất kho</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Các đơn hàng đã được khách duyệt, cần xuất vật tư cho thợ
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                            <p>Đang tải danh sách...</p>
                        </div>
                    ) : isError ? (
                        <div className="px-6 py-12 text-center text-red-500">
                            <p>Không thể tải danh sách đơn hàng</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                            <p>Không có đơn hàng nào cần xuất kho</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse ">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                    <th className="px-6 py-3 text-left hidden md:table-cell">Mã đơn</th>
                                    <th className="px-6 py-3 text-left">Xe / Khách hàng</th>
                                    <th className="px-6 py-3 text-center hidden sm:table-cell">Số mục</th>
                                    <th className="px-6 py-3 text-right hidden lg:table-cell">Giá trị</th>
                                    <th className="px-6 py-3 text-center">Trạng thái</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {orders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                DH{order.id.toString().padStart(4, '0')}
                                            </span>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[120px] sm:max-w-none">{order.plate}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[120px] sm:max-w-none">{order.customerName}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center hidden sm:table-cell">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{order.itemCount}</span>
                                            <span className="text-sm text-slate-500 dark:text-slate-400"> mục</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-slate-200 hidden lg:table-cell">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalValue)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(order.hasExported ? 'XUAT_KHO' : 'CHO_XUAT')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/warehouse/export/${order.id}`}
                                                className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm"
                                            >
                                                Chi tiết <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
