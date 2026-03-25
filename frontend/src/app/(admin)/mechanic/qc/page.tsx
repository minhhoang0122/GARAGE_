'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle, Loader2, AlertCircle, Car, User, Clock, ChevronRight } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { DashboardLayout } from '@/modules/common/components/layout';
import Link from 'next/link';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function TechnicalReviewPage() {
    const queryClient = useQueryClient();
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const { showToast } = useToast();

    // @ts-ignore
    const token = session?.user?.accessToken;

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['mechanic-qc-orders'],
        queryFn: async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
            const res = await fetch(`${apiUrl}/api/mechanic/technical-review`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch orders');
            return await res.json();
        },
        enabled: !!token && authStatus === 'authenticated'
    });

    const confirmMutation = useMutation({
        mutationFn: async ({ orderId, itemIds }: { orderId: number, itemIds: number[] }) => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
            const res = await fetch(`${apiUrl}/api/mechanic/jobs/${orderId}/confirm-technical`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(itemIds),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Duyệt thất bại');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mechanic-qc-orders'] });
            showToast('success', 'Đã duyệt kỹ thuật thành công');
        },
        onError: (error: any) => {
            showToast('error', error.message || 'Lỗi kết nối');
        }
    });

    const handleConfirm = (orderId: number, itemIds: number[]) => {
        confirmMutation.mutate({ orderId, itemIds });
    };

    if (authStatus === 'loading' || isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <DashboardLayout title="Duyệt kỹ thuật" subtitle="Kiểm soát chất lượng và xác nhận hạng mục phát sinh">
            <div className="max-w-6xl mx-auto space-y-6 pb-20">
                
                {/* Stats Header */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-fit mb-4">
                    <div className="px-5 border-r border-slate-100 text-center">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Cần xử lý</p>
                        <p className="text-2xl font-black text-amber-600 leading-none">{orders.length}</p>
                    </div>
                    <div className="px-5 text-center flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-sm font-bold text-slate-600">Trình trạng: Theo dõi thực tế</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-20 text-center shadow-sm">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                            <CheckCircle size={40} className="text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Hồ sơ đã được làm sạch</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto italic">Tất cả các hạng mục phát sinh đã được xử lý hoặc chưa có yêu cầu mới từ đội thợ.</p>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {orders.map((order: any) => (
                            <div key={order.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                {/* Header */}
                                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                                                    <Car size={18} />
                                                </div>
                                                <span className="text-2xl font-black text-slate-900 tracking-widest pt-1">{order.plateNumber}</span>
                                            </div>
                                            <span className="text-[10px] font-monospace text-slate-400 font-bold ml-11">#{order.id}</span>
                                        </div>

                                        <div className="hidden sm:flex items-center gap-6 border-l border-slate-200 pl-8">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 leading-none">Chủ xe</span>
                                                <span className="text-sm font-bold text-slate-700">{order.customerName}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 leading-none">Ngày lập</span>
                                                <span className="text-sm font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Link 
                                        href={`/mechanic/qc/${order.id}`}
                                        className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors"
                                    >
                                        Chi tiết <ChevronRight size={14} />
                                    </Link>
                                </div>

                                {/* Items List */}
                                <div className="p-8">
                                    <div className="grid gap-4">
                                        {order.items.filter((i: any) => i.itemStatus === 'CHO_KY_THUAT_DUYET').map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-black text-slate-800">
                                                        {item.quantity}
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-900 font-bold text-base tracking-tight">{item.productName}</div>
                                                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Thợ báo: {item.proposedByName}</span>
                                                    </div>
                                                </div>
                                                <AlertCircle size={20} className="text-slate-300" />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                                        <p className="text-[11px] text-slate-400 italic max-w-sm">
                                            * Xác nhận rằng các hạng mục trên đã được kiểm tra kỹ thuật thực tế.
                                        </p>
                                        <button 
                                            onClick={() => handleConfirm(order.id, order.items.filter((i: any) => i.itemStatus === 'CHO_KY_THUAT_DUYET').map((i: any) => i.id))}
                                            disabled={confirmMutation.isPending && confirmMutation.variables?.orderId === order.id}
                                            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/10 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            {confirmMutation.isPending && confirmMutation.variables?.orderId === order.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                            {confirmMutation.isPending && confirmMutation.variables?.orderId === order.id ? "Đang xử lý..." : "Duyệt nhanh toàn bộ"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
