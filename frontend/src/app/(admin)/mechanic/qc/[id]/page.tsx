'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, AlertCircle, Car, User, Clock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { DashboardLayout } from '@/modules/common/components/layout';
import Link from 'next/link';

export default function OrderTechnicalReviewPage() {
    const { id } = useParams();
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const { showToast } = useToast();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (authStatus === 'unauthenticated') { router.push('/admin/login'); return; }
        if (authStatus !== 'authenticated') return;

        fetchOrder();
    }, [authStatus, id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const token = (session?.user as any)?.accessToken;
            // Fetch all pending and then filter for simplicity, or use a specific detail endpoint if exists
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/mechanic/technical-review`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            const specificOrder = data?.find((o: any) => o.id === Number(id));
            setOrder(specificOrder || { id: Number(id), items: [], notFound: true });
        } catch (error) {
            showToast('error', 'Không thể tải thông tin duyệt kỹ thuật');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!order || order.notFound) return;
        setSubmitting(true);
        try {
            const itemIds = order.items.filter((i: any) => i.itemStatus === 'CHO_KY_THUAT_DUYET').map((i: any) => i.id);
            const token = (session?.user as any)?.accessToken;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/mechanic/jobs/${id}/confirm-technical`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(itemIds),
            });

            if (res.ok) {
                showToast('success', 'Đã duyệt kỹ thuật thành công');
                router.push('/mechanic/qc');
            } else {
                const err = await res.json();
                showToast('error', err.error || 'Duyệt thất bại');
            }
        } catch (error) {
            showToast('error', 'Lỗi kết nối');
        } finally {
            setSubmitting(false);
        }
    };

    if (authStatus === 'loading' || loading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
    }

    const pendingItems = order?.items?.filter((i: any) => i.itemStatus === 'CHO_KY_THUAT_DUYET') || [];

    return (
        <DashboardLayout title="Nghiệm thu kỹ thuật" subtitle={`Xe: ${order?.plateNumber || '...'}`}>
            <div className="max-w-6xl mx-auto space-y-6 pb-20">
                <div className="flex items-center gap-4">
                    <Link href="/mechanic/qc" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-semibold text-sm">
                        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                    </Link>
                </div>

                {order?.notFound || pendingItems.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-20 text-center shadow-sm">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                            <CheckCircle size={40} className="text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Hồ sơ đã sạch!</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">Không có hạng mục nào đang chờ duyệt kỹ thuật cho xe này.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[11px] font-black text-slate-400 tracking-[0.2em] flex items-center gap-3 uppercase">
                                    Hạng mục chờ xác nhận
                                    <div className="h-[1px] w-20 bg-slate-200" />
                                </h4>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                                    {pendingItems.length} hạng mục cần duyệt
                                </span>
                            </div>

                            <div className="grid gap-4">
                                {pendingItems.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between bg-white border border-slate-200/60 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg font-black text-slate-800">
                                                {item.quantity}
                                            </div>
                                            <div>
                                                <div className="text-slate-900 font-bold text-lg tracking-tight">{item.productName}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kỹ thuật viên:</span>
                                                    <span className="text-slate-600 text-[11px] font-bold uppercase">{item.proposedByName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 text-slate-300">
                                            <AlertCircle size={22} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 flex items-center justify-between gap-6 border-t border-slate-100 pt-8">
                                <p className="text-xs text-slate-400 italic max-w-sm">
                                    * Việc xác nhận đồng nghĩa với việc bạn đã kiểm tra thực tế và chịu trách nhiệm về tính cần thiết của các hạng mục này.
                                </p>
                                
                                <button 
                                    onClick={handleConfirm}
                                    disabled={submitting}
                                    className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl shadow-emerald-900/10 active:scale-95"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            Cấp phép & Chuyển báo giá
                                            <CheckCircle size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
