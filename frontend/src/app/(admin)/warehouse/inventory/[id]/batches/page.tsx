'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/modules/common/components/layout';
import { Button } from '@/modules/shared/components/ui/button';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/utils';
import {
    ChevronLeft, Package, Clock, ArrowDownCircle,
    ArrowUpCircle, AlertTriangle, Loader2, Trash2,
    Calendar, User, History, Layers
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Batch {
    id: number;
    importDate: string;
    expiryDate: string;
    initialQty: number;
    remainingQty: number;
    supplier: string;
}

interface Movement {
    id: number;
    date: string;
    action: string;
    quantity: number;
    reason: string;
    user: string;
}

// Helper to handle both flat and wrapped (OData/Custom) responses
const unwrap = (res: any) => {
    if (!res) return null;
    if (res.value !== undefined && Array.isArray(res.value)) return res.value;
    if (res.value !== undefined) return res.value;
    if (res.items !== undefined && Array.isArray(res.items)) return res.items;
    return res;
};

export default function BatchDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const productId = params.id as string;
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'batches' | 'movements'>('batches');
    
    // @ts-ignore
    const token = session?.user?.accessToken;

    const { data: product, isLoading: loadingProduct } = useQuery({
        queryKey: ['warehouse-product', productId],
        queryFn: async () => {
            const res = await api.get(`/warehouse/inventory/product/${productId}`, token);
            return unwrap(res);
        },
        enabled: !!token && !!productId
    });

    const { data: batches = [], isLoading: loadingBatches } = useQuery({
        queryKey: ['warehouse-batches', productId],
        queryFn: async () => {
            const res = await api.get(`/warehouse/inventory/${productId}/batches`, token);
            const data = unwrap(res);
            return Array.isArray(data) ? data : [];
        },
        enabled: !!token && !!productId
    });

    const { data: movements = [], isLoading: loadingMovements } = useQuery({
        queryKey: ['warehouse-movements', productId],
        queryFn: async () => {
            const res = await api.get(`/warehouse/inventory/${productId}/movements`, token);
            const data = unwrap(res);
            return Array.isArray(data) ? data : [];
        },
        enabled: !!token && !!productId
    });

    const disposeMutation = useMutation({
        mutationFn: (batchId: number) => api.post(`/warehouse/inventory/batch/${batchId}/dispose`, {}, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouse-product', productId] });
            queryClient.invalidateQueries({ queryKey: ['warehouse-batches', productId] });
            queryClient.invalidateQueries({ queryKey: ['warehouse-movements', productId] });
            showToast('success', 'Thanh lý lô hàng thành công');
        },
        onError: () => {
            showToast('error', 'Thanh lý thất bại');
        }
    });

    const handleDispose = (batchId: number) => {
        if (!confirm('Xác nhận thanh lý lô hàng hết hạn này?')) return;
        disposeMutation.mutate(batchId);
    };

    const loading = loadingProduct || loadingBatches || loadingMovements;

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'NHAP_KHO': return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">NHẬP KHO</span>;
            case 'SUA_CHUA': return <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">XUẤT SỬA CHỮA</span>;
            case 'HUY_HANG': return <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">THANH LÝ</span>;
            case 'DIEU_CHINH': return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">ĐIỀU CHỈNH</span>;
            case 'HOAN_NHAP': return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-bold">HOÀN NHẬP</span>;
            default: return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">{action}</span>;
        }
    };

    if (loading && !product) {
        return (
            <DashboardLayout title="Chi tiết lô hàng">
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-600 mb-2" />
                    <p className="text-slate-500">Đang tải dữ liệu...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Chi tiết lô & Biến động"
            subtitle={product ? `${product.name} (${product.code})` : ""}
        >
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Quay lại
                    </Button>
                </div>

                {/* Product Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-wrap gap-8 items-center transition-colors">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{product?.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">{product?.code}</p>
                    </div>
                    <div className="ml-auto flex gap-10">
                        <div className="text-center">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Tổng tồn kho</p>
                            <p className={`text-2xl font-black ${product?.stock <= (product?.minStock || 5) ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'}`}>
                                {product?.stock}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Giá bán</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                                {formatCurrency(product?.price)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('batches')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'batches'
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                            }`}
                    >
                        <Layers className="w-4 h-4" />
                        Danh sách lô hàng ({batches.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('movements')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'movements'
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                            }`}
                    >
                        <History className="w-4 h-4" />
                        Lịch sử biến động ({movements.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    {activeTab === 'batches' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Mã lô</th>
                                        <th className="px-6 py-4">Ngày nhập</th>
                                        <th className="px-6 py-4">Hạn sử dụng</th>
                                        <th className="px-6 py-4 text-right">Tồn kho lô</th>
                                        <th className="px-6 py-4 text-center">Trạng thái</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {batches.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Không có lô hàng nào.</td>
                                        </tr>
                                    ) : (
                                        batches.map((batch: any) => {
                                            const expiryDate = new Date(batch.expiryDate);
                                            const today = new Date();
                                            const oneMonthFromNow = new Date();
                                            oneMonthFromNow.setMonth(today.getMonth() + 1);
                                            const isExpired = expiryDate < today;
                                            const isNear = expiryDate < oneMonthFromNow && !isExpired;

                                            return (
                                                <tr key={batch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">LÔ#{batch.id}</td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{new Date(batch.importDate).toLocaleDateString('vi-VN')}</td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{new Date(batch.expiryDate).toLocaleDateString('vi-VN')}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-slate-100">{batch.remainingQty}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        {isExpired ? (
                                                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">HẾT HẠN</span>
                                                        ) : isNear ? (
                                                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">SẮP HẾT HẠN</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">TỐT</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {isExpired && batch.remainingQty > 0 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleDispose(batch.id)}
                                                                disabled={disposeMutation.isPending && disposeMutation.variables === batch.id}
                                                            >
                                                                {disposeMutation.isPending && disposeMutation.variables === batch.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                <span className="ml-1.5 hidden md:inline">Thanh lý</span>
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Thời gian</th>
                                        <th className="px-6 py-4">Hành động</th>
                                        <th className="px-6 py-4 text-right">Số lượng</th>
                                        <th className="px-6 py-4">Nội dung</th>
                                        <th className="px-6 py-4">Người thực hiện</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {movements.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Chưa có lịch sử biến động.</td>
                                        </tr>
                                    ) : (
                                        movements.map((move: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(move.date).toLocaleDateString('vi-VN')}</span>
                                                        <span className="text-[10px] text-slate-500">{new Date(move.date).toLocaleTimeString('vi-VN')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{getActionBadge(move.action)}</td>
                                                <td className="px-6 py-4 text-right font-mono">
                                                    <span className={`font-bold ${move.quantity > 0 ? 'text-green-600' : move.quantity < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                                                        {move.quantity > 0 ? `+${move.quantity}` : move.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={move.reason}>
                                                    {move.reason}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                                            {move.user?.charAt(0) || "U"}
                                                        </div>
                                                        <span className="truncate">{move.user}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
