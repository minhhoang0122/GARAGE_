'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, ShieldAlert, ShieldOff, Loader2, AlertCircle, CheckCircle, Car } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    CON_HAN: { label: 'Còn bảo hành', color: 'text-emerald-400 bg-emerald-900/30 border-emerald-800', icon: ShieldCheck },
    HET_HAN: { label: 'Hết hạn', color: 'text-stone-400 bg-stone-800 border-stone-700', icon: ShieldOff },
    DA_BAO_HANH: { label: 'Đã bảo hành', color: 'text-blue-400 bg-blue-900/30 border-blue-800', icon: ShieldAlert },
};

export default function CustomerWarrantyPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [claimLoading, setClaimLoading] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const token = (session?.user as any)?.accessToken;

    useEffect(() => {
        if (authStatus === 'unauthenticated') { router.push('/customer/login'); return; }
        if (authStatus !== 'authenticated') return;
        if (!token) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/customer/warranty`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => setItems(data || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [authStatus, session, router, token]);

    const handleClaim = async (orderId: number, itemId: number) => {
        setClaimLoading(itemId);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/customer/warranty-claim`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId, itemIds: [itemId], currentOdo: null }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setErrorMsg(data.message || 'Yêu cầu bảo hành thất bại.');
            } else {
                setSuccessMsg(data.message || 'Yêu cầu bảo hành đã được ghi nhận!');
                // Update item status locally
                setItems(prev => prev.map(i =>
                    i.orderItemId === itemId ? { ...i, warrantyStatus: 'DA_BAO_HANH', daBaoHanh: true } : i
                ));
            }
        } catch {
            setErrorMsg('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setClaimLoading(null);
        }
    };

    if (authStatus === 'loading' || loading) {
        return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
    }

    // Group items by orderId for better display
    const grouped: Record<number, any[]> = {};
    items.forEach((item: any) => {
        if (!grouped[item.orderId]) grouped[item.orderId] = [];
        grouped[item.orderId].push(item);
    });

    return (
        <div className="min-h-screen bg-stone-950">
            <header className="bg-stone-900 border-b border-stone-800 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link href="/customer/home" className="text-stone-500 hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
                    <h1 className="text-white font-bold">Thông tin bảo hành</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {successMsg && (
                    <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-3 flex items-center gap-2 text-emerald-300 text-sm">
                        <CheckCircle size={16} className="shrink-0" />{successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 flex items-center gap-2 text-red-300 text-sm">
                        <AlertCircle size={16} className="shrink-0" />{errorMsg}
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="text-center py-12">
                        <ShieldCheck size={48} className="text-stone-700 mx-auto mb-4" />
                        <p className="text-stone-500">Không có hạng mục bảo hành</p>
                        <p className="text-stone-600 text-sm mt-1">Các hạng mục có chính sách bảo hành sẽ xuất hiện ở đây sau khi hoàn thành sửa chữa.</p>
                    </div>
                ) : (
                    Object.entries(grouped).map(([orderId, orderItems]) => {
                        const first = orderItems[0];
                        return (
                            <div key={orderId} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                                {/* Order header */}
                                <div className="px-4 py-3 border-b border-stone-800 flex items-center gap-2 bg-stone-850">
                                    <Car size={14} className="text-stone-500" />
                                    <span className="text-white font-bold text-sm">{first.plate}</span>
                                    <span className="text-stone-500 text-xs">• Đơn #{orderId}</span>
                                    <span className="text-stone-600 text-xs ml-auto">
                                        {first.ngaySuaChua ? new Date(first.ngaySuaChua).toLocaleDateString('vi-VN') : ''}
                                    </span>
                                </div>
                                {/* Items */}
                                <div className="divide-y divide-stone-800">
                                    {orderItems.map((item: any) => {
                                        const st = statusConfig[item.warrantyStatus] || statusConfig.HET_HAN;
                                        const Icon = st.icon;
                                        return (
                                            <div key={item.orderItemId} className="px-4 py-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">{item.productName}</p>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-stone-500">
                                                            {item.baoHanhThang > 0 && (() => {
                                                                let remainMonths = 0;
                                                                if (item.ngayHetHan && item.warrantyStatus === 'CON_HAN') {
                                                                    const now = new Date();
                                                                    const exp = new Date(item.ngayHetHan);
                                                                    remainMonths = Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                                                                }
                                                                return (
                                                                    <span>⏱ {item.baoHanhThang} tháng
                                                                        {item.warrantyStatus === 'CON_HAN' && remainMonths > 0 && (
                                                                            <span className="text-emerald-400 font-medium"> — còn {remainMonths} tháng</span>
                                                                        )}
                                                                        {item.ngayHetHan && <span className="text-stone-600"> (đến {new Date(item.ngayHetHan).toLocaleDateString('vi-VN')})</span>}
                                                                    </span>
                                                                );
                                                            })()}
                                                            {item.baoHanhKm > 0 && (
                                                                <span>🛣️ {item.baoHanhKm.toLocaleString('vi-VN')} km
                                                                    {item.maxKm && <span className="text-stone-600"> (tối đa {item.maxKm.toLocaleString('vi-VN')} km)</span>}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${st.color}`}>
                                                            <Icon size={10} className="inline mr-1" />{st.label}
                                                        </span>
                                                        {item.warrantyStatus === 'CON_HAN' && (
                                                            <button
                                                                onClick={() => handleClaim(item.orderId, item.orderItemId)}
                                                                disabled={claimLoading === item.orderItemId}
                                                                className="text-xs bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 text-white font-medium px-3 py-1 rounded-lg transition-colors whitespace-nowrap"
                                                            >
                                                                {claimLoading === item.orderItemId ? 'Đang gửi...' : 'Yêu cầu bảo hành'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </main>
        </div>
    );
}
