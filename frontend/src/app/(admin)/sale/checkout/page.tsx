'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Card, CardContent } from '@/modules/shared/components/ui/card';
import { Button } from '@/modules/shared/components/ui/button';
import { Badge } from '@/modules/shared/components/ui/badge';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Banknote, Clock, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { SearchInput } from '@/modules/shared/components/ui/search-input';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Order {
    id: number;
    plate: string;
    customerName: string;
    customerPhone: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    subTime: string;
}

export default function SaleCheckoutPage() {
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    // Initialize keyword from URL to persist state
    const searchKeyword = searchParams.get('q') || '';

    // @ts-ignore
    const token = session?.user?.accessToken;

    const { data: orders = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['checkout', 'orders'],
        queryFn: async () => {
            if (!token) return [];
            // Fetch orders and filter those with remaining debt
            const res = await api.get('/sale/orders', token);
            const allOrders = res || [];
            // Handle both mapped property names: remainingAmount or debt
            return allOrders
                .filter((o: any) => (o.remainingAmount || o.debt || 0) > 0)
                .map((o: any) => ({
                    ...o,
                    totalAmount: o.totalAmount || o.grandTotal || 0,
                    remainingAmount: o.remainingAmount || o.debt || 0,
                    subTime: o.subTime || o.createdAt || new Date().toISOString()
                }));
        },
        enabled: !!token,
        staleTime: 30000 // 30s cache
    });

    const filteredOrders = useMemo(() => orders.filter((order: Order) =>
        order.plate?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        order.customerPhone?.includes(searchKeyword)
    ), [orders, searchKeyword]);

    const totalPending = useMemo(() => orders.reduce((sum: number, o: Order) => sum + (o.remainingAmount || 0), 0), [orders]);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['checkout', 'orders'] });
    };

    return (
        <DashboardLayout title="Thu ngân" subtitle="Danh sách đơn hàng chờ thanh toán">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Đang chờ thanh toán</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{orders.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tổng còn nợ</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalPending)}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Hôm nay</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">--</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 transition-colors">
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <SearchInput
                                placeholder="Tìm theo biển số, tên khách, SĐT..."
                            />
                        </div>
                        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Orders List */}
                {loading && orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-600" />
                        <p className="mt-2 text-slate-500 dark:text-slate-400">Đang tải...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <CreditCard className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p>Không có đơn hàng chờ thanh toán</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order: Order) => (
                            <Card key={order.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{order.plate}</h3>
                                                <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                                                    Chờ thanh toán
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {order.customerName} • {order.customerPhone}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                Đơn #{order.id} • {new Date(order.subTime).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <div className="flex flex-col md:items-end gap-2">
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Tổng tiền</p>
                                                <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{formatCurrency(order.totalAmount)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Còn lại</p>
                                                <p className="font-bold text-lg text-red-600 dark:text-red-400">{formatCurrency(order.remainingAmount)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/sale/orders/${order.id}`}>
                                                <Button variant="outline">Xem chi tiết</Button>
                                            </Link>
                                            <Link href={`/sale/orders/${order.id}`}>
                                                <Button className="bg-green-600 hover:bg-green-700">
                                                    <Banknote className="w-4 h-4 mr-2" />
                                                    Thu tiền
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
