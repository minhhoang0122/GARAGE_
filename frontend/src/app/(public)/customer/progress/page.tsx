'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, Wrench, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    TIEP_NHAN: { label: 'Tiếp nhận', color: 'text-stone-400 bg-stone-800', icon: Clock },
    CHO_CHAN_DOAN: { label: 'Chờ chẩn đoán', color: 'text-yellow-400 bg-yellow-900/30', icon: Clock },
    CHO_KH_DUYET: { label: 'Chờ duyệt báo giá', color: 'text-orange-400 bg-orange-900/30', icon: AlertCircle },
    DA_DUYET: { label: 'Đã duyệt', color: 'text-blue-400 bg-blue-900/30', icon: CheckCircle },
    CHO_SUA_CHUA: { label: 'Chờ sửa chữa', color: 'text-yellow-400 bg-yellow-900/30', icon: Wrench },
    DANG_SUA: { label: 'Đang sửa chữa', color: 'text-blue-400 bg-blue-900/30', icon: Wrench },
    CHO_KCS: { label: 'Kiểm tra chất lượng', color: 'text-purple-400 bg-purple-900/30', icon: CheckCircle },
    CHO_THANH_TOAN: { label: 'Chờ thanh toán', color: 'text-orange-400 bg-orange-900/30', icon: AlertCircle },
    BAO_GIA_LAI: { label: 'Báo giá bổ sung', color: 'text-orange-500 bg-orange-900/50', icon: AlertCircle },
    HOAN_THANH: { label: 'Hoàn thành', color: 'text-emerald-400 bg-emerald-900/30', icon: CheckCircle },
    DONG: { label: 'Đã đóng', color: 'text-stone-400 bg-stone-800', icon: CheckCircle },
};

import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSSE } from '@/hooks/useSSE';

export default function CustomerProgressPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();

    // @ts-ignore
    const token = session?.user?.accessToken;

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.push('/customer/login');
        }
    }, [authStatus, router]);

    const queryClient = useQueryClient();

    const { data: orders = [], isLoading: dataLoading } = useQuery({
        queryKey: ['customer-orders-active'],
        queryFn: async () => {
            const data = await api.get('/customer/orders', token);
            return (data || []).filter((o: any) => !['HOAN_THANH', 'DONG', 'HUY'].includes(o.status));
        },
        enabled: authStatus === 'authenticated' && !!token,
    });

    // Real-time update via SSE
    useSSE('notification', () => {
        queryClient.invalidateQueries({ queryKey: ['customer-orders-active'] });
    });

    const loading = authStatus === 'loading' || dataLoading;

    if (loading) {
        return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
    }

    return (
        <div className="min-h-screen bg-stone-950">
            <header className="bg-stone-900 border-b border-stone-800 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link href="/customer/home" className="text-stone-500 hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
                    <h1 className="text-white font-bold">Tiến độ sửa chữa</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Car size={48} className="text-stone-700 mx-auto mb-4" />
                        <p className="text-stone-500">Không có xe đang sửa chữa</p>
                    </div>
                ) : (
                    orders.map((order: any) => {
                        const st = statusMap[order.status] || statusMap.TIEP_NHAN;
                        const Icon = st.icon;
                        return (
                            <div key={order.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Car size={16} className="text-stone-400" />
                                        <span className="text-white font-bold">{order.plate}</span>
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>
                                        <Icon size={12} className="inline mr-1" />{st.label}
                                    </span>
                                </div>
                                <div className="text-stone-500 text-sm">
                                    Đơn #{order.id} • {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}
                                </div>
                                {order.total > 0 && (
                                    <div className="mt-2 text-stone-400 text-sm">
                                        Tổng: <span className="text-white font-medium">{Number(order.total).toLocaleString('vi-VN')}đ</span>
                                        {order.debt > 0 && <span className="text-orange-400 ml-2">Còn nợ: {Number(order.debt).toLocaleString('vi-VN')}đ</span>}
                                    </div>
                                )}
                                <div className="mt-4 pt-4 border-t border-stone-800 flex justify-end">
                                    <Link 
                                        href={`/customer/orders/${order.id}`}
                                        className="text-orange-500 text-sm font-bold hover:underline"
                                    >
                                        Xem chi tiết & Duyệt báo giá →
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </main>
        </div>
    );
}
