'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, CheckCircle, XCircle, Loader2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function CustomerOrderDetailPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const params = useParams();
    const orderId = params.id;
    const { showToast } = useToast();
    
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (authStatus === 'unauthenticated') { router.push('/customer/login'); return; }
        if (authStatus !== 'authenticated') return;
        fetchOrder();
    }, [authStatus, orderId]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const token = (session?.user as any)?.accessToken;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/customer/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setOrder(data);
        } catch (error) {
            showToast('error', 'Không thể tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm('Bạn đồng ý với báo giá này?')) return;
        setSubmitting(true);
        try {
            const token = (session?.user as any)?.accessToken;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/customer/orders/${orderId}/approve`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                showToast('success', 'Đã duyệt báo giá thành công');
                fetchOrder();
            } else {
                showToast('error', 'Duyệt thất bại');
            }
        } catch (error) {
            showToast('error', 'Lỗi kết nối');
        } finally {
            setSubmitting(false);
        }
    };

    if (authStatus === 'loading' || loading) {
        return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
    }

    if (!order) return <div className="min-h-screen bg-stone-950 p-6 text-white">Không tìm thấy đơn hàng</div>;

    const isPendingQuote = order.status === 'CHO_KH_DUYET' || order.status === 'BAO_GIA_LAI';

    return (
        <div className="min-h-screen bg-stone-950 text-stone-200 pb-20">
            <header className="bg-stone-900 border-b border-stone-800 px-4 py-3 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link href="/customer/progress" className="text-stone-500 hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
                    <h1 className="text-white font-bold text-center flex-1 pr-6">Chi tiết đơn hàng #{order.id}</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Vehicle Header */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Car className="text-orange-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">{order.plateNumber}</h2>
                            <p className="text-stone-500 text-sm uppercase font-bold tracking-tighter">{order.carBrand} {order.carModel}</p>
                        </div>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                        isPendingQuote ? 'bg-orange-900/30 text-orange-500 border border-orange-500/30' : 'bg-stone-800 text-stone-400'
                    }`}>
                        {isPendingQuote ? <AlertCircle size={12} /> : <Clock size={12} />}
                        {order.status === 'BAO_GIA_LAI' ? 'BÁO GIÁ BỔ SUNG' : order.status}
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Danh sách hạng mục</h3>
                    {order.items.map((item: any) => (
                        <div key={item.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex justify-between items-start">
                            <div>
                                <div className="text-white font-medium flex items-center gap-2">
                                    {item.productName}
                                    {item.isWarranty && <span className="bg-emerald-900/30 text-emerald-500 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/20">BẢO HÀNH</span>}
                                </div>
                                <div className="text-stone-500 text-xs mt-1">
                                    Số lượng: {item.quantity} • Đơn giá: {Number(item.unitPrice).toLocaleString('vi-VN')}đ
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-bold">{Number(item.totalPrice).toLocaleString('vi-VN')}đ</div>
                                <div className={`text-[10px] mt-1 font-bold ${
                                    item.itemStatus === 'KHACH_DONG_Y' ? 'text-emerald-500' : 
                                    item.itemStatus === 'KHACH_TU_CHOI' ? 'text-red-500' : 'text-stone-500'
                                }`}>
                                    {item.itemStatus === 'DE_XUAT' ? 'CHỜ DUYỆT' : item.itemStatus}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between text-stone-500 text-sm">
                        <span>Tạm tính</span>
                        <span>{Number(order.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                    {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-500 text-sm">
                            <span>Chiết khấu</span>
                            <span>-{Number(order.discount).toLocaleString('vi-VN')}đ</span>
                        </div>
                    )}
                    <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-stone-800">
                        <span>Tổng cộng</span>
                        <span className="text-orange-500">{Number(order.finalAmount || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>

                {/* Info Alert for Pending Quotes */}
                {isPendingQuote && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex gap-3">
                        <AlertCircle className="text-orange-500 shrink-0" size={20} />
                        <p className="text-orange-200/80 text-sm italic">
                            Quý khách vui lòng kiểm tra kỹ các hạng mục phát sinh được thợ chẩn đoán thêm. Các hạng mục này là cần thiết để đảm bảo an toàn vận hành.
                        </p>
                    </div>
                )}
            </main>

            {/* Sticky Action Footer */}
            {isPendingQuote && (
                <div className="fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-800 p-4 shadow-2xl z-20">
                    <div className="max-w-2xl mx-auto flex gap-3">
                        <button 
                            className="flex-1 bg-stone-800 hover:bg-stone-700 text-white font-bold py-4 rounded-xl transition-all"
                            onClick={() => showToast('info', 'Vui lòng liên hệ hotline 1900xxxx để yêu cầu chỉnh sửa báo giá')}
                        >
                            Phản hồi
                        </button>
                        <button 
                            disabled={submitting}
                            onClick={handleApprove}
                            className="flex-[2] bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {submitting ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                            ĐỒNG Ý SỬA CHỮA
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
