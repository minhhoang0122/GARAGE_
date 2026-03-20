'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/modules/common/components/layout';
import Link from 'next/link';
import { FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { getStatusBadge } from '@/lib/status';
import { formatCurrency } from '@/lib/utils';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SearchInput } from '@/modules/shared/components/ui/search-input';

export default function OrderListPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const filter = searchParams.get('filter') || 'ALL';
    const keyword = searchParams.get('q') || '';

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                // @ts-ignore
                const token = session?.user?.accessToken;
                if (!token) return;

                let endpoint = '/sale/orders';
                const queryParams = new URLSearchParams();

                if (filter === 'WARRANTY') {
                    queryParams.set('status', 'WARRANTY');
                }

                // If backend supports searching in the same API, add 'q'
                // Currently backend getOrders(statusFilter) handles status.
                // We might need to filter 'q' locally if backend doesn't support it yet.

                const res = await api.get(`${endpoint}?${queryParams.toString()}`, token);
                setOrders(res || []);
            } catch (e) {
                console.error('Failed to fetch orders', e);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchOrders();
        }
    }, [session, filter]);

    // Update URL when filter changes
    const setFilter = (newFilter: string) => {
        const params = new URLSearchParams(searchParams);
        if (newFilter === 'ALL') params.delete('filter');
        else params.set('filter', newFilter);
        router.replace(`${pathname}?${params.toString()}`);
    };

    // Local Search
    const filteredOrders = orders.filter(o =>
        o.plate?.toLowerCase().includes(keyword.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(keyword.toLowerCase())
    );

    return (
        <DashboardLayout title="Danh sách đơn hàng" subtitle="Quản lý tất cả đơn hàng và bảo hành">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                {/* Tools Bar */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">

                    {/* Search */}
                    {/* Search */}
                    <SearchInput
                        placeholder="Tìm theo biển số, tên KH..."
                    />

                    {/* Filter Buttons */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'ALL'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilter('WARRANTY')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${filter === 'WARRANTY'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border-l-4 border-l-slate-900'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <ShieldCheck className="w-4 h-4" /> Còn bảo hành
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">Đang tải dữ liệu...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                            <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Không tìm thấy đơn hàng nào</h3>
                        <p className="max-w-md mx-auto">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px] table-fixed">
                                <colgroup>
                                    <col className="w-[80px]" />
                                    <col className="w-[120px]" />
                                    <col className="w-[140px]" />
                                    <col />
                                    <col className="w-[160px]" />
                                    <col className="w-[150px]" />
                                    <col className="w-[150px]" />
                                    <col className="w-[100px]" />
                                </colgroup>
                                <thead>
                                    <tr className="bg-stone-100 dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">
                                        <th className="px-3 py-4">Mã đơn</th>
                                        <th className="px-3 py-4">Thời gian</th>
                                        <th className="px-3 py-4">Biển số</th>
                                        <th className="px-3 py-4">Khách hàng</th>
                                        <th className="px-3 py-4">Trạng thái</th>
                                        <th className="px-3 py-4 text-right">Tổng tiền</th>
                                        <th className="px-3 py-4 text-right">Còn nợ</th>
                                        <th className="px-3 py-4 text-right">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-transparent">
                                    {filteredOrders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                                            <td className="px-3 py-4 font-bold text-blue-600 dark:text-blue-400 border-b border-stone-100 dark:border-slate-800">
                                                #{order.id}
                                            </td>
                                            <td className="px-3 py-4 text-stone-600 dark:text-slate-400 border-b border-stone-100 dark:border-slate-800 tabular-nums">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                <div className="text-[10px] opacity-70 font-medium">{new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="px-3 py-4 font-black text-stone-800 dark:text-slate-100 border-b border-stone-100 dark:border-slate-800">
                                                {order.plate}
                                                <div className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">{order.vehicleBrand} {order.vehicleModel}</div>
                                            </td>
                                            <td className="px-3 py-4 text-stone-900 dark:text-slate-100 border-b border-stone-100 dark:border-slate-800 font-medium">
                                                {order.customerName}
                                            </td>
                                            <td className="px-3 py-4 border-b border-stone-100 dark:border-slate-800">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-3 py-4 text-right font-black text-stone-900 dark:text-slate-100 border-b border-stone-100 dark:border-slate-800 tabular-nums">
                                                {formatCurrency(Number(order.grandTotal)).replace('₫', '').trim()}
                                            </td>
                                            <td className="px-3 py-4 text-right border-b border-stone-100 dark:border-slate-800 tabular-nums">
                                                {Number(order.debt) > 0 ? (
                                                    <span className="text-red-600 font-black">{formatCurrency(Number(order.debt)).replace('₫', '').trim()}</span>
                                                ) : (
                                                    <span className="text-stone-400 text-[10px] font-bold uppercase">Paid</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-4 text-right border-b border-stone-100 dark:border-slate-800">
                                                <Link
                                                    href={`/sale/orders/${order.id}?source=list`}
                                                    className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all group-hover:gap-2"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 gap-3 p-3">
                            {filteredOrders.map((order: any) => (
                                <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm space-y-2">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">#{order.id}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                                            </div>
                                            <Link href={`/sale/orders/${order.id}?source=list`} className="block font-bold text-base text-slate-900 dark:text-slate-100 hover:text-indigo-600 truncate">
                                                {order.plate}
                                            </Link>
                                            <p className="text-xs text-slate-500 truncate">{order.vehicleBrand} {order.vehicleModel}</p>
                                        </div>
                                        <div className="flex-shrink-0 scale-90 origin-top-right">
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end pt-2 border-t border-slate-50 dark:border-slate-800">
                                        <div className="text-xs text-slate-600 dark:text-slate-300 max-w-[50%]">
                                            <p className="font-medium truncate">{order.customerName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-bold text-slate-900 dark:text-white leading-none">{formatCurrency(Number(order.grandTotal))}</p>
                                            {Number(order.debt) > 0 ? (
                                                <p className="text-[10px] text-red-500 mt-1 font-medium">Nợ: {formatCurrency(Number(order.debt))}</p>
                                            ) : (
                                                <p className="text-[10px] text-green-600 mt-1 font-medium">Đã thanh toán</p>
                                            )}
                                        </div>
                                    </div>

                                    <Link
                                        href={`/sale/orders/${order.id}?source=list`}
                                        className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 rounded border border-slate-100 dark:border-slate-700 font-medium text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Xem chi tiết
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
