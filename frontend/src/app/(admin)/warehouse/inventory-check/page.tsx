'use client';

import { Suspense, useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DashboardLayout } from '@/modules/common/components/layout';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { 
    Search, 
    RefreshCw, 
    Save, 
    AlertCircle, 
    History, 
    Package, 
    CheckCircle2, 
    AlertTriangle,
    ArrowUpDown,
    Check
} from 'lucide-react';
import { adjustStock } from '@/modules/inventory/warehouse';
import { useConfirm } from '@/modules/shared/components/ui/ConfirmModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/modules/shared/components/ui/button';
import { Input } from '@/modules/shared/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

type Product = {
    id: number;
    code: string;
    name: string;
    price: number;
    stock: number;
    minStock: number;
};

export default function InventoryCheckPage() {
    return (
        <DashboardLayout title="Kiểm kê kho" subtitle="Đối soát tồn kho thực tế và hệ thống">
            <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>}>
                <InventoryCheckContent />
            </Suspense>
        </DashboardLayout>
    );
}

function InventoryCheckContent() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    // @ts-ignore
    const token = session?.user?.accessToken;

    const [searchTerm, setSearchTerm] = useState('');
    const [actuals, setActuals] = useState<Record<number, number>>({});
    const [reasons, setReasons] = useState<Record<number, string>>({});
    const confirm = useConfirm();
    const parentRef = useRef<HTMLDivElement>(null);

    const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
        queryKey: ['inventory-check-products'],
        queryFn: () => api.get('/inventory-check/products', token),
        enabled: !!token
    });

    const filteredProducts = products.filter(p =>
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const rowVirtualizer = useVirtualizer({
        count: filteredProducts.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 64,
        overscan: 10,
    });

    const adjustMutation = useMutation({
        mutationFn: ({ id, actual, reason }: { id: number, actual: number, reason: string }) => 
            adjustStock(id, actual, reason),
        onSuccess: (res, variables) => {
            if (res.success) {
                toast.success('Đã cập nhật tồn kho thành công');
                queryClient.invalidateQueries({ queryKey: ['inventory-check-products'] });
                setActuals(prev => {
                    const n = { ...prev };
                    delete n[variables.id];
                    return n;
                });
                setReasons(prev => {
                    const n = { ...prev };
                    delete n[variables.id];
                    return n;
                });
            } else {
                toast.error(res.error || 'Lỗi điều chỉnh');
            }
        },
        onError: () => {
            toast.error('Lỗi kết nối máy chủ');
        }
    });

    const handleAdjust = async (p: Product) => {
        const actual = actuals[p.id];
        const reason = reasons[p.id];

        if (actual === undefined || actual === p.stock) {
            toast.error('Số lượng thực tế chưa thay đổi');
            return;
        }

        if (!reason || reason.trim().length < 5) {
            toast.error('Vui lòng nhập lý do điều chỉnh (tối thiểu 5 ký tự)');
            return;
        }

        const confirmed = await confirm({
            title: 'Xác nhận điều chỉnh',
            message: `Bạn đang điều chỉnh tồn kho cho ${p.name} (${p.code}).\n\nHệ thống: ${p.stock}\nThực tế: ${actual}\nChênh lệch: ${actual - p.stock > 0 ? '+' : ''}${actual - p.stock}\nLý do: ${reason}`,
            type: 'warning',
            confirmText: 'Xác nhận thay đổi'
        });
        if (!confirmed) return;

        adjustMutation.mutate({ id: p.id, actual, reason });
    };

    const hasChanges = Object.keys(actuals).length > 0;
    const processingId = adjustMutation.isPending ? (adjustMutation.variables as any)?.id : null;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Tìm nhanh phụ tùng..."
                            className="pl-10 h-10 border-none bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading} className="h-10 w-10">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                
                <div className="bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <ArrowUpDown className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-blue-100">Đang chỉnh sửa</p>
                            <p className="text-xl font-black">{Object.keys(actuals).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                <div className="border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        DANH SÁCH PHỤ TÙNG ({filteredProducts.length})
                    </h3>
                    {hasChanges && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wider">
                            Chưa lưu thay đổi
                        </span>
                    )}
                </div>

                <div 
                    ref={parentRef}
                    className="h-[calc(100vh-320px)] overflow-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                            <RefreshCw className="w-8 h-8 animate-spin" />
                            <p className="text-sm font-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize() + 44}px`,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 hidden md:table-header-group">
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                        <th className="text-left px-6 py-3 w-[150px]">Mã VT</th>
                                        <th className="text-left px-6 py-3">Tên Phụ Tùng</th>
                                        <th className="px-6 py-3 w-32">Hệ Thống</th>
                                        <th className="px-6 py-3 w-32">Thực Tế</th>
                                        <th className="px-6 py-3 w-64">Lý Do</th>
                                        <th className="text-right px-6 py-3 w-32">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                        const p = filteredProducts[virtualRow.index];
                                        const actual = actuals[p.id];
                                        const reason = reasons[p.id] || '';
                                        const diff = actual !== undefined ? actual - p.stock : 0;
                                        const hasDiff = diff !== 0 && actual !== undefined;
                                        const isProcessing = processingId === p.id;

                                        return (
                                            <tr 
                                                key={p.id}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: `${virtualRow.size}px`,
                                                    transform: `translateY(${virtualRow.start + 44}px)`,
                                                }}
                                                className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-50 dark:border-slate-800/50 ${hasDiff ? 'bg-amber-50/20 dark:bg-amber-900/5' : ''}`}
                                            >
                                                <td className="px-6 py-2 align-middle">
                                                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                        {p.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-2 align-middle">
                                                    <div className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate max-w-md">
                                                        {p.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-2 align-middle text-center">
                                                    <span className="font-black text-slate-700 dark:text-slate-200 text-base">
                                                        {p.stock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-2 align-middle">
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            className={`h-9 text-center font-bold text-sm ${hasDiff ? 'border-amber-500 focus-visible:ring-amber-500 bg-amber-50 dark:bg-amber-900/20' : ''}`}
                                                            placeholder={p.stock.toString()}
                                                            value={actual !== undefined ? actual : ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === '') {
                                                                    setActuals(prev => {
                                                                        const n = { ...prev };
                                                                        delete n[p.id];
                                                                        return n;
                                                                    });
                                                                } else {
                                                                    setActuals(prev => ({ ...prev, [p.id]: parseInt(val) }));
                                                                }
                                                            }}
                                                        />
                                                        {hasDiff && (
                                                            <div className={`absolute -right-12 top-1/2 -translate-y-1/2 font-black text-xs ${diff > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {diff > 0 ? '+' : ''}{diff}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-2 align-middle">
                                                    <Input
                                                        placeholder="Nhập lý do..."
                                                        className="h-9 text-xs focus-visible:ring-blue-500"
                                                        value={reason}
                                                        onChange={(e) => setReasons(prev => ({ ...prev, [p.id]: e.target.value }))}
                                                        disabled={actual === undefined || actual === p.stock}
                                                    />
                                                </td>
                                                <td className="px-6 py-2 align-middle text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAdjust(p)}
                                                        disabled={!hasDiff || !reason || isProcessing}
                                                        className={`h-9 px-4 font-bold rounded-lg transition-all ${
                                                            hasDiff && reason 
                                                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:scale-[1.02]' 
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                        }`}
                                                    >
                                                        {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
                                                        {isProcessing ? '' : 'Lưu'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions Float */}
            <div className="fixed bottom-6 right-6 flex gap-3 shadow-2xl rounded-full bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 z-50">
                <Button variant="ghost" className="rounded-full w-12 h-12 p-0 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <History className="w-5 h-5" />
                </Button>
                <Link href="/warehouse/inventory">
                    <Button variant="outline" className="rounded-full shadow-sm">
                        Quay lại kho
                    </Button>
                </Link>
            </div>
        </div>
    );
}
