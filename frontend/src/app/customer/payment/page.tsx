'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, CreditCard, Loader2 } from 'lucide-react';

export default function CustomerPaymentPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [qrData, setQrData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [qrLoading, setQrLoading] = useState(false);

    const token = (session?.user as any)?.accessToken;

    useEffect(() => {
        if (authStatus === 'unauthenticated') { router.push('/customer/login'); return; }
        if (authStatus !== 'authenticated') return;
        if (!token) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/customer/orders`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => {
                // Only show orders with debt > 0
                const withDebt = (data || []).filter((o: any) => o.debt > 0);
                setOrders(withDebt);
            })
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, [authStatus, session, router, token]);

    const loadQR = async (orderId: number) => {
        setQrLoading(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/customer/qr-payment/${orderId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            setQrData(data);
            setSelectedOrder(orderId);
        } catch {
            // Error handled silently
        } finally {
            setQrLoading(false);
        }
    };

    if (authStatus === 'loading' || loading) {
        return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
    }

    return (
        <div className="min-h-screen bg-stone-950">
            <header className="bg-stone-900 border-b border-stone-800 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link href="/customer/home" className="text-stone-500 hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
                    <h1 className="text-white font-bold">Thanh toán nhanh</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                {orders.length === 0 && !qrData ? (
                    <div className="text-center py-12">
                        <CreditCard size={48} className="text-stone-700 mx-auto mb-4" />
                        <p className="text-stone-500">Không có đơn hàng cần thanh toán</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {!qrData && orders.map((order: any) => (
                            <button
                                key={order.id}
                                onClick={() => loadQR(order.id)}
                                disabled={qrLoading}
                                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 text-left hover:border-orange-700 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-bold">{order.plate}</span>
                                    <span className="text-orange-400 font-bold">{Number(order.debt).toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="text-stone-500 text-sm">Đơn #{order.id} • Bấm để hiện mã QR</div>
                            </button>
                        ))}

                        {qrData && (
                            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 text-center">
                                <h3 className="text-white font-bold mb-4">Quét mã QR để thanh toán</h3>
                                <div className="bg-white rounded-xl p-4 inline-block mb-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={qrData.qrUrl}
                                        alt="VietQR Payment"
                                        width={256}
                                        height={256}
                                        className="w-64 h-64"
                                    />
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="text-stone-400">Ngân hàng: <span className="text-white">{qrData.bankId}</span></p>
                                    <p className="text-stone-400">Số TK: <span className="text-white">{qrData.accountNo}</span></p>
                                    <p className="text-stone-400">Chủ TK: <span className="text-white">{qrData.accountName}</span></p>
                                    <p className="text-stone-400">Số tiền: <span className="text-orange-400 font-bold text-lg">{Number(qrData.amount).toLocaleString('vi-VN')}đ</span></p>
                                    <p className="text-stone-400">Nội dung: <span className="text-white font-mono">{qrData.content}</span></p>
                                </div>
                                <button
                                    onClick={() => { setQrData(null); setSelectedOrder(null); }}
                                    className="mt-4 text-stone-500 hover:text-white transition-colors text-sm"
                                >
                                    ← Quay lại danh sách
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
