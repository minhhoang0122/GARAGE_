'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Loader2, AlertCircle, Car, User, Clock } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function TechnicalReviewPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<number | null>(null);

    useEffect(() => {
        if (authStatus === 'unauthenticated') { router.push('/admin/login'); return; }
        if (authStatus !== 'authenticated') return;

        fetchOrders();
    }, [authStatus, router]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = (session?.user as any)?.accessToken;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/mechanic/technical-review`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setOrders(data || []);
        } catch (error) {
            showToast('error', 'Không thể tải danh sách duyệt kỹ thuật');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (orderId: number, itemIds: number[]) => {
        setSubmitting(orderId);
        try {
            const token = (session?.user as any)?.accessToken;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/mechanic/jobs/${orderId}/confirm-technical`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(itemIds),
            });

            if (res.ok) {
                showToast('success', 'Đã duyệt kỹ thuật thành công');
                fetchOrders();
            } else {
                const err = await res.json();
                showToast('error', err.error || 'Duyệt thất bại');
            }
        } catch (error) {
            showToast('error', 'Lỗi kết nối');
        } finally {
            setSubmitting(null);
        }
    };

    if (authStatus === 'loading' || loading) {
        return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
    }

    return (
        <div className="min-h-screen bg-stone-950 text-stone-200 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Duyệt Kỹ Thuật Phát Sinh</h1>
                        <p className="text-stone-400">Kiểm tra và xác nhận các hạng mục thợ báo thêm trong quá trình sửa chữa.</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-12 text-center">
                        <CheckCircle size={48} className="text-stone-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-stone-400">Không có hạng mục nào đang chờ duyệt</h3>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                                <div className="bg-stone-800/50 px-6 py-4 border-b border-stone-700 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Car size={20} className="text-orange-500" />
                                            <span className="text-xl font-bold text-white uppercase">{order.plateNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-stone-400 text-sm">
                                            <User size={14} />
                                            <span>{order.customerName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-stone-400 text-sm">
                                            <Clock size={14} />
                                            <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                    <div className="text-stone-500 font-mono text-xs">#{order.id}</div>
                                </div>

                                <div className="p-6">
                                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Hạng mục chờ duyệt</h4>
                                    <div className="space-y-3">
                                        {order.items.filter((i: any) => i.itemStatus === 'CHO_KY_THUAT_DUYET').map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between bg-stone-950/50 border border-stone-800 rounded-lg p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-400">
                                                        {item.quantity}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium">{item.productName}</div>
                                                        <div className="text-stone-500 text-xs mt-0.5">Thợ đề xuất: {item.proposedByName}</div>
                                                    </div>
                                                </div>
                                                <AlertCircle size={16} className="text-orange-500/50" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 flex items-center justify-end gap-3 border-t border-stone-800 pt-6">
                                        <button 
                                            onClick={() => handleConfirm(order.id, order.items.filter((i: any) => i.itemStatus === 'CHO_KY_THUAT_DUYET').map((i: any) => i.id))}
                                            disabled={submitting === order.id}
                                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-emerald-900/20"
                                        >
                                            {submitting === order.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                            Duyệt Hết & Chuyển Sang Sale
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
