'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyOrders } from '@/modules/customer/customer';
import { Card, CardContent } from '@/modules/shared/components/ui/card';
import { Badge } from '@/modules/shared/components/ui/badge';
import { Car, Clock, Wallet } from 'lucide-react';

const statusMap: Record<string, { label: string; color: string }> = {
    'CHO_KH_DUYET': { label: 'Chờ duyệt', color: 'bg-yellow-500' },
    'BAO_GIA_LAI': { label: 'Đang sửa báo giá', color: 'bg-orange-500' },
    'DA_DUYET': { label: 'Đã duyệt', color: 'bg-blue-500' },
    'DANG_SUA': { label: 'Đang sửa', color: 'bg-indigo-500' },
    'CHO_THANH_TOAN': { label: 'Chờ thanh toán', color: 'bg-purple-500' },
    'HOAN_THANH': { label: 'Hoàn thành', color: 'bg-green-500' },
    'DONG': { label: 'Đã đóng', color: 'bg-slate-500' },
    'HUY': { label: 'Đã hủy', color: 'bg-red-500' },
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

import { useQuery } from '@tanstack/react-query';

export default function CustomerOrdersPage() {
    const router = useRouter();

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['customer', 'orders'],
        queryFn: async () => {
            const data = await getMyOrders();
            return data || [];
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Đơn sửa chữa của tôi</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Theo dõi tình trạng xe và duyệt báo giá</p>
                </header>

                {orders.length === 0 ? (
                    <Card className="text-center py-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <CardContent>
                            <Car className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400">Bạn chưa có đơn sửa chữa nào</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const status = statusMap[order.status] || { label: order.status, color: 'bg-slate-400' };
                            return (
                                <Card
                                    key={order.id}
                                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all cursor-pointer group"
                                    onClick={() => router.push(`/customer/orders/${order.id}`)}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center transition-colors">
                                                    <Car className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{order.plate}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={`${status.color} text-white border-0`}>
                                                    {status.label}
                                                </Badge>
                                                <div className="mt-2 flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                                    <Wallet className="w-4 h-4" />
                                                    <span className="font-medium">{formatCurrency(order.total || 0)}</span>
                                                </div>
                                                {order.debt > 0 && (
                                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">Còn nợ: {formatCurrency(order.debt)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
