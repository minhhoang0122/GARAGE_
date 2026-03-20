'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, CheckCircle, Loader2 } from 'lucide-react';

export default function CustomerHistoryPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authStatus === 'unauthenticated') { router.push('/customer/login'); return; }
        if (authStatus !== 'authenticated') return;

        const token = (session?.user as any)?.accessToken;
        if (!token) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/customer/orders`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => {
                // Filter completed orders
                const completed = (data || []).filter((o: any) => ['HOAN_THANH', 'DONG'].includes(o.status));
                setOrders(completed);
            })
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, [authStatus, session, router]);

    if (authStatus === 'loading' || loading) {
        return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
    }

    return (
        <div className="min-h-screen bg-stone-950">
            <header className="bg-stone-900 border-b border-stone-800 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link href="/customer/home" className="text-stone-500 hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
                    <h1 className="text-white font-bold">Lịch sử sửa chữa</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle size={48} className="text-stone-700 mx-auto mb-4" />
                        <p className="text-stone-500">Chưa có lịch sử sửa chữa</p>
                    </div>
                ) : (
                    orders.map((order: any) => (
                        <div key={order.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Car size={16} className="text-stone-400" />
                                    <span className="text-white font-bold">{order.plate}</span>
                                </div>
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium text-emerald-400 bg-emerald-900/30">
                                    Hoàn thành
                                </span>
                            </div>
                            <div className="text-stone-500 text-sm">
                                Đơn #{order.id} • {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}
                            </div>
                            <div className="mt-2 text-stone-400 text-sm">
                                Tổng: <span className="text-white font-medium">{Number(order.total || 0).toLocaleString('vi-VN')}đ</span>
                                {order.paid > 0 && <span className="text-emerald-400 ml-2">Đã trả: {Number(order.paid).toLocaleString('vi-VN')}đ</span>}
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
