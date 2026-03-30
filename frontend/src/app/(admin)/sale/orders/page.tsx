'use client';

import { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DashboardLayout } from '@/modules/common/components/layout';
import Link from 'next/link';
import { FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { getStatusBadge } from '@/lib/status';
import { formatCurrency } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchInput } from '@/modules/shared/components/ui/search-input';
import { useOrders } from '@/modules/sale/hooks/useSale';
import { useRealtimeUpdate } from '@/hooks/useRealtimeUpdate';
import { queryKeys } from '@/lib/query-keys';


export default function OrderListPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Filter state
    const keyword = searchParams.get('q') || '';

    const { data: orders = [], isLoading: loading } = useOrders();

    useRealtimeUpdate(queryKeys.order.all);
    useRealtimeUpdate(['sale', 'stats']);


    // Local Search - Fields are now normalized by mapOrder service
    const filteredOrders = orders.filter((o: any) =>
        o.plate?.toLowerCase().includes(keyword.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(keyword.toLowerCase())
    );

    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: filteredOrders.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 72,
        overscan: 5,
    });

    return (
        <DashboardLayout title="Danh sách đơn hàng" subtitle="Hệ thống quản lý chi tiết các đơn hàng dịch vụ">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                {/* Tools Bar */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
                    {/* Search */}
                    <SearchInput
                        placeholder="Tìm theo biển số, tên KH..."
                    />
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
                        {/* Desktop Table View */}
                        <div 
                            ref={parentRef}
                            className="hidden md:block overflow-auto max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
                        >
                                <div
                                    style={{
                                        height: `${rowVirtualizer.getTotalSize() + 48}px`,
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 transition-colors backdrop-blur-md flex items-center w-full">
                                            <th className="w-20 px-3 py-4 flex-shrink-0">Mã đơn</th>
                                            <th className="w-28 px-3 py-4 flex-shrink-0">Thời gian</th>
                                            <th className="w-32 px-3 py-4 flex-shrink-0">Biển số</th>
                                            <th className="px-3 py-4 flex-1 min-w-[200px]">Khách hàng</th>
                                            <th className="w-40 px-3 py-4 flex-shrink-0">Trạng thái</th>
                                            <th className="w-36 px-3 py-4 text-right flex-shrink-0">Tổng tiền</th>
                                            <th className="w-36 px-3 py-4 text-right flex-shrink-0">Còn nợ</th>
                                            <th className="w-24 px-3 py-4 text-right flex-shrink-0 pr-5 whitespace-nowrap">Chi tiết</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                            const order = filteredOrders[virtualRow.index];
                                            return (
                                                <tr 
                                                    key={order.id} 
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group flex items-center w-full border-b border-slate-100 dark:border-slate-800"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: `${virtualRow.size}px`,
                                                        transform: `translateY(${virtualRow.start + 48}px)`,
                                                    }}
                                                >
                                                    <td className="w-20 px-3 py-4 font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 truncate">
                                                        #{order.id}
                                                    </td>
                                                    <td className="w-28 px-3 py-4 text-slate-600 dark:text-slate-400 flex-shrink-0 tabular-nums truncate">
                                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                        <div className="text-[10px] opacity-70 font-medium">{new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </td>
                                                    <td className="w-32 px-3 py-4 font-black text-slate-800 dark:text-slate-100 flex-shrink-0 truncate">
                                                        {order.plate}
                                                        <div className="text-[9px] font-bold opacity-50 uppercase tracking-tighter truncate">{order.vehicleBrand} {order.vehicleModel}</div>
                                                    </td>
                                                    <td className="flex-1 px-3 py-4 text-slate-900 dark:text-slate-100 font-medium min-w-[200px] truncate">
                                                        {order.customerName}
                                                    </td>
                                                    <td className="w-40 px-3 py-4 flex-shrink-0 truncate">
                                                        {getStatusBadge(order.status)}
                                                    </td>
                                                    <td className="w-36 px-3 py-4 text-right font-black text-slate-900 dark:text-slate-100 tabular-nums flex-shrink-0 truncate">
                                                        {formatCurrency(Number(order.grandTotal)).replace('₫', '').trim()}
                                                    </td>
                                                    <td className="w-36 px-3 py-4 text-right flex-shrink-0 tabular-nums truncate">
                                                        {Number(order.debt) > 0 ? (
                                                            <span className="text-red-600 font-black">{formatCurrency(Number(order.debt)).replace('₫', '').trim()}</span>
                                                        ) : (
                                                            <span className="text-slate-400 text-[10px] font-bold uppercase">Paid</span>
                                                        )}
                                                    </td>
                                                    <td className="w-24 px-3 py-4 flex-shrink-0 flex justify-end pr-5">
                                                        <Link
                                                            href={`/sale/orders/${order.id}?source=list`}
                                                            className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all group-hover:gap-2"
                                                        >
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
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

