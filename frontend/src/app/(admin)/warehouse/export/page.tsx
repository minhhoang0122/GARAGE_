import { DashboardLayout } from '@/modules/common/components/layout';
import { getPendingExportOrders } from '@/modules/inventory/warehouse';
import Link from 'next/link';
import { getStatusBadge } from '@/lib/status';
import { Package, ChevronRight, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ExportListPage() {
    const orders = await getPendingExportOrders();

    return (
        <DashboardLayout title="Xuất Kho" subtitle="Danh sách đơn hàng cần xuất vật tư">
            <div className="max-w-5xl mx-auto">


                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto transition-colors">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Đơn hàng chờ xuất kho</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Các đơn hàng đã được khách duyệt, cần xuất vật tư cho thợ
                        </p>
                    </div>

                    {orders.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                            <p>Không có đơn hàng nào cần xuất kho</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                    <th className="px-6 py-3 text-left">Mã đơn</th>
                                    <th className="px-6 py-3 text-left">Xe / Khách hàng</th>
                                    <th className="px-6 py-3 text-center">Số mục</th>
                                    <th className="px-6 py-3 text-right">Giá trị</th>
                                    <th className="px-6 py-3 text-center">Trạng thái</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {orders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                DH{order.id.toString().padStart(4, '0')}
                                            </span>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-800 dark:text-slate-200">{order.plate}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{order.customerName}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{order.itemCount}</span>
                                            <span className="text-sm text-slate-500 dark:text-slate-400"> phụ tùng</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-slate-200">
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
